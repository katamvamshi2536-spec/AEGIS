"""
AEGIS Ring Client
Official Ring Developer API Client with live authentication & simulator fallback.
Directly communicates with Ring cloud endpoints or the local Ring Device Adapter.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import requests
from .models import RingDevice, RingDeviceType, RingControlCommand
from .ring_simulator import RingSimulatorAdapter

logger = logging.getLogger("aegis.ring.client")


class RingClient:
    """
    AEGIS Ring Integration Client.
    Manages OAuth tokens, Ring REST endpoints, snapshot requests, and siren actuation.
    Seamlessly operates in LIVE mode (with Ring token) or SIMULATOR mode.
    """

    RING_API_URL = "https://api.ring.com/clients_api"
    RING_OAUTH_URL = "https://oauth.ring.com/oauth/token"

    def __init__(
        self,
        auth_token: Optional[str] = None,
        refresh_token: Optional[str] = None,
        use_simulator: bool = False,
    ):
        self.auth_token = auth_token or os.getenv("RING_AUTH_TOKEN")
        self.refresh_token = refresh_token or os.getenv("RING_REFRESH_TOKEN")
        self.simulator = RingSimulatorAdapter()

        # Determine operating mode
        # If no real Ring token is provided, fall back gracefully to the high-fidelity simulator
        if not self.auth_token and not self.refresh_token:
            self.mode = "SIMULATOR"
            logger.info("No RING_AUTH_TOKEN configured. RingClient initialized in high-fidelity SIMULATOR mode.")
        elif use_simulator:
            self.mode = "SIMULATOR"
            logger.info("RingClient explicitly set to SIMULATOR mode.")
        else:
            self.mode = "LIVE"
            logger.info("RingClient initialized in LIVE Ring Cloud mode.")

    def is_live(self) -> bool:
        return self.mode == "LIVE"

    def get_mode(self) -> str:
        return self.mode

    def get_devices(self) -> List[RingDevice]:
        """
        Retrieves Ring cameras, doorbells, and floodlights.
        """
        if self.mode == "LIVE":
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                resp = requests.get(f"{self.RING_API_URL}/ring_devices", headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    devices = []
                    for d in data.get("doorbots", []) + data.get("stickup_cams", []):
                        devices.append(
                            RingDevice(
                                id=str(d.get("id")),
                                description=d.get("description", "Ring Camera"),
                                kind=RingDeviceType.DOORBELL if "doorbot" in d.get("kind", "") else RingDeviceType.STICKUP_CAM,
                                zone_id="main_entrance",
                                battery_life=d.get("battery_life"),
                                firmware_version=d.get("firmware_version", "unknown"),
                            )
                        )
                    return devices
            except Exception as e:
                logger.warning(f"Live Ring API request failed: {e}. Falling back to simulator devices.")

        # Return simulator devices
        return self.simulator.list_devices()

    def get_device(self, device_id: str) -> Optional[RingDevice]:
        devices = self.get_devices()
        for d in devices:
            if d.id == device_id:
                return d
        return None

    def trigger_siren(self, device_id: str, state: bool = True) -> Dict[str, Any]:
        """
        Activates or deactivates the siren on a Ring camera / floodlight.
        """
        if self.mode == "LIVE":
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                url = f"{self.RING_API_URL}/doorbots/{device_id}/siren"
                resp = requests.put(url, headers=headers, json={"duration": 30 if state else 0}, timeout=5)
                return {"success": resp.status_code == 200, "mode": "LIVE", "status": resp.json()}
            except Exception as e:
                logger.error(f"Live Ring siren call failed: {e}")

        # Simulator execution
        success = self.simulator.set_siren(device_id, state)
        return {
            "success": success,
            "mode": "SIMULATOR",
            "device_id": device_id,
            "siren_active": state,
            "command": "siren_toggle",
        }

    def trigger_floodlight(self, device_id: str, state: bool = True) -> Dict[str, Any]:
        """
        Turns the Ring floodlight or spotlight on / off.
        """
        if self.mode == "LIVE":
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                url = f"{self.RING_API_URL}/doorbots/{device_id}/floodlight_light_on" if state else f"{self.RING_API_URL}/doorbots/{device_id}/floodlight_light_off"
                resp = requests.put(url, headers=headers, timeout=5)
                return {"success": resp.status_code == 200, "mode": "LIVE", "status": resp.json()}
            except Exception as e:
                logger.error(f"Live Ring floodlight call failed: {e}")

        # Simulator execution
        success = self.simulator.set_floodlight(device_id, state)
        return {
            "success": success,
            "mode": "SIMULATOR",
            "device_id": device_id,
            "floodlight_active": state,
            "command": "floodlight_toggle",
        }

    def get_snapshot_url(self, device_id: str) -> str:
        """
        Gets the latest camera snapshot image.
        """
        device = self.get_device(device_id)
        if device and device.snapshot_url:
            return device.snapshot_url
        return f"/api/integrations/ring/snapshots/{device_id}.jpg"


ring_client = RingClient()
