# AEGIS Developer Friction Log

This document records authentic friction points, unexpected behaviors, and engineering resolutions encountered during the development and integration of AEGIS.

---

### Issue 1: Timezone Awareness Deprecation in Python 3.13 Pydantic Models
- **Task**: Defining datetime fields in `policymesh/models.py` and backend event schemas with default timestamps.
- **Expected**: `datetime.utcnow()` generates a standard UTC timestamp without warnings.
- **Actual**: Python 3.13 flags `datetime.datetime.utcnow()` as deprecated (`DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version`).
- **Severity**: Medium
- **Workaround**: Refactored all Pydantic model factories to use `Field(default_factory=lambda: datetime.now(timezone.utc))` and explicitly import `from datetime import datetime, timezone`.
- **Suggested improvement**: Pydantic / standard library documentation should highlight timezone-aware best practices for Python 3.12+ runtimes in getting-started guides.

---

### Issue 2: Console Character Encoding for Explainable AI Symbols on Windows
- **Task**: Printing explainable risk factor checklists (`"✓ Unknown visitor"`) to PowerShell stdout.
- **Expected**: Unicode checkmark character `\u2713` displays cleanly in the terminal.
- **Actual**: PowerShell default `cp1252` encoding threw `UnicodeEncodeError: 'charmap' codec can't encode character '\u2713'`.
- **Severity**: Low
- **Workaround**: Explicitly set `$env:PYTHONIOENCODING = "utf-8"` in development scripts and ensured JSON API responses strictly use UTF-8 serialization.
- **Suggested improvement**: Standardize Python Windows process launcher default I/O stream encoding to UTF-8 without requiring manual environment flags.

---

### Issue 3: Natural Language Time Extraction vs. Policy Window Verification
- **Task**: Evaluating natural language access commands like `"Give Rahul from maintenance access to the server room from 2 PM to 4 PM"`.
- **Expected**: PolicyMesh evaluates the requested time slot (14:00 - 16:00) against permitted working hour policies.
- **Actual**: The policy engine evaluated the server's *current instant* timestamp (e.g. 06:12 UTC morning test run), which fell outside the 08:00 - 18:00 work-hours window, causing premature policy rejection before granting future-dated credentials.
- **Severity**: High
- **Workaround**: Enhanced `AegisOrchestrator` to extract the requested time slot (`start_time_24h = "14:00"`) and pass target contextual parameters (`extra_context={"current_time": "14:00"}`) to `policy_agent.evaluate_policy`.
- **Suggested improvement**: Policy engines for physical security access control should explicitly distinguish between *immediate check-in* time evaluation and *future credential reservation* window checks.

---

### Issue 4: Ring API Authentication Lifetimes for Automated Headless Services
- **Task**: Establishing continuous event ingestion from Ring Developer API for an automated security operations center.
- **Expected**: Machine-to-machine client credentials grant long-lived programmatic access to Ring camera devices.
- **Actual**: Ring authentication primarily relies on user OAuth tokens with short expiration windows requiring interactive 2FA SMS/App authorization.
- **Severity**: High
- **Workaround**: Built the dual-mode architecture: `LIVE` mode (consuming `RING_AUTH_TOKEN` / `RING_REFRESH_TOKEN` when active) alongside `RingSimulatorAdapter` conforming to the Ring API protocol with realistic doorbot telemetry and hardware control loops.
- **Suggested improvement**: Introduce an Amazon Developer Portal Machine-to-Machine (M2M) API key or IAM Role federation for commercial Ring device fleets.

---

### Issue 5: Windows Silent Installer UAC Prompt Blocking in Automated Shells
- **Task**: Installing Node.js LTS via `winget` in non-interactive terminal sessions.
- **Expected**: `winget install --silent` finishes unattended.
- **Actual**: MSI installer triggered an elevated UAC administrator modal in Session 0 that blocked terminal progress.
- **Severity**: Medium
- **Workaround**: Downloaded the portable Node.js runtime zip archive directly via PowerShell `Invoke-WebRequest` and extracted into user directory, bypassing MSI elevation requirements completely.
- **Suggested improvement**: `winget` should fail fast or detect non-interactive sessions when an MSI package requires elevated interactive confirmation.
