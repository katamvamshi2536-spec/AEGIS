"""
Backend mirror for AEGIS Multi-Agent Package
"""

import sys
from pathlib import Path

agents_path = Path(__file__).resolve().parent.parent.parent / "agents"
if str(agents_path) not in sys.path:
    sys.path.insert(0, str(agents_path))

from agents import *
