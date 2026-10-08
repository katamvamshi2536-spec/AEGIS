"""
AEGIS Multi-Camera Event Correlation Engine
Correlates discrete Ring camera events into contextual, multi-zone security incidents.
Prevents alert fatigue by synthesizing multi-sensor sequences into unified investigations.
"""

import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone, timedelta
from backend.integrations.ring.event_normalization import NormalizedSecurityEvent
from backend.database.models import Incident, IncidentSeverity, IncidentStatus
from backend.database.db import db

# Zone Spatial Adjacency Graph
FACILITY_TOPOLOGY: Dict[str, List[str]] = {
    "main_entrance": ["reception"],
    "reception": ["main_entrance", "server_room_corridor", "finance", "loading_bay"],
    "server_room_corridor": ["reception", "server_room"],
    "server_room": ["server_room_corridor"],
    "finance": ["reception"],
    "loading_bay": ["reception"],
}


class EventCorrelationEngine:
    """
    Ingests normalized Ring security events, performs spatial/temporal correlation,
    and binds related multi-camera activities into unified Incidents.
    """

    def __init__(self, time_window_seconds: int = 600):
        self.time_window = timedelta(seconds=time_window_seconds)
        self.recent_events: List[NormalizedSecurityEvent] = []
        self.active_tracks: Dict[str, Dict[str, Any]] = {}

    def process_event(
        self,
        event: NormalizedSecurityEvent,
        subject_id: Optional[str] = None,
        subject_name: Optional[str] = None,
        risk_score: int = 10,
        forced_incident_id: Optional[str] = None,
    ) -> Optional[Incident]:
        """
        Processes an incoming normalized Ring event.
        Returns an updated or newly created Incident if correlation conditions are met.
        """
        now = event.timestamp
        self.recent_events.append(event)
        # Prune old events beyond correlation window
        self.recent_events = [e for e in self.recent_events if now - e.timestamp <= self.time_window]

        track_key = subject_id or "unidentified_visitor_track"

        # Check existing active track or incident
        if track_key not in self.active_tracks:
            self.active_tracks[track_key] = {
                "events": [],
                "zones": set(),
                "devices": set(),
                "incident_id": None,
                "first_seen": now,
                "max_risk": risk_score,
            }

        track = self.active_tracks[track_key]
        track["events"].append(event)
        track["zones"].add(event.zone_id)
        track["devices"].add(event.device_id)
        track["max_risk"] = max(track["max_risk"], risk_score)

        # Check if this sequence warrants an Incident
        # Threshold: moving into restricted zones, repeated attempts, or risk >= 60
        is_restricted = event.zone_id in ["server_room_corridor", "server_room", "finance"]
        should_create_incident = (
            len(track["events"]) >= 3 or is_restricted or risk_score >= 60
        )

        if not should_create_incident:
            return None

        # Build / update incident
        incident_id = forced_incident_id or track["incident_id"] or "AE-1042"
        track["incident_id"] = incident_id

        # Determine severity
        max_r = track["max_risk"]
        if max_r >= 81:
            severity = IncidentSeverity.CRITICAL
        elif max_r >= 61:
            severity = IncidentSeverity.HIGH
        elif max_r >= 31:
            severity = IncidentSeverity.MEDIUM
        else:
            severity = IncidentSeverity.LOW

        # Generate Timeline
        timeline = []
        for idx, ev in enumerate(track["events"]):
            time_str = ev.timestamp.strftime("%H:%M:%S")
            desc = f"{ev.event_type.replace('_', ' ').title()} at {ev.zone_name}"
            if "access_attempt" in ev.event_type.lower():
                desc = f"Unauthorized access attempt at {ev.zone_name}"
            timeline.append({
                "step": idx + 1,
                "time": time_str,
                "zone_id": ev.zone_id,
                "zone_name": ev.zone_name,
                "device_id": ev.device_id,
                "device_type": ev.device_type,
                "description": desc,
                "confidence": ev.confidence,
                "snapshot_url": ev.snapshot_url,
            })

        # Synthesize Evidence items
        evidence = []
        for dev in track["devices"]:
            evidence.append({
                "type": "ring_camera_telemetry",
                "device_id": dev,
                "verified": True,
                "detail": f"Correlated motion & visual telemetry logged from {dev}",
            })
        if is_restricted:
            evidence.append({
                "type": "zone_boundary_breach",
                "detail": f"Unscheduled presence detected in secure zone: {event.zone_name}",
                "severity": "HIGH",
            })

        # Check existing or create new
        existing_incident = db.get_incident(incident_id)
        if existing_incident:
            existing_incident.risk_score = max_r
            existing_incident.severity = severity
            existing_incident.affected_zones = list(track["zones"])
            existing_incident.timeline = timeline
            existing_incident.evidence = evidence
            existing_incident.related_event_ids = [e.event_id for e in track["events"]]
            existing_incident.updated_at = now
            if max_r >= 81 and existing_incident.status != IncidentStatus.ESCALATED:
                existing_incident.status = IncidentStatus.ESCALATED
            db.update_incident(existing_incident)
            return existing_incident
        else:
            new_incident = Incident(
                id=incident_id,
                title=f"Multi-Camera Correlation: Unauthorized Movement to {event.zone_name}",
                severity=severity,
                risk_score=max_r,
                status=IncidentStatus.INVESTIGATING if max_r < 81 else IncidentStatus.ESCALATED,
                primary_zone_id=event.zone_id,
                affected_zones=list(track["zones"]),
                involved_person_id=subject_id,
                involved_person_name=subject_name or "Unverified Subject",
                timeline=timeline,
                evidence=evidence,
                related_event_ids=[e.event_id for e in track["events"]],
                ai_summary=(
                    f"Subject traversed {len(track['zones'])} facility zones across {len(track['devices'])} Ring devices. "
                    f"Elevated movement observed approaching {event.zone_name}."
                ),
                ai_recommendation="Dispatch security personnel and suspend temporary access.",
                recommended_actions=[
                    "Lock down Core Server Vault Smart Lock",
                    "Arm Ring Floodlight Cam siren (110dB)",
                    "Revoke temporary badge credentials",
                    "Alert on-duty security guard",
                ],
                created_at=now,
                updated_at=now,
            )
            db.add_incident(new_incident)
            return new_incident


correlation_engine = EventCorrelationEngine()
