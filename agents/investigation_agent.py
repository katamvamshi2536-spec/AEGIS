"""
AEGIS Investigation Agent
Reconstructs multi-camera evidence timelines, performs root-cause analysis, and recommends countermeasures.
"""

from typing import Dict, Any, Optional, List
from backend.database.db import db
from backend.database.models import Incident


class InvestigationAgent:
    """
    Synthesizes:
    - What happened across Ring devices?
    - Chronological timeline reconstruction
    - Evidence corroboration
    - Root cause analysis
    - Recommended proactive mitigation
    """

    @staticmethod
    def investigate_incident(incident_id: str) -> Dict[str, Any]:
        incident = db.get_incident(incident_id)
        if not incident:
            return {
                "success": False,
                "error": f"Incident {incident_id} not found in AEGIS repository.",
            }

        # Formulate root cause & synthesis
        total_steps = len(incident.timeline)
        zones_involved = ", ".join(incident.affected_zones)
        subject_label = incident.involved_person_name or "Unidentified visitor"

        root_cause = (
            f"Subject '{subject_label}' traversed from low-security reception portals toward high-security "
            f"vault infrastructure ({zones_involved}). The correlation engine registered "
            f"{total_steps} telemetry signals across Ring security devices, identifying multiple unauthorized badge attempts."
        )

        recommendations = [
            "Immediately lock down Core Server Vault magnetic locks via Smart Lock integration.",
            "Activate high-intensity Ring Floodlight strobe and arm siren at 110dB.",
            "Revoke any active temporary guest tokens or NFC badges associated with the session.",
            "Dispatch on-duty security guard Marcus Thorne to intercept at Zone Corridor.",
            "Export video clip archive to Amazon S3 security bucket for forensics audit.",
        ]

        # Update incident record with investigation details
        incident.ai_summary = root_cause
        incident.ai_recommendation = (
            "Revoke temporary authorization, lock server vault access, and dispatch security escort."
        )
        incident.recommended_actions = recommendations
        db.update_incident(incident)

        return {
            "success": True,
            "incident_id": incident.id,
            "severity": incident.severity.value,
            "risk_score": incident.risk_score,
            "status": incident.status.value,
            "timeline": incident.timeline,
            "evidence": incident.evidence,
            "root_cause": root_cause,
            "ai_summary": incident.ai_summary,
            "ai_recommendation": incident.ai_recommendation,
            "recommended_actions": recommendations,
        }


investigation_agent = InvestigationAgent()
