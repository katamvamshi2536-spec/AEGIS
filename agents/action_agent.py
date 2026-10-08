"""
AEGIS Action Agent
Executes state mutations: temporary access provisioning, immediate revocation,
Ring hardware actuation (sirens, lights), security escalations, and immutable audit logging.
"""

import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from backend.database.db import db
from backend.database.models import (
    AccessRequest,
    AccessRequestStatus,
    Credential,
    CredentialStatus,
    AuditLogEntry,
    IncidentStatus,
    IncidentSeverity,
)
from backend.integrations.ring.ring_client import RingClient

ring_client = RingClient()


class ActionAgent:
    """
    Executes physical and logical actions:
    - Create temporary access with TTL
    - Revoke authorization immediately
    - Request supervisory approval
    - Escalate incident & arm Ring siren
    - Dispatch security notification
    """

    @staticmethod
    def create_temporary_access(
        person_id: str,
        resource_id: str,
        duration_minutes: int = 60,
        approver: str = "Admin / Security",
        reason: str = "Authorized access pass",
    ) -> Dict[str, Any]:
        person = db.get_person(person_id)
        zone = db.get_zone(resource_id)

        if not person:
            return {"success": False, "error": f"Person '{person_id}' not found"}
        if not zone:
            return {"success": False, "error": f"Zone '{resource_id}' not found"}

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=duration_minutes)

        # 1. Create or update credential
        cred_id = f"cred-temp-{uuid.uuid4().hex[:6]}"
        new_cred = Credential(
            id=cred_id,
            person_id=person.id,
            credential_type="temporary_token",
            status=CredentialStatus.ACTIVE,
            issued_at=now,
            expires_at=expires_at,
            allowed_zones=[resource_id, "reception"],
        )
        db.credentials[cred_id] = new_cred

        # 2. Add or update access request
        req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
        access_req = AccessRequest(
            id=req_id,
            subject_id=person.id,
            subject_name=person.name,
            role=person.role,
            resource_id=zone.id,
            resource_name=zone.name,
            duration_minutes=duration_minutes,
            reason=reason,
            status=AccessRequestStatus.APPROVED,
            approver=approver,
            approved_at=now,
            expires_at=expires_at,
        )
        db.add_access_request(access_req)

        # 3. Log Audit Record
        audit_entry = AuditLogEntry(
            id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
            timestamp=now,
            actor=approver,
            action="CREATE_TEMPORARY_ACCESS",
            source="aegis_action_agent",
            target_resource=zone.name,
            decision="ALLOW",
            risk_score=15,
            reasons=[f"Issued temporary credential ({duration_minutes}m) to {person.name} for {zone.name}"],
            metadata={"credential_id": cred_id, "expires_at": expires_at.isoformat()},
        )
        db.log_audit(audit_entry)

        return {
            "success": True,
            "action": "CREATE_TEMPORARY_ACCESS",
            "credential_id": cred_id,
            "request_id": req_id,
            "person_name": person.name,
            "zone_name": zone.name,
            "duration_minutes": duration_minutes,
            "expires_at": expires_at.isoformat(),
        }

    @staticmethod
    def revoke_access(
        person_id: str,
        reason: str = "Security anomaly detected",
        actor: str = "AEGIS Action Agent",
    ) -> Dict[str, Any]:
        person = db.get_person(person_id)
        if not person:
            return {"success": False, "error": f"Person '{person_id}' not found"}

        now = datetime.now(timezone.utc)
        revoked_count = 0
        for cred in db.credentials.values():
            if cred.person_id == person.id and cred.status == CredentialStatus.ACTIVE:
                cred.status = CredentialStatus.REVOKED
                revoked_count += 1

        # Also update any approved access requests for this subject
        for req in db.access_requests.values():
            if req.subject_id == person.id and req.status == AccessRequestStatus.APPROVED:
                req.status = AccessRequestStatus.REVOKED

        # Log Audit Record
        audit_entry = AuditLogEntry(
            id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
            timestamp=now,
            actor=actor,
            action="REVOKE_ACCESS",
            source="aegis_action_agent",
            target_resource=person.name,
            decision="REVOKE",
            risk_score=85,
            reasons=[f"Access revoked for {person.name}: {reason}"],
            metadata={"revoked_credentials": revoked_count},
        )
        db.log_audit(audit_entry)

        return {
            "success": True,
            "action": "REVOKE_ACCESS",
            "person_id": person.id,
            "person_name": person.name,
            "revoked_credentials_count": revoked_count,
            "reason": reason,
        }

    @staticmethod
    def escalate_incident(
        incident_id: str,
        reason: str = "High threat threshold exceeded",
        trigger_ring_actuators: bool = True,
    ) -> Dict[str, Any]:
        incident = db.get_incident(incident_id)
        if not incident:
            return {"success": False, "error": f"Incident '{incident_id}' not found"}

        incident.status = IncidentStatus.ESCALATED
        incident.severity = IncidentSeverity.CRITICAL
        incident.updated_at = datetime.now(timezone.utc)
        db.update_incident(incident)

        actuator_results = {}
        if trigger_ring_actuators:
            # Trigger Ring Floodlight siren in server room
            actuator_results["siren"] = ring_client.trigger_siren("ring-cam-04", True)
            actuator_results["floodlight"] = ring_client.trigger_floodlight("ring-cam-04", True)

        # Log Audit Record
        audit_entry = AuditLogEntry(
            id=f"AUD-{uuid.uuid4().hex[:6].upper()}",
            timestamp=datetime.now(timezone.utc),
            actor="AEGIS Orchestrator",
            action="ESCALATE_INCIDENT",
            source="ring",
            target_resource=f"Incident {incident_id}",
            decision="ESCALATE",
            risk_score=incident.risk_score,
            reasons=[f"Incident {incident_id} escalated to CRITICAL: {reason}"],
            metadata={"ring_actuators": actuator_results},
        )
        db.log_audit(audit_entry)

        return {
            "success": True,
            "action": "ESCALATE_INCIDENT",
            "incident_id": incident.id,
            "new_status": "ESCALATED",
            "actuators": actuator_results,
        }


action_agent = ActionAgent()
