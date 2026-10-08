"""
AEGIS Policy Engine Service
Wraps open-source PolicyMesh library and configures enterprise security policies for Apex Cybernetics HQ.
"""

from typing import Optional, List, Dict, Any
from policymesh import (
    PolicyEngine,
    PolicyRule,
    PolicyDecision,
    Subject,
    Resource,
    AccessContext,
    EvaluationResult,
)
from backend.database.models import Person, Zone


class PolicyService:
    """
    AEGIS Policy Service using PolicyMesh.
    Evaluates physical access permissions deterministically.
    """

    def __init__(self):
        self.engine = PolicyEngine()
        self._configure_default_rules()

    def _configure_default_rules(self):
        # Rule 1: Universal Security Override (Priority 1)
        self.engine.add_rule(
            PolicyRule(
                id="rule-universal-security",
                name="Security Operations Universal Access",
                resource="*",
                role="security",
                action=PolicyDecision.ALLOW,
                conditions={"max_risk": 80},
                priority=1,
            )
        )

        # Rule 2: Executive Administrator Universal Access (Priority 2)
        self.engine.add_rule(
            PolicyRule(
                id="rule-executive-admin",
                name="Executive Admin Universal Access",
                resource="*",
                role="admin",
                action=PolicyDecision.ALLOW,
                conditions={"max_risk": 75},
                priority=2,
            )
        )

        # Rule 3: Server Room Strict Visitor Deny (Priority 5)
        self.engine.add_rule(
            PolicyRule(
                id="rule-srv-deny-visitor",
                name="Server Vault Visitor Exclusion",
                resource="server_room",
                role="visitor",
                action=PolicyDecision.DENY,
                conditions={},
                priority=5,
            )
        )

        # Rule 4: Server Room Maintenance Approval Policy (Priority 10)
        self.engine.add_rule(
            PolicyRule(
                id="rule-srv-maintenance-approval",
                name="Server Vault Maintenance Gate",
                resource="server_room",
                role="maintenance",
                action=PolicyDecision.ALLOW,
                conditions={
                    "requires_approval": True,
                    "max_duration_minutes": 60,
                    "max_risk": 45,
                    "min_clearance": 2,
                    "time_window": {
                        "start_time": "08:00",
                        "end_time": "18:00",
                        "allowed_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
                    },
                },
                priority=10,
            )
        )

        # Rule 5: Reception Visitor Daytime Access (Priority 20)
        self.engine.add_rule(
            PolicyRule(
                id="rule-reception-visitor",
                name="Lobby Visitor Daytime Policy",
                resource="reception",
                role="visitor",
                action=PolicyDecision.ALLOW,
                conditions={
                    "time_window": {
                        "start_time": "07:00",
                        "end_time": "19:00",
                        "allowed_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
                    },
                    "max_risk": 50,
                },
                priority=20,
            )
        )

        # Rule 6: Logistics & Loading Bay Operations (Priority 25)
        self.engine.add_rule(
            PolicyRule(
                id="rule-loading-bay-access",
                name="Logistics Bay Standard Clearance",
                resource="loading_bay",
                role="maintenance",
                action=PolicyDecision.ALLOW,
                conditions={"max_risk": 50},
                priority=25,
            )
        )

    def evaluate(
        self,
        person: Person,
        zone: Zone,
        action: str = "enter",
        risk_score: int = 0,
        credential_valid: bool = True,
        active_temporary_grant: bool = False,
        extra_context: Optional[Dict[str, Any]] = None,
    ) -> EvaluationResult:
        """
        Evaluates physical access using PolicyMesh.
        """
        subject = Subject(
            id=person.id,
            name=person.name,
            role=person.role,
            type=person.person_type.value,
            department=person.department,
            clearance_level=person.clearance_level,
        )

        resource = Resource(
            id=zone.id,
            name=zone.name,
            zone_id=zone.id,
            security_level=zone.security_level.value,
            allowed_roles=zone.allowed_roles,
            requires_escort=zone.requires_escort,
        )

        extra = extra_context or {}
        ctx = AccessContext(
            risk_score=risk_score,
            credential_valid=credential_valid,
            active_temporary_grant=active_temporary_grant,
            zone_id=zone.id,
            current_time=extra.get("current_time"),
            current_day=extra.get("current_day"),
            attributes=extra,
        )

        return self.engine.evaluate_access(
            subject=subject,
            resource=resource,
            action=action,
            context=ctx,
        )

    def get_all_rules(self) -> List[PolicyRule]:
        return self.engine.rules


# Global singleton
policy_service = PolicyService()
