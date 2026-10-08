"""
AEGIS Ring Developer Technology Integration - Models
Defines typed models for Ring devices, raw telemetry, and event payloads.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class RingDeviceType(str, Enum):
    DOORBELL = "doorbell"
    DOORBELL_PRO = "doorbell_v4"
    DOORBELL_ELITE = "doorbell_elite"
    STICKUP_CAM = "stickup_cam_elite"
    FLOODLIGHT_CAM = "floodlight_cam"
    SPOTLIGHT_CAM = "spotlight_cam"
    SMART_LOCK = "smart_lock"


class RingEventKind(str, Enum):
    MOTION = "motion"
    DING = "ding"
    PERSON_DETECTED = "person_detected"
    TAMPER = "tamper"
    HEALTH = "device_health"
    ACCESS_ATTEMPT = "access_attempt"


class RingDevice(BaseModel):
    id: str
    description: str
    kind: RingDeviceType
    zone_id: str
    battery_life: Optional[int] = 100
    wifi_status: str = "good"
    wifi_rssi: int = -52
    firmware_version: str = "1.16.42"
    siren_active: bool = False
    floodlight_active: bool = False
    snapshot_url: Optional[str] = None
    last_event_time: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RingRawEventPayload(BaseModel):
    id: str
    event_id: str
    device_id: str
    kind: RingEventKind
    created_at: str
    doorbot_id: Optional[int] = 10042
    state: str = "ringing"  # ringing, motion, completed
    person_detected: bool = False
    cv_confidence: float = 0.94
    motion_zone: Optional[str] = "Zone 1 - Main Approach"
    snapshot_url: Optional[str] = None
    siren_active: bool = False
    battery_level: Optional[int] = 98
    firmware: str = "1.16.42"
    raw_headers: Dict[str, str] = Field(default_factory=dict)


class RingControlCommand(BaseModel):
    device_id: str
    action: str  # toggle_siren, toggle_light, request_snapshot, sound_chime
    state: bool = True
