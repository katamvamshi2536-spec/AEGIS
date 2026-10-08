export interface Zone {
  id: string;
  name: string;
  security_level: number;
  description: string;
  allowed_roles: string[];
  current_occupants: string[];
  current_risk: number;
  active_cameras: string[];
  requires_approval: boolean;
  requires_escort: boolean;
  coordinates: { x: number; y: number };
}

export interface RingDevice {
  id: string;
  description: string;
  kind: string;
  zone_id: string;
  battery_life: number;
  wifi_status: string;
  wifi_rssi: number;
  firmware_version: string;
  siren_active: boolean;
  floodlight_active: boolean;
  snapshot_url: string;
  metadata?: Record<string, any>;
}

export interface SecurityEvent {
  event_id: string;
  source: string;
  device_id: string;
  device_type: string;
  zone_id: string;
  zone_name: string;
  event_type: string;
  timestamp: string;
  confidence: number;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  actor: string;
  snapshot_url?: string;
  incident_id?: string;
  simulation_mode: boolean;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  status: 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  primary_zone_id: string;
  affected_zones: string[];
  involved_person_id?: string;
  involved_person_name?: string;
  timeline: Array<{
    step: number;
    time: string;
    zone_id: string;
    zone_name: string;
    device_id: string;
    device_type: string;
    description: string;
    confidence: number;
    snapshot_url?: string;
  }>;
  evidence: Array<{
    type: string;
    device_id?: string;
    verified?: boolean;
    detail: string;
    severity?: string;
  }>;
  related_event_ids: string[];
  ai_summary?: string;
  ai_recommendation?: string;
  recommended_actions: string[];
  created_at: string;
  updated_at: string;
}

export interface AccessRequest {
  id: string;
  subject_id: string;
  subject_name: string;
  role: string;
  resource_id: string;
  resource_name: string;
  permission: string;
  requested_start: string;
  requested_expiration: string;
  duration_minutes: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'REVOKED';
  approver?: string;
  approved_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  person_type: 'employee' | 'contractor' | 'visitor' | 'security' | 'admin';
  role: string;
  department?: string;
  clearance_level: number;
  host_name?: string;
  purpose?: string;
  active_zone_id?: string;
  current_risk: number;
  status: string;
  avatar_url?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  source: string;
  target_resource: string;
  decision: string;
  risk_score: number;
  reasons: string[];
  metadata?: Record<string, any>;
}

export interface PolicyRule {
  id: string;
  name: string;
  resource: string;
  role: string;
  action: string;
  conditions: Record<string, any>;
  priority: number;
}

export interface DemoStatus {
  current_step: number;
  total_steps: number;
  is_running: boolean;
  mode: string;
  incident_id: string;
  step_history: any[];
}

export interface SystemStatus {
  system: string;
  tagline: string;
  status: string;
  ring_integration: {
    mode: string;
    is_live: boolean;
    device_count: number;
    status: string;
  };
  aws_services: {
    amazon_bedrock: string;
    agentcore_runtime: string;
    strands_sdk: string;
    dynamodb_adapter: string;
    cloudwatch_metrics: string;
  };
  policymesh: {
    engine: string;
    rules_active: number;
    evaluation_mode: string;
  };
  facility: {
    facility_id: string;
    name: string;
    status: string;
    overall_threat_level: string;
    average_risk_score: number;
    zones_count: number;
    active_devices_count: number;
    personnel_on_site: number;
    active_incidents_count: number;
    zones: Zone[];
    devices: RingDevice[];
  };
}
