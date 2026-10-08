"""
AEGIS Multi-Factor Explainable Risk Engine
Calculates deterministic, transparent risk scores (0-100) based on contextual security signals.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from backend.database.models import RiskAssessment


class RiskContext(BaseModel):
    is_unknown_visitor: bool = False
    has_scheduled_appointment: bool = False
    credential_valid: bool = True
    failed_attempts: int = 0
    zone_id: str = "main_entrance"
    zone_security_level: int = 1  # 1 (public) to 5 (critical)
    is_after_hours: bool = False
    abnormal_movement: bool = False
    multi_camera_rapid_movement: bool = False
    tamper_detected: bool = False
    policy_violation: bool = False
    historical_incident_flag: bool = False
    active_temporary_grant: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RiskEngine:
    """
    Transparent physical security risk evaluator.
    Returns explainable breakdowns: 'WHY: ✓ Unknown visitor, ✓ Restricted area'.
    """

    @staticmethod
    def evaluate(ctx: RiskContext) -> RiskAssessment:
        factors: Dict[str, int] = {}
        reasons: List[str] = []

        # 1. Unknown visitor
        if ctx.is_unknown_visitor:
            factors["unknown_visitor"] = 25
            reasons.append("✓ Unknown visitor / unverified biometric signature")

        # 2. No scheduled appointment (for visitors)
        if (ctx.is_unknown_visitor or not ctx.credential_valid) and not ctx.has_scheduled_appointment:
            factors["no_appointment"] = 20
            reasons.append("✓ No scheduled appointment found in visitor registry")

        # 3. Invalid or missing credential
        if not ctx.credential_valid:
            factors["invalid_credential"] = 25
            reasons.append("✓ Unrecognized or missing access credential")

        # 4. Zone sensitivity elevation
        if ctx.zone_security_level >= 4:
            factors["restricted_zone"] = 25
            reasons.append("✓ High-security restricted area (Zone clearance required)")
        elif ctx.zone_security_level == 3:
            factors["confidential_zone"] = 15
            reasons.append("✓ Confidential transitional zone")

        # 5. Repeated failed attempts
        if ctx.failed_attempts > 0:
            penalty = min(ctx.failed_attempts * 15, 45)
            factors["repeated_attempts"] = penalty
            reasons.append(f"✓ {ctx.failed_attempts} repeated failed door access attempt(s)")

        # 6. Outside normal operating hours
        if ctx.is_after_hours:
            factors["after_hours"] = 15
            reasons.append("✓ Movement outside facility operational hours")

        # 7. Abnormal movement trajectory
        if ctx.abnormal_movement:
            factors["abnormal_movement"] = 20
            reasons.append("✓ Anomaly: Unauthorized trajectory away from authorized reception route")

        # 8. Rapid multi-camera velocity anomaly
        if ctx.multi_camera_rapid_movement:
            factors["velocity_anomaly"] = 15
            reasons.append("✓ Multi-camera velocity anomaly (rapid traversal across security zones)")

        # 9. Hardware tamper alert
        if ctx.tamper_detected:
            factors["tamper_alert"] = 40
            reasons.append("✓ Physical device tamper alert triggered on Ring camera")

        # 10. Policy violation
        if ctx.policy_violation:
            factors["policy_violation"] = 30
            reasons.append("✓ Explicit security policy violation detected")

        # 11. Historical incident context
        if ctx.historical_incident_flag:
            factors["incident_history"] = 15
            reasons.append("✓ Subject linked to prior security alert record")

        # Mitigation: Active approved temporary grant
        if ctx.active_temporary_grant and not ctx.abnormal_movement and ctx.failed_attempts == 0:
            factors["temporary_grant_mitigation"] = -20

        # Calculate final clamped score
        raw_score = sum(factors.values())
        score = max(0, min(100, raw_score))

        # Severity level classification
        if score <= 30:
            level = "LOW"
        elif score <= 60:
            level = "MEDIUM"
        elif score <= 80:
            level = "HIGH"
        else:
            level = "CRITICAL"

        if not reasons:
            reasons.append("✓ Standard verified access within permitted operational limits")

        return RiskAssessment(
            score=score,
            level=level,
            reasons=reasons,
            factors=factors,
            evaluated_at=datetime.now(timezone.utc),
        )


risk_engine = RiskEngine()
