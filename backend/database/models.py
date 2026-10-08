"""
AEGIS Core Domain Models
Entities representing the Security Digital Twin, Access Control, and Telemetry.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class ZoneSecurityLevel(int, Enum):
    PUBLIC = 1
    INTERNAL = 2
    CONFIDENTIAL = 3
    RESTRICTED = 4
    CRITICAL_VAULT = 5


class PersonType(str, Enum):
    EMPLOYEE = "employee"
    CONTRACTOR = "contractor"
    VISITOR = "visitor"
    SECURITY = "security"
    ADMIN = "admin"


class CredentialStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    REVOKED = "revoked"


class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    NEW = "NEW"
    INVESTIGATING = "INVESTIGATING"
    ESCALATED = "ESCALATED"
    RESOLVED = "RESOLVED"


class AccessRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class Zone(BaseModel):
    id: str
    name: str
    security_level: ZoneSecurityLevel
    description: str
    allowed_roles: List[str]
    current_occupants: List[str] = Field(default_factory=list)
    current_risk: int = 10
    active_cameras: List[str] = Field(default_factory=list)
    requires_approval: bool = False
    requires_escort: bool = False
    coordinates: Dict[str, float] = Field(default_factory=dict)  # x, y for 2D security map


class Person(BaseModel):
    id: str
    name: str
    person_type: PersonType
    role: str
    department: Optional[str] = None
    clearance_level: int = 1
    host_name: Optional[str] = None
    purpose: Optional[str] = None
    arrival_time: Optional[datetime] = None
    expiration_time: Optional[datetime] = None
    active_zone_id: Optional[str] = None
    current_risk: int = 0
    status: str = "active"
    avatar_url: Optional[str] = None


class Credential(BaseModel):
    id: str
    person_id: str
    credential_type: str = "nfc_badge"  # nfc_badge, qr_mobile, temporary_token, facial_biometric
    status: CredentialStatus = CredentialStatus.ACTIVE
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    allowed_zones: List[str] = Field(default_factory=list)


class RiskAssessment(BaseModel):
    score: int  # 0 to 100
    level: str  # LOW, MEDIUM, HIGH, CRITICAL
    reasons: List[str] = Field(default_factory=list)
    factors: Dict[str, int] = Field(default_factory=dict)
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Incident(BaseModel):
    id: str  # e.g. AE-1042
    title: str
    severity: IncidentSeverity
    risk_score: int
    status: IncidentStatus = IncidentStatus.NEW
    primary_zone_id: str
    affected_zones: List[str] = Field(default_factory=list)
    involved_person_id: Optional[str] = None
    involved_person_name: Optional[str] = None
    timeline: List[Dict[str, Any]] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    related_event_ids: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    ai_recommendation: Optional[str] = None
    recommended_actions: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AccessRequest(BaseModel):
    id: str
    subject_id: str
    subject_name: str
    role: str
    resource_id: str
    resource_name: str
    permission: str = "temporary_access"
    requested_start: str = "14:00"
    requested_expiration: str = "16:00"
    duration_minutes: int = 60
    reason: str
    status: AccessRequestStatus = AccessRequestStatus.PENDING
    approver: Optional[str] = None
    approved_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    actor: str
    action: str
    source: str = "ring"
    target_resource: str
    decision: str  # ALLOW, DENY, ESCALATE, REVOKE, APPROVE
    risk_score: int = 0
    reasons: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
