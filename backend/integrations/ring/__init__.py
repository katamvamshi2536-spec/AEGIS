"""
AEGIS Ring Developer Technology Integration Package
"""

from .models import (
    RingDevice,
    RingDeviceType,
    RingEventKind,
    RingRawEventPayload,
    RingControlCommand,
)
from .ring_client import RingClient, ring_client
from .ring_simulator import RingSimulatorAdapter
from .ring_events import (
    RingBaseEvent,
    RingMotionEvent,
    RingDingEvent,
    RingPersonEvent,
    RingTamperEvent,
)
from .event_normalization import (
    RingEventNormalizer,
    NormalizedSecurityEvent,
    DEVICE_ZONE_MAP,
)
from .ring_webhooks import router as ring_webhook_router

__all__ = [
    "RingDevice",
    "RingDeviceType",
    "RingEventKind",
    "RingRawEventPayload",
    "RingControlCommand",
    "RingClient",
    "ring_client",
    "RingSimulatorAdapter",
    "RingBaseEvent",
    "RingMotionEvent",
    "RingDingEvent",
    "RingPersonEvent",
    "RingTamperEvent",
    "RingEventNormalizer",
    "NormalizedSecurityEvent",
    "DEVICE_ZONE_MAP",
    "ring_webhook_router",
]
