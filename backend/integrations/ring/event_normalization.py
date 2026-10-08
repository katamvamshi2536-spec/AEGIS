"""
AEGIS Event Normalization
Transforms raw Ring camera & sensor event streams into canonical AEGIS Security Events.
"""

import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from .models import RingRawEventPayload, RingEventKind


class NormalizedSecurityEvent(BaseModel):
    """
    Standardized AEGIS security event consumed by the correlation engine,
    risk engine, policy agent, and digital twin state store.
    """
    event_id: str
    source: str = "ring"
    device_id: str
    device_type: str = "doorbell"
    zone_id: str
    zone_name: str
    event_type: str  # VISITOR_DETECTED, DOORBELL_RING, MOTION, PERSON, TAMPER, ACCESS_ATTEMPT
    confidence: float = 0.95
    person_detected: bool = False
    snapshot_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    simulation_mode: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)
    raw_payload: Optional[Dict[str, Any]] = None


# Device to Facility Zone Mapping
DEVICE_ZONE_MAP: Dict[str, Dict[str, str]] = {
    "ring-cam-01": {"zone_id": "main_entrance", "zone_name": "Main Entrance", "type": "doorbell_elite"},
    "ring-cam-02": {"zone_id": "reception", "zone_name": "Reception Lobby", "type": "stickup_cam_elite"},
    "ring-cam-03": {"zone_id": "server_room_corridor", "zone_name": "Restricted Server Corridor", "type": "spotlight_cam"},
    "ring-cam-04": {"zone_id": "server_room", "zone_name": "Core Server Vault", "type": "floodlight_cam"},
    "ring-cam-05": {"zone_id": "loading_bay", "zone_name": "Logistics & Loading Bay", "type": "spotlight_cam"},
}


class RingEventNormalizer:
    """
    Normalizes heterogeneous Ring API / Webhook payloads.
    """

    @staticmethod
    def normalize(
        payload: RingRawEventPayload,
        simulation_mode: bool = False,
        extra_attributes: Optional[Dict[str, Any]] = None,
    ) -> NormalizedSecurityEvent:
        mapping = DEVICE_ZONE_MAP.get(
            payload.device_id,
            {"zone_id": "unknown_zone", "zone_name": "Unmapped Zone", "type": "unknown_camera"},
        )

        # Map Ring Kind to AEGIS Canonical Event Type
        event_type_map = {
            RingEventKind.DING: "DOORBELL_RING",
            RingEventKind.MOTION: "MOTION_DETECTED",
            RingEventKind.PERSON_DETECTED: "PERSON_DETECTED",
            RingEventKind.TAMPER: "TAMPER_DETECTED",
            RingEventKind.ACCESS_ATTEMPT: "DOOR_ACCESS_ATTEMPT",
            RingEventKind.HEALTH: "DEVICE_HEALTH_UPDATE",
        }
        event_type = event_type_map.get(payload.kind, "SECURITY_EVENT")

        if payload.person_detected and payload.kind == RingEventKind.DING:
            event_type = "VISITOR_DETECTED"

        attrs = dict(extra_attributes or {})
        attrs.update({
            "motion_zone": payload.motion_zone,
            "doorbot_id": payload.doorbot_id,
            "battery_level": payload.battery_level,
            "firmware": payload.firmware,
        })

        return NormalizedSecurityEvent(
            event_id=f"AE-EVT-{uuid.uuid4().hex[:8].upper()}",
            source="ring",
            device_id=payload.device_id,
            device_type=mapping["type"],
            zone_id=mapping["zone_id"],
            zone_name=mapping["zone_name"],
            event_type=event_type,
            confidence=payload.cv_confidence,
            person_detected=payload.person_detected,
            snapshot_url=payload.snapshot_url,
            timestamp=datetime.now(timezone.utc),
            simulation_mode=simulation_mode,
            attributes=attrs,
            raw_payload=payload.model_dump(),
        )
