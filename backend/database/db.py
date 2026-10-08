"""
AEGIS Operational State Store and Database Layer
Manages real-time digital twin state, incidents, audit records, and security entities.
Integrates with AWS DynamoDB adapter while providing zero-latency in-memory synchronization.
"""

import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone, timedelta
from .models import (
    Zone,
    ZoneSecurityLevel,
    Person,
    PersonType,
    Credential,
    CredentialStatus,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    AccessRequest,
    AccessRequestStatus,
    AuditLogEntry,
)


class AegisDatabase:
    """
    Central operational security repository for AEGIS.
    """

    def __init__(self):
        self.zones: Dict[str, Zone] = {}
        self.people: Dict[str, Person] = {}
        self.credentials: Dict[str, Credential] = {}
        self.incidents: Dict[str, Incident] = {}
        self.access_requests: Dict[str, AccessRequest] = {}
        self.audit_logs: List[AuditLogEntry] = []
        self._seed_initial_state()

    def _seed_initial_state(self):
        # 1. Initialize Zones
        self.zones = {
            "main_entrance": Zone(
                id="main_entrance",
                name="Main Entrance Gate",
                security_level=ZoneSecurityLevel.PUBLIC,
                description="Primary exterior access portal with Ring Video Doorbell Elite",
                allowed_roles=["*"],
                active_cameras=["ring-cam-01"],
                current_risk=12,
                coordinates={"x": 100, "y": 300},
            ),
            "reception": Zone(
                id="reception",
                name="Reception & Lobby",
                security_level=ZoneSecurityLevel.INTERNAL,
                description="Guest check-in area and central gathering point",
                allowed_roles=["employee", "contractor", "visitor", "security", "admin"],
                active_cameras=["ring-cam-02"],
                current_risk=15,
                coordinates={"x": 260, "y": 300},
            ),
            "server_room_corridor": Zone(
                id="server_room_corridor",
                name="Server Room Corridor",
                security_level=ZoneSecurityLevel.CONFIDENTIAL,
                description="Secure transitional hallway monitored by Ring Spotlight Cam Pro",
                allowed_roles=["employee", "security", "admin", "maintenance"],
                active_cameras=["ring-cam-03"],
                current_risk=20,
                coordinates={"x": 450, "y": 200},
            ),
            "server_room": Zone(
                id="server_room",
                name="Core Server Vault",
                security_level=ZoneSecurityLevel.CRITICAL_VAULT,
                description="Ultra-high security server infrastructure and physical HSM vault",
                allowed_roles=["security", "admin"],
                requires_approval=True,
                active_cameras=["ring-cam-04"],
                current_risk=25,
                coordinates={"x": 650, "y": 140},
            ),
            "finance": Zone(
                id="finance",
                name="Executive & Finance Wing",
                security_level=ZoneSecurityLevel.RESTRICTED,
                description="Restricted executive offices and treasury records",
                allowed_roles=["admin", "finance", "security"],
                requires_approval=True,
                active_cameras=[],
                current_risk=10,
                coordinates={"x": 450, "y": 420},
            ),
            "loading_bay": Zone(
                id="loading_bay",
                name="Logistics & Loading Bay",
                security_level=ZoneSecurityLevel.INTERNAL,
                description="Commercial delivery portal monitored by Ring Spotlight Cam Plus",
                allowed_roles=["employee", "contractor", "security", "admin"],
                active_cameras=["ring-cam-05"],
                current_risk=18,
                coordinates={"x": 650, "y": 420},
            ),
        }

        # 2. Initialize Personnel
        self.people = {
            "emp-elena": Person(
                id="emp-elena",
                name="Dr. Elena Vance",
                person_type=PersonType.EMPLOYEE,
                role="admin",
                department="Executive AI Research",
                clearance_level=5,
                active_zone_id="reception",
                current_risk=5,
                avatar_url="/avatars/elena.png",
            ),
            "emp-marcus": Person(
                id="emp-marcus",
                name="Marcus Thorne",
                person_type=PersonType.SECURITY,
                role="security",
                department="Physical Security Operations",
                clearance_level=5,
                active_zone_id="main_entrance",
                current_risk=4,
                avatar_url="/avatars/marcus.png",
            ),
            "cnt-rahul": Person(
                id="cnt-rahul",
                name="Rahul Sharma",
                person_type=PersonType.CONTRACTOR,
                role="maintenance",
                department="HVAC & Infrastructure Services",
                clearance_level=2,
                active_zone_id="loading_bay",
                current_risk=14,
                avatar_url="/avatars/rahul.png",
            ),
            "vis-vikram": Person(
                id="vis-vikram",
                name="Vikram Patel",
                person_type=PersonType.VISITOR,
                role="visitor",
                department="Vanguard Systems",
                clearance_level=1,
                host_name="Dr. Elena Vance",
                purpose="Quarterly Cloud Infrastructure Review",
                active_zone_id="main_entrance",
                current_risk=28,
                avatar_url="/avatars/vikram.png",
            ),
        }

        # 3. Credentials
        self.credentials = {
            "cred-elena": Credential(
                id="cred-elena",
                person_id="emp-elena",
                credential_type="nfc_badge",
                status=CredentialStatus.ACTIVE,
                allowed_zones=["*"],
            ),
            "cred-marcus": Credential(
                id="cred-marcus",
                person_id="emp-marcus",
                credential_type="nfc_badge",
                status=CredentialStatus.ACTIVE,
                allowed_zones=["*"],
            ),
            "cred-rahul": Credential(
                id="cred-rahul",
                person_id="cnt-rahul",
                credential_type="nfc_badge",
                status=CredentialStatus.ACTIVE,
                allowed_zones=["loading_bay", "reception"],
            ),
        }

        # 4. Audit Log Seed
        self.audit_logs.append(
            AuditLogEntry(
                id="AUD-0001",
                timestamp=datetime.now(timezone.utc) - timedelta(hours=2),
                actor="Marcus Thorne (Security)",
                action="SYSTEM_INITIALIZE",
                source="ring",
                target_resource="Facility Alpha",
                decision="ALLOW",
                risk_score=5,
                reasons=["System initialized with 5 Ring cameras online"],
            )
        )

    # Zone Methods
    def get_zones(self) -> List[Zone]:
        return list(self.zones.values())

    def get_zone(self, zone_id: str) -> Optional[Zone]:
        return self.zones.get(zone_id)

    def update_zone_risk(self, zone_id: str, risk: int):
        if zone_id in self.zones:
            self.zones[zone_id].current_risk = max(0, min(100, risk))

    # People Methods
    def get_people(self) -> List[Person]:
        return list(self.people.values())

    def get_person(self, person_id: str) -> Optional[Person]:
        return self.people.get(person_id)

    def find_person_by_name(self, name: str) -> Optional[Person]:
        clean_name = name.lower()
        for p in self.people.values():
            if clean_name in p.name.lower():
                return p
        return None

    def add_or_update_person(self, person: Person):
        self.people[person.id] = person

    # Incident Methods
    def get_incidents(self) -> List[Incident]:
        return sorted(self.incidents.values(), key=lambda i: i.created_at, reverse=True)

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        return self.incidents.get(incident_id)

    def add_incident(self, incident: Incident):
        self.incidents[incident.id] = incident

    def update_incident(self, incident: Incident):
        incident.updated_at = datetime.now(timezone.utc)
        self.incidents[incident.id] = incident

    # Access Requests
    def get_access_requests(self) -> List[AccessRequest]:
        return sorted(self.access_requests.values(), key=lambda r: r.created_at, reverse=True)

    def get_access_request(self, req_id: str) -> Optional[AccessRequest]:
        return self.access_requests.get(req_id)

    def add_access_request(self, req: AccessRequest):
        self.access_requests[req.id] = req

    # Audit Logs
    def log_audit(self, entry: AuditLogEntry):
        self.audit_logs.insert(0, entry)
        if len(self.audit_logs) > 1000:
            self.audit_logs.pop()

    def get_audit_logs(self, limit: int = 100) -> List[AuditLogEntry]:
        return self.audit_logs[:limit]


# Global singleton instance
db = AegisDatabase()
