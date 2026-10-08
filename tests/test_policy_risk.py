"""
AEGIS Test Suite - Policy & Risk Engines
"""

import pytest
from backend.policies.policy_service import policy_service
from backend.risk.risk_engine import risk_engine, RiskContext
from backend.database.db import db


def test_universal_security_policy():
    guard = db.get_person("emp-marcus")
    vault = db.get_zone("server_room")
    result = policy_service.evaluate(guard, vault, risk_score=20)
    assert result.decision.value == "ALLOW"
    assert "Security Operations Universal Access" in result.rule_name


def test_visitor_strictly_denied_vault():
    visitor = db.get_person("vis-vikram")
    vault = db.get_zone("server_room")
    result = policy_service.evaluate(visitor, vault, risk_score=30)
    assert result.decision.value == "DENY"
    assert "Server Vault Visitor Exclusion" in result.rule_name


def test_maintenance_approval_gate():
    rahul = db.get_person("cnt-rahul")
    vault = db.get_zone("server_room")
    result = policy_service.evaluate(
        rahul,
        vault,
        risk_score=20,
        extra_context={"current_time": "14:00", "current_day": "thursday"},
    )
    assert result.decision.value == "REQUEST_APPROVAL"
    assert result.required_approval is True
    assert result.max_duration_minutes == 60


def test_risk_engine_nominal_visitor():
    ctx = RiskContext(
        is_unknown_visitor=False,
        has_scheduled_appointment=True,
        credential_valid=True,
        zone_id="main_entrance",
    )
    assessment = risk_engine.evaluate(ctx)
    assert assessment.score <= 30
    assert assessment.level == "LOW"


def test_risk_engine_critical_anomaly():
    ctx = RiskContext(
        is_unknown_visitor=True,
        has_scheduled_appointment=False,
        credential_valid=False,
        zone_security_level=5,
        failed_attempts=3,
        abnormal_movement=True,
        policy_violation=True,
    )
    assessment = risk_engine.evaluate(ctx)
    assert assessment.score >= 81
    assert assessment.level == "CRITICAL"
    assert any("failed door access" in r for r in assessment.reasons)
    assert any("Unknown visitor" in r for r in assessment.reasons)
