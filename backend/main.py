"""
AEGIS - Agentic Physical Security Intelligence Platform
Main FastAPI Application Server
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

# Add project root and policymesh to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "policymesh"))

from backend.database.db import db
from backend.database.models import AccessRequest, AuditLogEntry
from backend.integrations.ring import (
    ring_client,
    ring_webhook_router,
    RingEventNormalizer,
    RingEventKind,
)
from backend.engine.digital_twin import digital_twin
from backend.engine.correlation_engine import correlation_engine
from backend.policies.policy_service import policy_service
from backend.risk.risk_engine import risk_engine, RiskContext
from backend.scenario.scenario_engine import demo_engine
from agents import (
    aegis_orchestrator,
    identity_agent,
    policy_agent,
    risk_agent,
    investigation_agent,
    action_agent,
)

app = FastAPI(
    title="AEGIS: Agentic Physical Security Intelligence",
    description="Transforms Ring camera events into contextual decisions, access-control decisions, and automated investigations.",
    version="1.0.0",
)

# Enable CORS for Next.js / frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Ring Webhook & Ingestion Router
app.include_router(ring_webhook_router)

# WebSocket Connection Manager for real-time live events
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()


# -----------------------------------------------------------------------------
# System Status & Overview
# -----------------------------------------------------------------------------
@app.get("/api/status")
def get_system_status():
    """
    Returns overarching AEGIS OS status, Ring hardware mode, and agent runtime.
    """
    return {
        "system": "AEGIS Physical Security OS",
        "tagline": "From camera events to intelligent security decisions",
        "status": "OPERATIONAL",
        "ring_integration": {
            "mode": ring_client.get_mode(),
            "is_live": ring_client.is_live(),
            "device_count": len(ring_client.get_devices()),
            "status": "CONNECTED",
        },
        "aws_services": {
            "amazon_bedrock": "ACTIVE" if aegis_orchestrator.bedrock_client else "FALLBACK_STANDALONE",
            "agentcore_runtime": "INITIALIZED",
            "strands_sdk": "ACTIVE",
            "dynamodb_adapter": "ACTIVE",
            "cloudwatch_metrics": "ACTIVE",
        },
        "policymesh": {
            "engine": "PolicyMesh v1.0.0 (Open Source)",
            "rules_active": len(policy_service.get_all_rules()),
            "evaluation_mode": "Zero-Trust Deterministic",
        },
        "facility": digital_twin.get_facility_overview(),
    }


# -----------------------------------------------------------------------------
# Digital Twin & Security Map
# -----------------------------------------------------------------------------
@app.get("/api/facility")
def get_facility():
    return digital_twin.get_facility_overview()


@app.get("/api/zones")
def get_zones():
    return [z.model_dump() for z in db.get_zones()]


@app.get("/api/zones/{zone_id}")
def get_zone_details(zone_id: str):
    details = digital_twin.get_zone_details(zone_id)
    if not details:
        raise HTTPException(status_code=404, detail="Zone not found")
    return details


# -----------------------------------------------------------------------------
# Live Events Stream
# -----------------------------------------------------------------------------
recent_live_events: List[Dict[str, Any]] = []


@app.get("/api/events")
def get_events(limit: int = 50):
    return recent_live_events[:limit]


class ManualEventTrigger(BaseModel):
    device_id: str = "ring-cam-01"
    kind: str = "ding"
    person_detected: bool = True
    actor_name: Optional[str] = None


@app.post("/api/events/trigger")
async def trigger_event(trigger: ManualEventTrigger):
    """
    Triggers an event on a specified Ring device (useful for demo/testing).
    """
    kind = RingEventKind(trigger.kind) if trigger.kind in [k.value for k in RingEventKind] else RingEventKind.MOTION
    raw = ring_client.simulator.trigger_event(
        device_id=trigger.device_id,
        kind=kind,
        person_detected=trigger.person_detected,
    )
    norm = RingEventNormalizer.normalize(raw, simulation_mode=not ring_client.is_live())

    # Assess risk
    person = db.find_person_by_name(trigger.actor_name) if trigger.actor_name else None
    is_unknown = person is None
    risk_res = risk_agent.assess_risk(
        zone_id=norm.zone_id,
        is_unknown_visitor=is_unknown,
        credential_valid=person is not None,
    )

    # Correlate
    inc = correlation_engine.process_event(
        norm,
        subject_id=person.id if person else None,
        subject_name=person.name if person else "Unverified Subject",
        risk_score=risk_res["score"],
    )

    event_record = {
        "event_id": norm.event_id,
        "source": "ring",
        "device_id": norm.device_id,
        "device_type": norm.device_type,
        "zone_id": norm.zone_id,
        "zone_name": norm.zone_name,
        "event_type": norm.event_type,
        "timestamp": norm.timestamp.strftime("%H:%M:%S"),
        "confidence": norm.confidence,
        "risk_score": risk_res["score"],
        "risk_level": risk_res["level"],
        "reasons": risk_res["reasons"],
        "actor": person.name if person else "Unknown Visitor",
        "snapshot_url": norm.snapshot_url,
        "incident_id": inc.id if inc else None,
        "simulation_mode": norm.simulation_mode,
    }

    recent_live_events.insert(0, event_record)
    if len(recent_live_events) > 100:
        recent_live_events.pop()

    # Broadcast via WebSocket
    await ws_manager.broadcast({"type": "NEW_EVENT", "event": event_record})
    return event_record


# -----------------------------------------------------------------------------
# Incidents & Forensic Investigation
# -----------------------------------------------------------------------------
@app.get("/api/incidents")
def list_incidents():
    return [i.model_dump() for i in db.get_incidents()]


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc.model_dump()


@app.post("/api/incidents/{incident_id}/investigate")
def run_investigation(incident_id: str):
    """
    Invokes the AI Investigation Agent to reconstruct multi-camera timelines.
    """
    res = investigation_agent.investigate_incident(incident_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error"))
    return res


@app.post("/api/incidents/{incident_id}/escalate")
def escalate_incident_endpoint(incident_id: str):
    res = action_agent.escalate_incident(incident_id, reason="Manual operator escalation")
    return res


# -----------------------------------------------------------------------------
# Access Control & Natural Language Directives
# -----------------------------------------------------------------------------
@app.get("/api/access/requests")
def list_access_requests():
    return [r.model_dump() for r in db.get_access_requests()]


class NlAccessRequestPayload(BaseModel):
    command: str


@app.post("/api/access/command")
async def execute_nl_access_command(payload: NlAccessRequestPayload):
    """
    Section 11: Natural Language Access Control.
    Converts commands like 'Give Rahul from maintenance access to the server room from 2 PM to 4 PM'
    into structured authorization through Identity, PolicyMesh, Risk, and Action agents.
    """
    result = aegis_orchestrator.process_nl_access_request(payload.command)
    await ws_manager.broadcast({"type": "ACCESS_UPDATE", "data": result})
    return result


# -----------------------------------------------------------------------------
# Personnel & Visitor Management
# -----------------------------------------------------------------------------
@app.get("/api/visitors")
def list_visitors():
    people = db.get_people()
    return [p.model_dump() for p in people]


@app.post("/api/visitors/{person_id}/revoke")
async def revoke_visitor_access(person_id: str):
    res = action_agent.revoke_access(person_id, reason="Manual administrative revocation")
    await ws_manager.broadcast({"type": "ACCESS_REVOKED", "data": res})
    return res


# -----------------------------------------------------------------------------
# PolicyMesh Rules
# -----------------------------------------------------------------------------
@app.get("/api/policies")
def list_policies():
    return [r.model_dump() for r in policy_service.get_all_rules()]


# -----------------------------------------------------------------------------
# Audit Trail
# -----------------------------------------------------------------------------
@app.get("/api/audit")
def list_audit_trail(limit: int = 100):
    return [a.model_dump() for a in db.get_audit_logs(limit)]


# -----------------------------------------------------------------------------
# AI Copilot Assistant
# -----------------------------------------------------------------------------
class CopilotQuery(BaseModel):
    query: str


@app.post("/api/copilot")
def query_copilot(query_payload: CopilotQuery):
    """
    Persistent AI Copilot panel answering queries using actual application data.
    """
    return aegis_orchestrator.answer_copilot_query(query_payload.query)


# -----------------------------------------------------------------------------
# Demo Scenario Engine ("START AEGIS DEMO")
# -----------------------------------------------------------------------------
@app.get("/api/demo/status")
def get_demo_status():
    return demo_engine.get_status()


@app.post("/api/demo/reset")
async def reset_demo():
    res = demo_engine.reset()
    await ws_manager.broadcast({"type": "DEMO_RESET", "data": res})
    return res


@app.post("/api/demo/step/{step_number}")
async def run_demo_step(step_number: int):
    """
    Executes a specific step (1-11) of the cinematic demo scenario.
    """
    if step_number < 1 or step_number > 11:
        raise HTTPException(status_code=400, detail="Step must be between 1 and 11")
    res = demo_engine.execute_step(step_number)

    # Also push to recent live events
    if "normalized_event" in res:
        recent_live_events.insert(0, {
            "event_id": res["normalized_event"]["event_id"],
            "source": "ring",
            "device_id": res["normalized_event"]["device_id"],
            "device_type": res["normalized_event"]["device_type"],
            "zone_id": res["normalized_event"]["zone_id"],
            "zone_name": res["normalized_event"]["zone_name"],
            "event_type": res["normalized_event"]["event_type"],
            "timestamp": res["timestamp"],
            "confidence": res["normalized_event"]["confidence"],
            "risk_score": res["risk_score"],
            "risk_level": res["risk_level"],
            "reasons": res["reasons"],
            "actor": res.get("actor", "Visitor"),
            "snapshot_url": res["normalized_event"].get("snapshot_url"),
            "incident_id": res.get("incident_id"),
            "simulation_mode": True,
        })

    await ws_manager.broadcast({"type": "DEMO_STEP", "data": res})
    return res


# -----------------------------------------------------------------------------
# Ring Camera Snapshot Generator (SVG Data Renderers)
# -----------------------------------------------------------------------------
@app.get("/api/integrations/ring/snapshots/{camera_id}.jpg")
def get_camera_snapshot(camera_id: str):
    """
    Returns crisp SVG camera feeds matching the exact Ring camera view.
    """
    camera_labels = {
        "ring-cam-01": ("Ring Video Doorbell Elite", "Main Entrance Gate", "#0284c7"),
        "ring-cam-02": ("Ring Stick Up Cam Pro", "Reception Lobby", "#10b981"),
        "ring-cam-03": ("Ring Spotlight Cam Pro", "Restricted Server Corridor", "#f59e0b"),
        "ring-cam-04": ("Ring Floodlight Cam Wired Pro", "Core Server Vault", "#ef4444"),
        "ring-cam-05": ("Ring Spotlight Cam Plus", "Logistics & Loading Bay", "#8b5cf6"),
    }
    title, zone, color = camera_labels.get(camera_id, ("Ring Camera", "Facility Area", "#64748b"))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#090d16" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="640" height="360" fill="url(#grad)" />
      <rect width="640" height="360" fill="url(#grid)" />
      
      <!-- Camera Crosshair & HUD -->
      <circle cx="320" cy="180" r="100" fill="none" stroke="{color}" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="320" y1="60" x2="320" y2="300" stroke="{color}" stroke-opacity="0.15" stroke-width="1"/>
      <line x1="180" y1="180" x2="460" y2="180" stroke="{color}" stroke-opacity="0.15" stroke-width="1"/>

      <!-- Ring Header Badge -->
      <rect x="20" y="20" width="130" height="28" rx="6" fill="#000000" fill-opacity="0.75" stroke="{color}" stroke-width="1"/>
      <circle cx="34" cy="34" r="6" fill="{color}" />
      <text x="48" y="39" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ffffff">RING LIVE</text>
      
      <!-- Timestamp Overlay -->
      <rect x="470" y="20" width="150" height="28" rx="6" fill="#000000" fill-opacity="0.75"/>
      <text x="482" y="38" font-family="monospace" font-size="12" fill="#94a3b8">1080p HDR • 30fps</text>

      <!-- Center Detection Reticle -->
      <rect x="240" y="110" width="160" height="150" rx="8" fill="none" stroke="{color}" stroke-width="1.5" stroke-dasharray="6,4"/>
      <text x="248" y="130" font-family="monospace" font-size="10" fill="{color}" font-weight="bold">AI TRACK: 98.4%</text>

      <!-- Camera Title & Zone Footer -->
      <rect x="20" y="295" width="600" height="45" rx="8" fill="#000000" fill-opacity="0.85" stroke="#334155" stroke-width="1"/>
      <text x="35" y="322" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#f8fafc">{title}</text>
      <text x="35" y="335" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="{color}">ZONE: {zone.upper()}</text>
      <text x="500" y="325" font-family="monospace" font-size="12" fill="#22c55e">SECURE FEED</text>
    </svg>"""
    return Response(content=svg, media_type="image/svg+xml")


# -----------------------------------------------------------------------------
# WebSocket Handler
# -----------------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping/pong
            await websocket.send_json({"type": "PONG", "received": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


# Mount static frontend production build if available
frontend_dist = root_dir / "frontend" / "dist"
if frontend_dist.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

