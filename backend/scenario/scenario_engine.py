"""
AEGIS Cinematic Demo Scenario Engine
Executes the scripted 11-step security incident replay.
Explicitly labeled as 'SIMULATION MODE' to ensure authentic differentiation from live Ring streams.
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.database.db import db
from backend.database.models import (
    Incident,
    IncidentSeverity,
    IncidentStatus,
    AuditLogEntry,
    AccessRequestStatus,
    CredentialStatus,
)
from backend.integrations.ring.ring_simulator import RingSimulatorAdapter
from backend.integrations.ring.models import RingEventKind
from backend.integrations.ring.event_normalization import RingEventNormalizer
from backend.engine.correlation_engine import correlation_engine
from backend.engine.digital_twin import digital_twin
from agents import (
    identity_agent,
    policy_agent,
    risk_agent,
    investigation_agent,
    action_agent,
)

simulator = RingSimulatorAdapter()


class DemoScenarioEngine:
    """
    Orchestrates the 11-step hackathon demo sequence:
    From routine Ring doorbell check-in to multi-camera anomaly correlation and autonomous threat revocation.
    """

    def __init__(self):
        self.current_step: int = 0
        self.is_running: bool = False
        self.mode_label: str = "SIMULATION MODE"
        self.step_history: List[Dict[str, Any]] = []
        self.target_incident_id: str = "AE-1042"

    def get_status(self) -> Dict[str, Any]:
        return {
            "current_step": self.current_step,
            "total_steps": 11,
            "is_running": self.is_running,
            "mode": self.mode_label,
            "incident_id": self.target_incident_id,
            "step_history": self.step_history,
        }

    def reset(self) -> Dict[str, Any]:
        self.current_step = 0
        self.is_running = False
        self.step_history = []
        # Reset zone risks
        for z in db.zones.values():
            z.current_risk = 12
        # Reset incident if existing
        if self.target_incident_id in db.incidents:
            del db.incidents[self.target_incident_id]
        correlation_engine.active_tracks.clear()
        correlation_engine.recent_events.clear()
        return {"status": "reset", "current_step": 0}

    def execute_step(self, step_number: int) -> Dict[str, Any]:
        """
        Executes a single step in the 11-step demo.
        """
        self.current_step = step_number
        now = datetime.now(timezone.utc)
        step_result: Dict[str, Any] = {
            "step": step_number,
            "timestamp": now.strftime("%H:%M:%S"),
            "mode": self.mode_label,
        }

        if step_number == 1:
            # STEP 1: Known employee detected at Main Entrance
            raw_event = simulator.trigger_event("ring-cam-01", RingEventKind.PERSON_DETECTED)
            norm_event = RingEventNormalizer.normalize(raw_event, simulation_mode=True)
            id_res = identity_agent.resolve_identity("Dr. Elena Vance")
            pol_res = policy_agent.evaluate_policy("emp-elena", "main_entrance", risk_score=5)
            
            step_result.update({
                "title": "STEP 1: Known Employee Detected",
                "summary": "Dr. Elena Vance (Head of AI, Clearance 5) authenticated at Main Entrance.",
                "zone": "Main Entrance (ring-cam-01)",
                "actor": "Dr. Elena Vance",
                "decision": "ALLOW",
                "risk_score": 5,
                "risk_level": "LOW",
                "reasons": ["✓ Verified employee badge", "✓ Routine operational arrival"],
                "normalized_event": norm_event.model_dump(),
            })
            digital_twin.move_person("emp-elena", "reception")
            db.update_zone_risk("main_entrance", 8)

        elif step_number == 2:
            # STEP 2: Unknown visitor arrives at Main Entrance
            raw_event = simulator.trigger_event("ring-cam-01", RingEventKind.DING)
            norm_event = RingEventNormalizer.normalize(raw_event, simulation_mode=True)
            id_res = identity_agent.resolve_identity(is_unknown=True)
            risk_res = risk_agent.assess_risk(
                zone_id="main_entrance",
                is_unknown_visitor=True,
                has_appointment=False,
                credential_valid=False,
            )

            step_result.update({
                "title": "STEP 2: Unknown Visitor Arrives",
                "summary": "Ring Video Doorbell Elite triggered by unknown guest without pre-registered credential.",
                "zone": "Main Entrance (ring-cam-01)",
                "actor": "Unverified Visitor",
                "decision": "HOLD",
                "risk_score": 45,
                "risk_level": "MEDIUM",
                "reasons": [
                    "✓ Unknown visitor / unverified biometric signature",
                    "✓ No scheduled appointment found in visitor calendar",
                ],
                "normalized_event": norm_event.model_dump(),
            })
            db.update_zone_risk("main_entrance", 45)

        elif step_number == 3:
            # STEP 3: AI evaluates visitor & queues approval
            step_result.update({
                "title": "STEP 3: AI Evaluates Visitor Context",
                "summary": "PolicyMesh enforces Zero Trust: Direct entry denied. System notifies Host (Dr. Elena Vance).",
                "zone": "Main Entrance (ring-cam-01)",
                "decision": "REQUEST_APPROVAL",
                "risk_score": 42,
                "risk_level": "MEDIUM",
                "reasons": [
                    "✓ Zero Trust policy prevents automatic badge provisioning",
                    "✓ Awaiting host sponsor approval",
                ],
            })

        elif step_number == 4:
            # STEP 4: Host approves temporary access
            action_res = action_agent.create_temporary_access(
                person_id="vis-vikram",
                resource_id="reception",
                duration_minutes=60,
                approver="Dr. Elena Vance (Host)",
                reason="Temporary reception access for scheduled discussion",
            )
            step_result.update({
                "title": "STEP 4: Host Approves Temporary Access",
                "summary": "Host Dr. Elena Vance issued a 60-minute reception visitor pass.",
                "zone": "Main Entrance -> Reception",
                "decision": "ALLOW (TEMPORARY PASS)",
                "risk_score": 25,
                "risk_level": "LOW",
                "reasons": ["✓ Approved by authorized host", "✓ Temporary digital credential active (60m TTL)"],
                "action": action_res,
            })
            db.update_zone_risk("main_entrance", 20)

        elif step_number == 5:
            # STEP 5: Visitor enters Reception
            raw_event = simulator.trigger_event("ring-cam-02", RingEventKind.MOTION)
            norm_event = RingEventNormalizer.normalize(raw_event, simulation_mode=True)
            digital_twin.move_person("vis-vikram", "reception")

            step_result.update({
                "title": "STEP 5: Visitor Enters Reception",
                "summary": "Reception Stick Up Cam Pro verifies visitor entry within authorized bounds.",
                "zone": "Reception Lobby (ring-cam-02)",
                "actor": "Vikram Patel",
                "decision": "ALLOW",
                "risk_score": 22,
                "risk_level": "LOW",
                "reasons": ["✓ Authorized zone", "✓ Active temporary pass"],
                "normalized_event": norm_event.model_dump(),
            })
            db.update_zone_risk("reception", 22)

        elif step_number == 6:
            # STEP 6: Visitor moves toward restricted area
            raw_event = simulator.trigger_event("ring-cam-03", RingEventKind.MOTION)
            norm_event = RingEventNormalizer.normalize(raw_event, simulation_mode=True)
            digital_twin.move_person("vis-vikram", "server_room_corridor")
            risk_res = risk_agent.assess_risk(
                zone_id="server_room_corridor",
                abnormal_movement=True,
                credential_valid=True,
            )

            step_result.update({
                "title": "STEP 6: Traversal Toward Restricted Corridor",
                "summary": "Ring Spotlight Cam Pro detects visitor deviating from authorized Reception zone into Server Corridor.",
                "zone": "Restricted Server Corridor (ring-cam-03)",
                "actor": "Vikram Patel",
                "decision": "ANOMALY_FLAGGED",
                "risk_score": 62,
                "risk_level": "HIGH",
                "reasons": [
                    "✓ Anomaly: Unauthorized trajectory away from authorized reception route",
                    "✓ Confidential transitional zone clearance missing",
                ],
                "normalized_event": norm_event.model_dump(),
            })
            db.update_zone_risk("server_room_corridor", 62)

        elif step_number == 7:
            # STEP 7: AEGIS correlates multi-camera events
            # Synthesize into unified incident
            raw_1 = simulator.trigger_event("ring-cam-01", RingEventKind.DING)
            norm_1 = RingEventNormalizer.normalize(raw_1, simulation_mode=True)
            raw_2 = simulator.trigger_event("ring-cam-02", RingEventKind.MOTION)
            norm_2 = RingEventNormalizer.normalize(raw_2, simulation_mode=True)
            raw_3 = simulator.trigger_event("ring-cam-03", RingEventKind.MOTION)
            norm_3 = RingEventNormalizer.normalize(raw_3, simulation_mode=True)

            correlation_engine.process_event(norm_1, "vis-vikram", "Vikram Patel", 25)
            correlation_engine.process_event(norm_2, "vis-vikram", "Vikram Patel", 30)
            inc = correlation_engine.process_event(norm_3, "vis-vikram", "Vikram Patel", 65)

            step_result.update({
                "title": "STEP 7: Multi-Camera Event Correlation",
                "summary": "AEGIS Event Correlation Engine groups 3 Ring streams into unified INCIDENT #AE-1042.",
                "zone": "Multi-Zone (Entrance -> Reception -> Corridor)",
                "incident_id": "AE-1042",
                "decision": "CORRELATE",
                "risk_score": 68,
                "risk_level": "HIGH",
                "reasons": [
                    "✓ Time-window correlation binds 3 camera events",
                    "✓ Spatial adjacency path detected",
                    "✓ Unified ticket created instead of 3 isolated alerts",
                ],
            })

        elif step_number == 8:
            # STEP 8: Access attempt at Server Room door -> Risk jumps to CRITICAL
            raw_event = simulator.trigger_event("ring-cam-04", RingEventKind.ACCESS_ATTEMPT)
            norm_event = RingEventNormalizer.normalize(raw_event, simulation_mode=True)
            risk_res = risk_agent.assess_risk(
                zone_id="server_room",
                failed_attempts=3,
                abnormal_movement=True,
                policy_violation=True,
            )
            digital_twin.move_person("vis-vikram", "server_room")
            db.update_zone_risk("server_room", 91)

            step_result.update({
                "title": "STEP 8: Failed Door Access Attempts - Risk Escalates",
                "summary": "Subject attempted 3 unauthorized badge swipes at Core Server Vault door. Risk escalates to 91/100 (CRITICAL).",
                "zone": "Core Server Vault (ring-cam-04)",
                "incident_id": "AE-1042",
                "decision": "ESCALATE",
                "risk_score": 91,
                "risk_level": "CRITICAL",
                "reasons": [
                    "✓ 3 repeated failed door access attempt(s)",
                    "✓ High-security restricted area (Zone clearance required)",
                    "✓ Explicit security policy violation detected",
                ],
                "normalized_event": norm_event.model_dump(),
            })

        elif step_number == 9:
            # STEP 9: AI investigates incident
            inv_res = investigation_agent.investigate_incident("AE-1042")
            step_result.update({
                "title": "STEP 9: AI Agent Forensic Investigation",
                "summary": "AI Investigation Agent reconstructed chronological multi-camera timeline and root cause.",
                "incident_id": "AE-1042",
                "decision": "INVESTIGATION_COMPLETE",
                "risk_score": 91,
                "risk_level": "CRITICAL",
                "timeline_count": len(inv_res.get("timeline", [])),
                "ai_summary": inv_res.get("ai_summary"),
                "ai_recommendation": inv_res.get("ai_recommendation"),
            })

        elif step_number == 10:
            # STEP 10: Temporary access revoked & Ring siren armed
            rev_res = action_agent.revoke_access("vis-vikram", reason="Unauthorized entry into Core Server Vault")
            esc_res = action_agent.escalate_incident("AE-1042", reason="Physical vault breach attempt")

            step_result.update({
                "title": "STEP 10: Temporary Access Revoked & Actuators Armed",
                "summary": "Action Agent revoked visitor pass and activated Ring Floodlight Cam siren (110dB) & floodlight.",
                "incident_id": "AE-1042",
                "decision": "REVOKE_AND_ACTUATE",
                "risk_score": 91,
                "risk_level": "CRITICAL",
                "revocation": rev_res,
                "ring_actuators": esc_res.get("actuators"),
            })

        elif step_number == 11:
            # STEP 11: Security incident created and guard dispatched
            step_result.update({
                "title": "STEP 11: Security Escalation Finalized",
                "summary": "Incident #AE-1042 escalated to Security Operations. On-duty guard Marcus Thorne dispatched. Full audit trail finalized.",
                "incident_id": "AE-1042",
                "decision": "SECURITY_DISPATCHED",
                "risk_score": 91,
                "risk_level": "CRITICAL",
                "reasons": [
                    "✓ Marcus Thorne dispatched to Core Server Vault",
                    "✓ Forensic timeline archived to AWS S3 & CloudWatch",
                    "✓ Incident status locked to ESCALATED",
                ],
            })

        self.step_history.append(step_result)
        return step_result


demo_engine = DemoScenarioEngine()
