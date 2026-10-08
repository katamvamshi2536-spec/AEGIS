"""
AEGIS Identity Agent
Specialized agent for resolving person identity, credentials, visitor logs, and appointments.
"""

from typing import Dict, Any, Optional
from backend.database.db import db
from backend.database.models import Person, PersonType, CredentialStatus


class IdentityAgent:
    """
    Evaluates:
    - Who is involved?
    - Known employee vs contractor vs unknown visitor
    - Valid badge / biometric match
    - Scheduled visitor appointments
    """

    @staticmethod
    def resolve_identity(
        name_or_id: Optional[str] = None,
        credential_id: Optional[str] = None,
        facial_confidence: Optional[float] = None,
        is_unknown: bool = False,
    ) -> Dict[str, Any]:
        if is_unknown or (not name_or_id and not credential_id):
            return {
                "identified": False,
                "person": None,
                "person_type": "unknown_visitor",
                "role": "unverified",
                "clearance_level": 0,
                "has_appointment": False,
                "host": None,
                "credential_valid": False,
                "summary": "Unrecognized subject detected with no active badge or appointment.",
            }

        person = None
        if name_or_id:
            person = db.get_person(name_or_id) or db.find_person_by_name(name_or_id)

        if not person and credential_id:
            for cred in db.credentials.values():
                if cred.id == credential_id and cred.status == CredentialStatus.ACTIVE:
                    person = db.get_person(cred.person_id)
                    break

        if not person:
            return {
                "identified": False,
                "person": None,
                "person_type": "unknown_visitor",
                "role": "visitor",
                "clearance_level": 1,
                "has_appointment": False,
                "host": None,
                "credential_valid": False,
                "summary": f"Subject '{name_or_id}' not found in active directory.",
            }

        # Check credentials
        has_valid_credential = False
        for cred in db.credentials.values():
            if cred.person_id == person.id and cred.status == CredentialStatus.ACTIVE:
                has_valid_credential = True
                break

        # Check visitor appointment
        has_appointment = bool(person.host_name and person.purpose)

        return {
            "identified": True,
            "person": person.model_dump(),
            "person_id": person.id,
            "name": person.name,
            "person_type": person.person_type.value,
            "role": person.role,
            "department": person.department,
            "clearance_level": person.clearance_level,
            "has_appointment": has_appointment,
            "host": person.host_name,
            "purpose": person.purpose,
            "credential_valid": has_valid_credential,
            "summary": (
                f"Verified {person.person_type.value} '{person.name}' "
                f"({person.role}, Clearance {person.clearance_level}). "
                f"Credential Status: {'VALID' if has_valid_credential else 'UNVERIFIED'}."
            ),
        }


identity_agent = IdentityAgent()
