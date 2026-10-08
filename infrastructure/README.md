# AEGIS AWS Builder Architecture

This directory contains the production AWS deployment templates, least-privilege IAM policies, and serverless handlers for the AEGIS physical security intelligence platform.

---

## AWS Services Utilized

| Service | Architectural Role | Value Add |
| :--- | :--- | :--- |
| **Amazon Bedrock** | Multi-Agent Orchestration & Natural Language Access Control | Powers the AEGIS Orchestrator & Investigation Agent using Claude 3.5 Sonnet Foundation Models via Converse API. |
| **Amazon Bedrock AgentCore & Strands SDK** | Autonomous Tool Execution Loop | Coordinates Identity, PolicyMesh, Risk, and Action agents with structured schemas and memory state. |
| **AWS Lambda** | Event Ingestion & Webhook Normalization | Low-latency, serverless ingestion of high-frequency Ring camera motion and doorbell events. |
| **Amazon DynamoDB** | Operational Telemetry & Digital Twin State | High-throughput single-table schema with TTL for transient temporary credentials and fast audit queries. |
| **Amazon S3** | Forensic Evidence Vault | Immutability-enabled storage with Glacier lifecycle transitions for Ring camera snapshots and forensic recordings. |
| **Amazon CloudWatch** | Metric Dashboards & Threat Alarms | Emits operational security metrics (`CriticalThreatCount`, `RingEventsIngested`) and triggers instant escalations. |

---

## Deployment via AWS CloudFormation

```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation_template.yaml \
  --stack-name aegis-production-stack \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=production RingWebhookSecret=your-secure-token
```

---

## Environment Variables

Configure your `.env` file using `.env.example`:

```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
DYNAMODB_TABLE=aegis_security_state_production
EVIDENCE_BUCKET=aegis-security-evidence-production
RING_AUTH_TOKEN=your-optional-live-ring-token
RING_REFRESH_TOKEN=your-optional-live-refresh-token
```
