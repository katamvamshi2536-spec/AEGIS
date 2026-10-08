"""
AEGIS Policy Agent
Specialized agent that interfaces with PolicyMesh for deterministic physical access authorization.
"""

from typing import Dict, Any, Optional
from backend.policies.policy_service import policy_service
from backend.database.db import db
from backend.database.models import Person, Zone


class PolicyAgent:
    """
    Evaluates:
    - Is access permitted under company security policy?
    - Which policy rule applies?
    - Is supervisory approval required?
    - Are time, zone, or role restrictions met?
    """

    @staticmethod
    def evaluate_policy(
        person_id: str,
        zone_id: str,
        risk_score: int = 15,
        credential_valid: bool = True,
        active_temporary_grant: bool = False,
        extra_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        person = db.get_person(person_id)
        zone = db.get_zone(zone_id)

        if not person:
            return {
                "decision": "DENY",
                "rule_name": "Zero Trust Subject Check",
                "required_approval": False,
                "reasons": ["Subject not found in active directory"],
                "policy_passed": False,
            }

        if not zone:
            return {
                "decision": "DENY",
                "rule_name": "Zone Validation",
                "required_approval": False,
                "reasons": [f"Zone '{zone_id}' not found in facility twin"],
                "policy_passed": False,
            }

        eval_result = policy_service.evaluate(
            person=person,
            zone=zone,
            action="enter",
            risk_score=risk_score,
            credential_valid=credential_valid,
            active_temporary_grant=active_temporary_grant,
            extra_context=extra_context,
        )

        return {
            "decision": eval_result.decision.value,
            "matched_rule_id": eval_result.matched_rule_id,
            "rule_name": eval_result.rule_name,
            "required_approval": eval_result.required_approval,
            "max_duration_minutes": eval_result.max_duration_minutes,
            "reasons": eval_result.reasons,
            "policy_passed": eval_result.decision.value == "ALLOW",
            "zone_security_level": zone.security_level.value,
            "subject_role": person.role,
        }


policy_agent = PolicyAgent()
