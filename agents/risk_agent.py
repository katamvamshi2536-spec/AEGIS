"""
AEGIS Risk Agent
Specialized agent for behavioral anomaly detection, temporal deviations, and contextual risk scoring.
"""

from typing import Dict, Any, Optional
from backend.risk.risk_engine import risk_engine, RiskContext
from backend.database.db import db


class RiskAgent:
    """
    Evaluates:
    - Behavioral anomalies
    - Unusual time & location
    - Repeated failed attempts
    - Threat escalation across multi-camera streams
    """

    @staticmethod
    def assess_risk(
        zone_id: str,
        is_unknown_visitor: bool = False,
        has_appointment: bool = False,
        credential_valid: bool = True,
        failed_attempts: int = 0,
        is_after_hours: bool = False,
        abnormal_movement: bool = False,
        multi_camera_rapid: bool = False,
        tamper_detected: bool = False,
        policy_violation: bool = False,
        historical_incident: bool = False,
        active_temporary_grant: bool = False,
    ) -> Dict[str, Any]:
        zone = db.get_zone(zone_id)
        zone_level = zone.security_level.value if zone else 1

        ctx = RiskContext(
            is_unknown_visitor=is_unknown_visitor,
            has_scheduled_appointment=has_appointment,
            credential_valid=credential_valid,
            failed_attempts=failed_attempts,
            zone_id=zone_id,
            zone_security_level=zone_level,
            is_after_hours=is_after_hours,
            abnormal_movement=abnormal_movement,
            multi_camera_rapid_movement=multi_camera_rapid,
            tamper_detected=tamper_detected,
            policy_violation=policy_violation,
            historical_incident_flag=historical_incident,
            active_temporary_grant=active_temporary_grant,
        )

        assessment = risk_engine.evaluate(ctx)

        return {
            "score": assessment.score,
            "level": assessment.level,
            "reasons": assessment.reasons,
            "factors": assessment.factors,
            "evaluated_at": assessment.evaluated_at.isoformat(),
            "explanation": " | ".join(assessment.reasons),
        }


risk_agent = RiskAgent()
