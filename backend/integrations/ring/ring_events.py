"""
AEGIS Ring Events Definition
Strongly typed event classes for Ring camera and sensor telemetry.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from .models import RingEventKind


class RingBaseEvent(BaseModel):
    event_id: str
    device_id: str
    kind: RingEventKind
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_payload: Dict[str, Any] = Field(default_factory=dict)


class RingMotionEvent(RingBaseEvent):
    kind: RingEventKind = RingEventKind.MOTION
    motion_zone: str = "Zone 1"
    cv_confidence: float = 0.92
    motion_duration_sec: int = 15


class RingDingEvent(RingBaseEvent):
    kind: RingEventKind = RingEventKind.DING
    doorbot_id: int = 10042
    ring_state: str = "ringing"
    person_detected: bool = True
    answering_user_id: Optional[str] = None


class RingPersonEvent(RingBaseEvent):
    kind: RingEventKind = RingEventKind.PERSON_DETECTED
    person_count: int = 1
    bounding_box: Dict[str, float] = Field(
        default_factory=lambda: {"top": 0.2, "left": 0.35, "width": 0.3, "height": 0.6}
    )
    cv_confidence: float = 0.96


class RingTamperEvent(RingBaseEvent):
    kind: RingEventKind = RingEventKind.TAMPER
    tamper_sensor: str = "cover_removed"
    accelerometer_delta: float = 4.2
