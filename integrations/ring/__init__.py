"""
AEGIS Root Integration Mirror - Ring
Exposes Ring integration modules at integrations.ring
"""

import sys
from pathlib import Path

# Ensure backend modules can be imported
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from backend.integrations.ring import *
