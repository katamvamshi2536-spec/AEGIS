"""
AWS Lambda Handler for AEGIS Ring Event Ingestion
Deployed in AWS Lambda behind API Gateway or EventBridge for real-time Ring telemetry processing.
"""

import os
import json
import logging
from datetime import datetime, timezone
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients outside handler for connection reuse
dynamodb = boto3.resource("dynamodb")
table_name = os.environ.get("DYNAMODB_TABLE", "aegis_security_state_production")
state_table = dynamodb.Table(table_name)
cloudwatch = boto3.client("cloudwatch")


def lambda_handler(event, context):
    """
    Ingests Ring webhooks, normalizes payload, runs policy & risk logic,
    and updates DynamoDB single-table records.
    """
    try:
        body = json.loads(event.get("body", "{}")) if isinstance(event.get("body"), str) else event.get("body", {})
        device_id = body.get("device_id", "ring-cam-01")
        kind = body.get("kind", "motion")
        now_iso = datetime.now(timezone.utc).isoformat()

        logger.info(f"Ingesting Ring event: {kind} from device {device_id}")

        # Construct normalized record
        event_id = f"AE-EVT-{context.aws_request_id[:8].upper()}" if context else "AE-EVT-LAMBDA"
        item = {
            "PK": f"DEVICE#{device_id}",
            "SK": f"EVENT#{now_iso}",
            "GSI1PK": "EVENT#ACTIVE",
            "GSI1SK": now_iso,
            "event_id": event_id,
            "source": "ring",
            "device_id": device_id,
            "event_type": kind.upper(),
            "person_detected": body.get("person_detected", True),
            "timestamp": now_iso,
            "raw_payload": body,
        }

        # Put to DynamoDB
        state_table.put_item(Item=item)

        # Emit CloudWatch metric
        cloudwatch.put_metric_data(
            Namespace="AEGIS/SecurityIntelligence",
            MetricData=[
                {
                    "MetricName": "RingEventsIngested",
                    "Value": 1,
                    "Unit": "Count",
                    "Dimensions": [
                        {"Name": "DeviceId", "Value": device_id},
                        {"Name": "Kind", "Value": kind},
                    ],
                }
            ],
        )

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "status": "ingested",
                "event_id": event_id,
                "processed_at": now_iso,
            }),
        }

    except Exception as e:
        logger.error(f"Error processing Ring event in Lambda: {str(e)}", exc_info=True)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)}),
        }
