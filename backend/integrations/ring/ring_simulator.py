"""
AEGIS Ring Simulator Adapter
High-fidelity simulator conforming to the Amazon Ring Device and Webhook Protocol.
Provides real-time Ring telemetry, mock device states, and snapshot rendering for developer environments.
"""

import uuid
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from .models import RingDevice, RingDeviceType, RingEventKind, RingRawEventPayload


class RingSimulatorAdapter:
    """
    Simulates physical Ring hardware devices and generates real Ring-formatted payloads.
    Used when physical Ring hardware is in testing/developer sandbox mode.
    """

    def __init__(self):
        self._devices: Dict[str, RingDevice] = {
            "ring-cam-01": RingDevice(
                id="ring-cam-01",
                description="Main Entrance Video Doorbell Elite",
                kind=RingDeviceType.DOORBELL_ELITE,
                zone_id="main_entrance",
                battery_life=100,
                wifi_status="excellent",
                wifi_rssi=-48,
                firmware_version="3.4.12",
                siren_active=False,
                floodlight_active=False,
                snapshot_url="/api/integrations/ring/snapshots/ring-cam-01.jpg",
                metadata={"lens": "1080p HDR Ultra-Wide", "chime_id": "chime-01"},
            ),
            "ring-cam-02": RingDevice(
                id="ring-cam-02",
                description="Reception Stick Up Cam Pro",
                kind=RingDeviceType.STICKUP_CAM,
                zone_id="reception",
                battery_life=94,
                wifi_status="good",
                wifi_rssi=-58,
                firmware_version="3.4.12",
                siren_active=False,
                floodlight_active=False,
                snapshot_url="/api/integrations/ring/snapshots/ring-cam-02.jpg",
                metadata={"radar_3d_motion": True, "field_of_view": 155},
            ),
            "ring-cam-03": RingDevice(
                id="ring-cam-03",
                description="Server Corridor Spotlight Cam Pro",
                kind=RingDeviceType.SPOTLIGHT_CAM,
                zone_id="server_room_corridor",
                battery_life=88,
                wifi_status="good",
                wifi_rssi=-62,
                firmware_version="3.4.12",
                siren_active=False,
                floodlight_active=False,
                snapshot_url="/api/integrations/ring/snapshots/ring-cam-03.jpg",
                metadata={"spotlight_lumens": 700, "audio_features": "two_way_talk"},
            ),
            "ring-cam-04": RingDevice(
                id="ring-cam-04",
                description="Core Server Vault Floodlight Cam Wired Pro",
                kind=RingDeviceType.FLOODLIGHT_CAM,
                zone_id="server_room",
                battery_life=100,  # Hardwired
                wifi_status="excellent",
                wifi_rssi=-44,
                firmware_version="3.5.01",
                siren_active=False,
                floodlight_active=False,
                snapshot_url="/api/integrations/ring/snapshots/ring-cam-04.jpg",
                metadata={"floodlight_lumens": 2000, "siren_decibels": 110, "bird_eye_view": True},
            ),
            "ring-cam-05": RingDevice(
                id="ring-cam-05",
                description="Loading Bay Spotlight Cam Plus",
                kind=RingDeviceType.SPOTLIGHT_CAM,
                zone_id="loading_bay",
                battery_life=91,
                wifi_status="fair",
                wifi_rssi=-71,
                firmware_version="3.4.12",
                siren_active=False,
                floodlight_active=False,
                snapshot_url="/api/integrations/ring/snapshots/ring-cam-05.jpg",
                metadata={"field_of_view": 140, "color_night_vision": True},
            ),
        }

    def list_devices(self) -> List[RingDevice]:
        return list(self._devices.values())

    def get_device(self, device_id: str) -> Optional[RingDevice]:
        return self._devices.get(device_id)

    def trigger_event(
        self,
        device_id: str,
        kind: RingEventKind,
        person_detected: bool = True,
        motion_zone: str = "Zone 1 - Detection Area",
        confidence: float = 0.95,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> RingRawEventPayload:
        """
        Emits a realistic Ring developer raw event matching Ring REST/Webhook specifications.
        """
        device = self.get_device(device_id)
        if not device:
            raise ValueError(f"Ring Device '{device_id}' not found in simulator registry.")

        now_str = datetime.now(timezone.utc).isoformat()
        evt_uuid = str(uuid.uuid4())
        doorbot_num = 10000 + int(device_id.split("-")[-1]) if device_id.split("-")[-1].isdigit() else 10042

        # Update device last event
        device.last_event_time = datetime.now(timezone.utc)

        raw_payload = RingRawEventPayload(
            id=evt_uuid,
            event_id=f"ring-ding-{evt_uuid[:8]}",
            device_id=device_id,
            kind=kind,
            created_at=now_str,
            doorbot_id=doorbot_num,
            state="ringing" if kind == RingEventKind.DING else "motion",
            person_detected=person_detected,
            cv_confidence=confidence,
            motion_zone=motion_zone,
            snapshot_url=device.snapshot_url,
            siren_active=device.siren_active,
            battery_level=device.battery_life,
            firmware=device.firmware_version,
            raw_headers={
                "X-Ring-Signature": f"sha256={uuid.uuid4().hex}",
                "X-Ring-Device-Id": device_id,
                "X-Ring-Event-Type": kind.value,
                "User-Agent": "Ring-Webhook-Dispatcher/3.1",
            },
        )
        return raw_payload

    def set_siren(self, device_id: str, active: bool) -> bool:
        device = self.get_device(device_id)
        if device:
            device.siren_active = active
            return True
        return False

    def set_floodlight(self, device_id: str, active: bool) -> bool:
        device = self.get_device(device_id)
        if device:
            device.floodlight_active = active
            return True
        return False
