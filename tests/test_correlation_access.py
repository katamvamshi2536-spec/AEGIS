"""
AEGIS Test Suite - Correlation & Access Control
"""

import pytest
from backend.engine.correlation_engine import correlation_engine
from backend.integrations.ring.ring_simulator import RingSimulatorAdapter
from backend.integrations.ring.models import RingEventKind
from backend.integrations.ring.event_normalization import RingEventNormalizer
from agents.action_agent import action_agent
from backend.database.db import db
from backend.database.models import CredentialStatus


def test_multi_camera_event_correlation():
    sim = RingSimulatorAdapter()
    raw_1 = sim.trigger_event("ring-cam-01", RingEventKind.DING)
    raw_2 = sim.trigger_event("ring-cam-02", RingEventKind.MOTION)
    raw_3 = sim.trigger_event("ring-cam-03", RingEventKind.MOTION)

    norm_1 = RingEventNormalizer.normalize(raw_1)
    norm_2 = RingEventNormalizer.normalize(raw_2)
    norm_3 = RingEventNormalizer.normalize(raw_3)

    correlation_engine.process_event(norm_1, "vis-test-01", "Test Visitor", 20)
    correlation_engine.process_event(norm_2, "vis-test-01", "Test Visitor", 30)
    incident = correlation_engine.process_event(norm_3, "vis-test-01", "Test Visitor", 65)

    assert incident is not None
    assert incident.id.startswith("AE-")
    assert len(incident.timeline) >= 3
    assert len(incident.affected_zones) >= 2


def test_temporary_access_and_revocation():
    # 1. Create temporary access
    grant = action_agent.create_temporary_access(
        person_id="cnt-rahul",
        resource_id="server_room",
        duration_minutes=30,
        approver="Security Admin",
        reason="Scheduled cooling inspection",
    )
    assert grant["success"] is True
    cred_id = grant["credential_id"]
    assert db.credentials[cred_id].status == CredentialStatus.ACTIVE

    # 2. Revoke access
    rev = action_agent.revoke_access("cnt-rahul", reason="Inspection completed")
    assert rev["success"] is True
    assert db.credentials[cred_id].status == CredentialStatus.REVOKED

    # 3. Check audit entry
    audits = db.get_audit_logs()
    assert any("REVOKE_ACCESS" in a.action for a in audits)
