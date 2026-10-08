"""
PolicyMesh - Open Source Deterministic Policy Evaluation Engine
Part of the AEGIS Physical Security Intelligence Platform
Copyright (c) 2026 AEGIS Security Contributors
Licensed under the MIT License
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class PolicyDecision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"
    REQUEST_APPROVAL = "REQUEST_APPROVAL"
    ESCALATE = "ESCALATE"


class Subject(BaseModel):
    id: str
    name: str
    role: str
    type: str = "visitor"  # employee, contractor, visitor, security, admin
    department: Optional[str] = None
    clearance_level: int = 1  # 1 (public), 2 (internal), 3 (confidential), 4 (restricted), 5 (critical)
    attributes: Dict[str, Any] = Field(default_factory=dict)


class Resource(BaseModel):
    id: str
    name: str
    zone_id: str
    security_level: int = 1  # 1 to 5
    allowed_roles: List[str] = Field(default_factory=list)
    requires_escort: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)


class AccessContext(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_time: Optional[str] = None  # HH:MM
    current_day: Optional[str] = None   # monday, tuesday, etc.
    risk_score: int = 0
    credential_id: Optional[str] = None
    credential_valid: bool = True
    device_id: Optional[str] = None
    zone_id: Optional[str] = None
    failed_attempts: int = 0
    active_temporary_grant: bool = False
    attributes: Dict[str, Any] = Field(default_factory=dict)


class TimeCondition(BaseModel):
    start_time: str = "08:00"
    end_time: str = "18:00"
    allowed_days: List[str] = Field(default_factory=lambda: [
        "monday", "tuesday", "wednesday", "thursday", "friday"
    ])


class PolicyRule(BaseModel):
    id: str
    name: str
    resource: str  # zone_id or resource_id or '*'
    role: str      # role or '*'
    action: PolicyDecision = PolicyDecision.ALLOW
    conditions: Dict[str, Any] = Field(default_factory=dict)
    # Conditions supported:
    # - max_risk: int (deny or escalate if risk exceeds)
    # - time_window: TimeCondition dict
    # - min_clearance: int
    # - requires_approval: bool
    # - max_duration_minutes: int
    # - requires_escort: bool
    priority: int = 100  # lower number = higher priority


class EvaluationResult(BaseModel):
    decision: PolicyDecision
    matched_rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    reasons: List[str] = Field(default_factory=list)
    required_approval: bool = False
    max_duration_minutes: Optional[int] = None
    risk_score: int = 0
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
