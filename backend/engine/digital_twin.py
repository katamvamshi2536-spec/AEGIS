"""
AEGIS Facility Digital Twin Service
Maintains the real-time cyber-physical state of Apex Cybernetics HQ.
Synchronizes Ring sensors, spatial zones, active occupants, and risk heatmaps.
"""

from typing import Dict, List, Any, Optional
from backend.database.db import db
from backend.database.models import Zone, Person
from backend.integrations.ring.ring_client import RingClient

ring_client = RingClient()


class DigitalTwinService:
    """
    Manages live physical security twin representation.
    """

    @staticmethod
    def get_facility_overview() -> Dict[str, Any]:
        zones = db.get_zones()
        people = db.get_people()
        incidents = db.get_incidents()
        devices = ring_client.get_devices()

        total_risk = sum(z.current_risk for z in zones) // max(len(zones), 1)

        return {
            "facility_id": "FAC-APEX-ALPHA",
            "name": "Apex Cybernetics HQ - Building Alpha",
            "status": "OPERATIONAL",
            "overall_threat_level": "CRITICAL" if total_risk > 80 else "HIGH" if total_risk > 60 else "ELEVATED" if total_risk > 30 else "NOMINAL",
            "average_risk_score": total_risk,
            "zones_count": len(zones),
            "active_devices_count": len(devices),
            "personnel_on_site": len(people),
            "active_incidents_count": len([i for i in incidents if i.status != "RESOLVED"]),
            "zones": [z.model_dump() for z in zones],
            "devices": [d.model_dump() for d in devices],
        }

    @staticmethod
    def move_person(person_id: str, target_zone_id: str) -> Optional[Person]:
        person = db.get_person(person_id)
        if not person:
            return None

        # Remove from old zone occupants
        for z in db.zones.values():
            if person.name in z.current_occupants:
                z.current_occupants.remove(person.name)

        # Add to new zone occupants
        target_zone = db.get_zone(target_zone_id)
        if target_zone:
            if person.name not in target_zone.current_occupants:
                target_zone.current_occupants.append(person.name)
            person.active_zone_id = target_zone_id

        db.add_or_update_person(person)
        return person

    @staticmethod
    def get_zone_details(zone_id: str) -> Optional[Dict[str, Any]]:
        zone = db.get_zone(zone_id)
        if not zone:
            return None

        # Related cameras
        cameras = [d for d in ring_client.get_devices() if d.id in zone.active_cameras or d.zone_id == zone_id]
        
        # Related incidents
        incidents = [i for i in db.get_incidents() if zone_id in i.affected_zones or i.primary_zone_id == zone_id]

        return {
            "zone": zone.model_dump(),
            "cameras": [c.model_dump() for c in cameras],
            "occupants": zone.current_occupants,
            "recent_incidents": [i.model_dump() for i in incidents[:5]],
            "security_level_label": zone.security_level.name,
        }


digital_twin = DigitalTwinService()
