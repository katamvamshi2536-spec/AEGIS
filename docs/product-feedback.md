# AEGIS - AWS & Amazon Developer Product Feedback

This document records authentic product feedback for each Amazon and AWS developer tool used throughout the architecture and implementation of **AEGIS**.

---

### 1. Amazon Bedrock & Converse API
- **Tool**: Amazon Bedrock (`bedrock-runtime`, Claude 3.5 Sonnet Foundation Model)
- **Purpose**: Powering the AEGIS Agent Orchestrator, conversational AI Copilot, and forensic investigation timeline generation.
- **What worked well**:
  - The Bedrock Converse API (`bedrock_client.converse()`) provides a clean, standardized message schema across foundation models, significantly simplifying multi-turn agent conversations without vendor-specific payload drift.
  - Latency for structured JSON generation and tool-use was under 1.2s, making real-time physical access decisions feasible.
- **What needs improvement**:
  - Regional availability quotas: In certain regions (e.g. `us-east-1` vs `eu-central-1`), cross-region inference profiles (`us.anthropic.claude-3-5-sonnet-20241022-v2:0`) require specific IAM configurations that are not immediately obvious from baseline documentation.
  - Streaming tool responses in ConverseStream can occasionally fragment tool input JSON across multiple delta packets, requiring careful client-side buffer accumulation.
- **Onboarding experience**: Excellent console interface and AWS SDK integration with Python `boto3`.
- **Would build with it again**: **Yes**.
- **Why**: High reliability, managed compliance for physical security workloads, and zero server maintenance.

---

### 2. Amazon Bedrock AgentCore & Strands Agents
- **Tool**: AgentCore / Strands Framework Concepts
- **Purpose**: Multi-agent decomposition into specialized single-responsibility agents (Identity, Policy, Risk, Investigation, Action).
- **What worked well**:
  - Enforcing distinct system prompts and isolated tool boundaries prevented prompt hallucination and stopped agents from bypassing deterministic policy gates.
  - Traceability: Agent execution traces make it easy to inspect why an access request was granted or denied step-by-step.
- **What needs improvement**:
  - Tool schema definitions can become verbose when managing dynamic parameters with nested objects.
  - Memory persistence between agent handoffs requires explicit state synchronization across Lambda invocations.
- **Onboarding experience**: Good developer conceptual clarity once modular roles are established.
- **Would build with it again**: **Yes**.
- **Why**: Prevents monolithic prompt sprawl and enables explainable AI in mission-critical security domains.

---

### 3. Amazon Ring Developer Technology & REST/Webhook Protocols
- **Tool**: Ring Developer APIs, Camera Devices, and Doorbot Protocols
- **Purpose**: Ingestion of live doorbell rings, motion events, camera snapshots, and device actuation (sirens, lights).
- **What worked well**:
  - Rich event granularity: Distinguishing between `ding` (button press), `motion` (PIR/Radar), and CV person-detection bounding boxes allowed AEGIS to separate casual perimeter movement from intentional access requests.
  - Ring device hardware (Floodlight Cam, Doorbell Elite) has responsive siren and illumination actuators that provide real cyber-physical deterrents.
- **What needs improvement**:
  - Ring 2FA OAuth token lifetimes: For automated headless backend services, managing long-lived refresh tokens without human MFA interaction can be complex. Providing a dedicated OAuth client credentials flow for enterprise integrations would accelerate developer adoption.
  - Local simulation sandbox: An officially maintained local Ring device mock or containerized emulator would dramatically help developers test integrations without needing physical cameras mounted to doors.
- **Onboarding experience**: Straightforward REST endpoints; documentation has clear payload samples.
- **Would build with it again**: **Yes**.
- **Why**: Ring is the ubiquitous standard for residential and commercial entry points; transforming ambient Ring video into autonomous intelligence creates immediate real-world impact.

---

### 4. Amazon DynamoDB
- **Tool**: Amazon DynamoDB Single-Table Design
- **Purpose**: Operational cyber-physical state store, active access requests, credential lifecycle, and high-frequency audit logs.
- **What worked well**:
  - Sub-10ms query latency ensures real-time security decision gates are evaluated without perceptible lag.
  - Native Time-To-Live (TTL) feature effortlessly handles automatic expiration of transient visitor passes (e.g. 60-minute maintenance access) without needing scheduled cron pollers.
- **What needs improvement**:
  - Querying audit records by multiple ad-hoc filters (e.g. `zone_id` AND `severity` AND `time_range`) requires multiple GSIs or client-side filtering.
- **Onboarding experience**: Frictionless with AWS CLI and CloudFormation.
- **Would build with it again**: **Yes**.
- **Why**: Predictable performance and zero cold starts make DynamoDB the ideal datastore for low-latency security fabrics.

---

### 5. AWS Lambda
- **Tool**: AWS Lambda (Python 3.11 Runtime)
- **Purpose**: Serverless ingestion of Ring webhook pushes and event normalization.
- **What worked well**:
  - Seamless scaling when handling bursts of simultaneous Ring camera motion events.
  - Direct integration with CloudWatch logs and DynamoDB IAM roles.
- **What needs improvement**:
  - Cold starts when importing large machine learning or cryptographic libraries can introduce a 1-2 second delay on initial invocation; keeping function packages lean and reusing SDK clients outside the handler is essential.
- **Onboarding experience**: Effortless deployment via CloudFormation and AWS CLI.
- **Would build with it again**: **Yes**.
- **Why**: Pay-per-event pricing model matches physical security camera event bursts perfectly.

---

### 6. Amazon CloudWatch
- **Tool**: CloudWatch Alarms & Metrics
- **Purpose**: Operational metrics for Ring ingestion and alarms on Critical threat escalations (Risk > 80).
- **What worked well**:
  - High reliability in triggering incident notifications when high-risk thresholds are crossed.
  - Metric filters on structured JSON logs provide instant visibility into anomaly frequencies.
- **What needs improvement**:
  - Metric resolution: Default 1-minute alarm evaluation periods can feel slightly slow for physical security breaches where immediate sub-minute response is desired (requires High-Resolution metrics enabled).
- **Onboarding experience**: Standardized and robust.
- **Would build with it again**: **Yes**.
- **Why**: Indispensable observability and automated alarming backbone.
