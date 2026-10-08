"""
Unit tests for PolicyMesh Evaluation Engine
"""

import pytest
from policymesh import (
    PolicyEngine,
    PolicyRule,
    PolicyDecision,
    Subject,
    Resource,
    AccessContext,
)


@pytest.fixture
def policy_engine():
    engine = PolicyEngine()

    # Rule 1: Security officers have universal access if risk < 80
    engine.add_rule(
        PolicyRule(
            id="rule-sec-all",
            name="Security Universal Access",
            resource="*",
            role="security",
            action=PolicyDecision.ALLOW,
            conditions={"max_risk": 80},
            priority=1,
        )
    )

    # Rule 2: Server room maintenance requires supervisor approval and max 60 mins
    engine.add_rule(
        PolicyRule(
            id="rule-srv-maint",
            name="Server Room Maintenance Policy",
            resource="server_room",
            role="maintenance",
            action=PolicyDecision.ALLOW,
            conditions={
                "requires_approval": True,
                "max_duration_minutes": 60,
                "max_risk": 45,
                "time_window": {
                    "start_time": "08:00",
                    "end_time": "18:00",
                    "allowed_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
                },
            },
            priority=10,
        )
    )

    # Rule 3: Visitors are strictly denied access to server room
    engine.add_rule(
        PolicyRule(
            id="rule-srv-visitor",
            name="Server Room Visitor Ban",
            resource="server_room",
            role="visitor",
            action=PolicyDecision.DENY,
            priority=5,
        )
    )

    # Rule 4: Visitors allowed in reception during daytime
    engine.add_rule(
        PolicyRule(
            id="rule-rec-visitor",
            name="Reception Visitor Permitted",
            resource="reception",
            role="visitor",
            action=PolicyDecision.ALLOW,
            conditions={
                "time_window": {
                    "start_time": "07:00",
                    "end_time": "19:00",
                    "allowed_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
                }
            },
            priority=20,
        )
    )

    return engine


def test_security_allow(policy_engine):
    guard = Subject(id="s1", name="Officer Davis", role="security", clearance_level=4)
    server_room = Resource(id="server_room", name="Server Vault", zone_id="zone-srv", security_level=4)
    ctx = AccessContext(risk_score=20, credential_valid=True)

    result = policy_engine.evaluate_access(guard, server_room, context=ctx)
    assert result.decision == PolicyDecision.ALLOW
    assert "Security Universal Access" in result.rule_name


def test_maintenance_requires_approval(policy_engine):
    rahul = Subject(id="m1", name="Rahul Sharma", role="maintenance", clearance_level=2)
    server_room = Resource(id="server_room", name="Server Vault", zone_id="zone-srv", security_level=4)
    ctx = AccessContext(
        risk_score=10,
        current_time="14:00",
        current_day="wednesday",
        credential_valid=True,
    )

    result = policy_engine.evaluate_access(rahul, server_room, context=ctx)
    assert result.decision == PolicyDecision.REQUEST_APPROVAL
    assert result.required_approval is True
    assert result.max_duration_minutes == 60


def test_visitor_denied_server_room(policy_engine):
    visitor = Subject(id="v1", name="Guest Patel", role="visitor", clearance_level=1)
    server_room = Resource(id="server_room", name="Server Vault", zone_id="zone-srv", security_level=4)
    ctx = AccessContext(risk_score=25, credential_valid=True)

    result = policy_engine.evaluate_access(visitor, server_room, context=ctx)
    assert result.decision == PolicyDecision.DENY


def test_visitor_allowed_reception(policy_engine):
    visitor = Subject(id="v1", name="Guest Patel", role="visitor", clearance_level=1)
    reception = Resource(id="reception", name="Reception Lobby", zone_id="zone-rec", security_level=1)
    ctx = AccessContext(
        risk_score=15,
        current_time="10:30",
        current_day="monday",
        credential_valid=True,
    )

    result = policy_engine.evaluate_access(visitor, reception, context=ctx)
    assert result.decision == PolicyDecision.ALLOW


def test_critical_risk_escalation(policy_engine):
    guard = Subject(id="s1", name="Officer Davis", role="security", clearance_level=4)
    server_room = Resource(id="server_room", name="Server Vault", zone_id="zone-srv", security_level=4)
    ctx = AccessContext(risk_score=92, credential_valid=True)  # Extreme risk!

    result = policy_engine.evaluate_access(guard, server_room, context=ctx)
    assert result.decision == PolicyDecision.ESCALATE
    assert "Critical risk threshold" in result.reasons[0]


def test_invalid_credential_denial(policy_engine):
    guard = Subject(id="s1", name="Officer Davis", role="security", clearance_level=4)
    server_room = Resource(id="server_room", name="Server Vault", zone_id="zone-srv", security_level=4)
    ctx = AccessContext(risk_score=10, credential_valid=False)

    result = policy_engine.evaluate_access(guard, server_room, context=ctx)
    assert result.decision == PolicyDecision.DENY
    assert "Invalid or unrecognized" in result.reasons[0]


def test_active_temporary_grant_allows_access(policy_engine):
    visitor = Subject(id="v1", name="Guest Patel", role="visitor", clearance_level=1)
    conf_room = Resource(id="conf_room_a", name="Conference Room A", zone_id="zone-conf", security_level=2)
    ctx = AccessContext(risk_score=20, credential_valid=True, active_temporary_grant=True)

    result = policy_engine.evaluate_access(visitor, conf_room, context=ctx)
    assert result.decision == PolicyDecision.ALLOW
    assert "Valid active temporary access grant" in result.reasons[0]
