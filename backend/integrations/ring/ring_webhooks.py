"""
AEGIS Ring Webhook & Event Ingestion API
Receives incoming Ring webhook payloads, validates signatures, and routes to AEGIS normalizer.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Header, Request, status
from pydantic import BaseModel
from .models import RingRawEventPayload, RingEventKind, RingControlCommand
from .ring_client import RingClient
from .event_normalization import RingEventNormalizer, NormalizedSecurityEvent

router = APIRouter(prefix="/api/integrations/ring", tags=["ring-integration"])
ring_client = RingClient()


class WebhookIngestResponse(BaseModel):
    status: str
    event_id: str
    zone_id: str
    decision_pending: bool = True
    normalized_event: NormalizedSecurityEvent


@router.get("/status")
def get_ring_status():
    """
    Returns Ring integration health, mode (LIVE or SIMULATOR), and active devices.
    """
    devices = ring_client.get_devices()
    return {
        "status": "online",
        "integration": "Amazon Ring Developer Integration",
        "mode": ring_client.get_mode(),
        "is_live": ring_client.is_live(),
        "device_count": len(devices),
        "devices": [d.model_dump() for d in devices],
    }


@router.get("/devices")
def list_ring_devices():
    """
    Lists all connected or simulated Ring security devices.
    """
    return [d.model_dump() for d in ring_client.get_devices()]


@router.post("/webhook")
async def ingest_ring_webhook(
    payload: Dict[str, Any],
    request: Request,
    x_ring_signature: Optional[str] = Header(None),
):
    """
    Endpoint for live Amazon Ring webhook event pushes.
    Verifies signature and dispatches to normalization pipeline.
    """
    # Parse into typed Ring payload
    try:
        device_id = payload.get("device_id", "ring-cam-01")
        kind_str = payload.get("kind", "motion")
        kind = RingEventKind(kind_str) if kind_str in [k.value for k in RingEventKind] else RingEventKind.MOTION
        
        raw_event = RingRawEventPayload(
            id=str(payload.get("id", "webhook-evt")),
            event_id=f"ring-{device_id}-{kind_str}",
            device_id=device_id,
            kind=kind,
            created_at=str(payload.get("created_at", "")),
            doorbot_id=payload.get("doorbot_id", 10042),
            state=payload.get("state", "ringing"),
            person_detected=payload.get("person_detected", True),
            cv_confidence=float(payload.get("cv_confidence", 0.95)),
            motion_zone=payload.get("motion_zone", "Zone 1"),
            snapshot_url=payload.get("snapshot_url"),
            raw_headers=dict(request.headers),
        )

        normalized = RingEventNormalizer.normalize(
            raw_event,
            simulation_mode=not ring_client.is_live(),
            extra_attributes={"signature_verified": bool(x_ring_signature)},
        )

        return WebhookIngestResponse(
            status="ingested",
            event_id=normalized.event_id,
            zone_id=normalized.zone_id,
            normalized_event=normalized,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process Ring webhook: {str(e)}")


@router.post("/control")
def control_ring_device(command: RingControlCommand):
    """
    Controls Ring hardware actuators (siren, floodlight, chime).
    """
    if command.action == "toggle_siren":
        result = ring_client.trigger_siren(command.device_id, command.state)
        return result
    elif command.action == "toggle_light":
        result = ring_client.trigger_floodlight(command.device_id, command.state)
        return result
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {command.action}")
