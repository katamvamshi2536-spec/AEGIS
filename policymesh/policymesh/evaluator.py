"""
PolicyMesh Evaluator Engine
Deterministic RBAC, ABAC, time-window, and risk-conditioned evaluation.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from .models import (
    Subject,
    Resource,
    AccessContext,
    PolicyRule,
    PolicyDecision,
    EvaluationResult,
)


class PolicyEngine:
    """
    PolicyMesh deterministic evaluation engine.
    Applies RBAC/ABAC rules, risk thresholds, time gates, and clearance checks.
    """

    def __init__(self, rules: Optional[List[PolicyRule]] = None):
        self.rules: List[PolicyRule] = rules or []

    def add_rule(self, rule: PolicyRule) -> None:
        self.rules.append(rule)
        # Sort rules by priority (lower value = evaluated earlier)
        self.rules.sort(key=lambda r: r.priority)

    def set_rules(self, rules: List[PolicyRule]) -> None:
        self.rules = sorted(rules, key=lambda r: r.priority)

    def evaluate_access(
        self,
        subject: Subject,
        resource: Resource,
        action: str = "enter",
        context: Optional[AccessContext] = None,
    ) -> EvaluationResult:
        """
        Evaluate whether a subject can perform an action on a resource given the context.
        Returns a deterministic EvaluationResult with transparent reasoning.
        """
        ctx = context or AccessContext()
        reasons: List[str] = []

        # 1. Credential validity check
        if not ctx.credential_valid:
            return EvaluationResult(
                decision=PolicyDecision.DENY,
                reasons=["Invalid or unrecognized security credential presented"],
                risk_score=ctx.risk_score,
            )

        # 2. Critical Risk threshold check (> 80 is strictly blocked regardless of role)
        if ctx.risk_score >= 81:
            return EvaluationResult(
                decision=PolicyDecision.ESCALATE,
                reasons=[f"Critical risk threshold exceeded ({ctx.risk_score}/100) - access locked"],
                risk_score=ctx.risk_score,
            )

        # 3. Check for active temporary grant (override if within validity and not high risk)
        if ctx.active_temporary_grant:
            if ctx.risk_score < 60:
                return EvaluationResult(
                    decision=PolicyDecision.ALLOW,
                    rule_name="Temporary Access Authorization",
                    reasons=["Valid active temporary access grant found and risk is acceptable"],
                    risk_score=ctx.risk_score,
                )
            else:
                reasons.append("Active temporary pass suspended due to elevated risk")

        # 4. Clearance Level verification
        if subject.clearance_level < resource.security_level:
            reasons.append(
                f"Subject clearance level ({subject.clearance_level}) is below resource requirement ({resource.security_level})"
            )

        # 5. Evaluate deterministic rules by priority
        now_time_str = ctx.current_time or datetime.now(timezone.utc).strftime("%H:%M")
        now_day = ctx.current_day or datetime.now(timezone.utc).strftime("%A").lower()

        matched_rule = None
        for rule in self.rules:
            # Resource match
            if rule.resource != "*" and rule.resource != resource.id and rule.resource != resource.zone_id:
                continue

            # Role match
            if rule.role != "*" and rule.role.lower() != subject.role.lower():
                continue

            # Check rule-specific conditions
            cond_passed = True
            cond_reasons = []

            # Condition: max_risk
            if "max_risk" in rule.conditions:
                max_risk = rule.conditions["max_risk"]
                if ctx.risk_score > max_risk:
                    cond_passed = False
                    cond_reasons.append(f"Risk score ({ctx.risk_score}) exceeds rule limit ({max_risk})")

            # Condition: min_clearance
            if "min_clearance" in rule.conditions:
                min_c = rule.conditions["min_clearance"]
                if subject.clearance_level < min_c:
                    cond_passed = False
                    cond_reasons.append(f"Clearance level ({subject.clearance_level}) < required ({min_c})")

            # Condition: time_window
            if "time_window" in rule.conditions:
                tw = rule.conditions["time_window"]
                start = tw.get("start_time", "08:00")
                end = tw.get("end_time", "18:00")
                days = tw.get("allowed_days", ["monday", "tuesday", "wednesday", "thursday", "friday"])

                if days and now_day not in [d.lower() for d in days]:
                    cond_passed = False
                    cond_reasons.append(f"Day {now_day.capitalize()} outside permitted schedule")

                if not (start <= now_time_str <= end):
                    cond_passed = False
                    cond_reasons.append(f"Current time ({now_time_str}) outside allowed window ({start}-{end})")

            # Condition: requires_escort
            if rule.conditions.get("requires_escort", False):
                if not ctx.attributes.get("escort_present", False):
                    cond_passed = False
                    cond_reasons.append("Security escort required but not detected")

            # Condition: requires_approval
            req_approval = rule.conditions.get("requires_approval", False)

            if cond_passed:
                matched_rule = rule
                if req_approval:
                    return EvaluationResult(
                        decision=PolicyDecision.REQUEST_APPROVAL,
                        matched_rule_id=rule.id,
                        rule_name=rule.name,
                        reasons=[f"Rule '{rule.name}' requires supervisor authorization"] + cond_reasons,
                        required_approval=True,
                        max_duration_minutes=rule.conditions.get("max_duration_minutes", 60),
                        risk_score=ctx.risk_score,
                    )
                
                # Rule matches and passes
                decision_reasons = [f"Matched policy rule '{rule.name}' for role '{subject.role}'"]
                return EvaluationResult(
                    decision=rule.action,
                    matched_rule_id=rule.id,
                    rule_name=rule.name,
                    reasons=decision_reasons,
                    required_approval=req_approval,
                    max_duration_minutes=rule.conditions.get("max_duration_minutes"),
                    risk_score=ctx.risk_score,
                )

        # 6. Default Fallback Policy
        if resource.allowed_roles and subject.role in resource.allowed_roles:
            if subject.clearance_level >= resource.security_level:
                return EvaluationResult(
                    decision=PolicyDecision.ALLOW,
                    rule_name="Default Role Matching",
                    reasons=[f"Role '{subject.role}' is explicitly in allowed list for zone '{resource.name}'"],
                    risk_score=ctx.risk_score,
                )

        # Deny by default (Zero Trust principle)
        default_reasons = reasons if reasons else [
            f"No policy permit found for role '{subject.role}' on resource '{resource.name}'"
        ]
        return EvaluationResult(
            decision=PolicyDecision.DENY,
            rule_name="Default Zero Trust Deny",
            reasons=default_reasons,
            risk_score=ctx.risk_score,
        )
