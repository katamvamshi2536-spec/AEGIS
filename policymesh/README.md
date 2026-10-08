# PolicyMesh

> Deterministic, Zero-Trust Physical & Cyber-Physical Security Policy Evaluation Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.9+-green.svg)](https://python.org)

**PolicyMesh** is an open-source security policy engine engineered for modern smart spaces, IoT security fabrics (such as Amazon Ring-integrated facilities), enterprise access control, and agentic AI systems.

While AI agents reason about intent and ambient context, **PolicyMesh ensures deterministic, auditable, and unbypassable authorization**.

---

## Key Features

- **Hybrid RBAC + ABAC**: Combine static organizational roles with contextual attributes (time, zone, clearance level, escort presence).
- **Risk-Conditioned Gates**: Dynamically deny or escalate access if ambient risk exceeds configured safety limits (e.g. `max_risk: 60`).
- **Time-Window Enforcements**: Granular day-of-week and time-of-day access schedules.
- **Approval Workflows**: Declarative `REQUEST_APPROVAL` policy states for elevated resources (e.g. server room maintenance).
- **Temporary Access Grants**: Built-in validation for transient visitor or contractor passes with automatic expiration.
- **Explainable Decisions**: Returns structured audit trails detailing exactly which rule matched and why.

---

## Installation

```bash
pip install -e ./policymesh
```

Or copy the `policymesh` module directly into your project.

---

## Quickstart Example

```python
from policymesh import PolicyEngine, PolicyRule, PolicyDecision, Subject, Resource, AccessContext

engine = PolicyEngine()

# Add a rule: Server Room requires approval for Maintenance, max duration 60m
engine.add_rule(PolicyRule(
    id="rule-srv-maint",
    name="Server Room Maintenance Policy",
    resource="server_room",
    role="maintenance",
    action=PolicyDecision.ALLOW,
    conditions={
        "requires_approval": True,
        "max_duration_minutes": 60,
        "max_risk": 40
    },
    priority=10
))

# Subject: Rahul from maintenance
subject = Subject(
    id="user-rahul-01",
    name="Rahul Sharma",
    role="maintenance",
    clearance_level=2
)

# Resource: Core Server Vault
resource = Resource(
    id="server_room",
    name="Core Server Vault",
    zone_id="zone-server-vault",
    security_level=4
)

# Context: Normal daytime, low risk
context = AccessContext(
    current_time="14:15",
    current_day="thursday",
    risk_score=15,
    credential_valid=True
)

# Evaluate
result = engine.evaluate_access(subject, resource, action="enter", context=context)

print("Decision:", result.decision)  # PolicyDecision.REQUEST_APPROVAL
print("Requires Approval:", result.required_approval)  # True
print("Max Duration:", result.max_duration_minutes)    # 60
print("Reason:", result.reasons[0])
```

---

## Running Tests

```bash
pytest policymesh/tests/
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for pull request guidelines and code style standards.

## License

MIT License. Copyright (c) 2026 AEGIS Security Intelligence Project Contributors.
