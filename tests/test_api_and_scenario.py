"""
AEGIS Test Suite - API Endpoints & E2E Demo Scenario
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.scenario.scenario_engine import demo_engine

client = TestClient(app)


def test_api_status_endpoint():
    resp = client.get("/api/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "OPERATIONAL"
    assert "ring_integration" in data
    assert "aws_services" in data
    assert "policymesh" in data


def test_api_facility_overview():
    resp = client.get("/api/facility")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["zones"]) == 6
    assert len(data["devices"]) == 5


def test_api_natural_language_access():
    resp = client.post(
        "/api/access/command",
        json={"command": "Give Rahul from maintenance access to the server room from 2 PM to 4 PM"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["structured_authorization"]["subject"] == "Rahul Sharma"
    assert data["structured_authorization"]["resource"] == "Core Server Vault"


def test_api_copilot_queries():
    resp = client.post("/api/copilot", json={"query": "Why did you deny this visitor?"})
    assert resp.status_code == 200
    data = resp.json()
    assert "Zero-Trust Policy Explanation" in data["answer"]


def test_e2e_11_step_demo_scenario():
    # 1. Reset
    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200

    # 2. Execute all 11 steps sequentially
    for step in range(1, 12):
        resp = client.post(f"/api/demo/step/{step}")
        assert resp.status_code == 200
        step_data = resp.json()
        assert step_data["step"] == step
        assert "title" in step_data

    # Verify final status
    status_resp = client.get("/api/demo/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["current_step"] == 11
    assert len(status_data["step_history"]) == 11
