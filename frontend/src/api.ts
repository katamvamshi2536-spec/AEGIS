import {
  SystemStatus,
  Zone,
  RingDevice,
  SecurityEvent,
  Incident,
  AccessRequest,
  Person,
  AuditLog,
  PolicyRule,
  DemoStatus,
} from './types'

const API_BASE = '/api'

// Standalone fallback seed data for GitHub Pages static deployment
const FALLBACK_ZONES: Zone[] = [
  {
    id: "main_entrance",
    name: "Main Entrance Gate",
    security_level: 1,
    description: "Primary exterior access portal with Ring Video Doorbell Elite",
    allowed_roles: ["*"],
    current_occupants: [],
    current_risk: 12,
    active_cameras: ["ring-cam-01"],
    requires_approval: false,
    requires_escort: false,
    coordinates: { x: 100, y: 300 },
  },
  {
    id: "reception",
    name: "Reception & Lobby",
    security_level: 2,
    description: "Guest check-in area and central gathering point",
    allowed_roles: ["employee", "contractor", "visitor", "security", "admin"],
    current_occupants: ["Dr. Elena Vance"],
    current_risk: 15,
    active_cameras: ["ring-cam-02"],
    requires_approval: false,
    requires_escort: false,
    coordinates: { x: 260, y: 300 },
  },
  {
    id: "server_room_corridor",
    name: "Server Room Corridor",
    security_level: 3,
    description: "Secure transitional hallway monitored by Ring Spotlight Cam Pro",
    allowed_roles: ["employee", "security", "admin", "maintenance"],
    current_occupants: [],
    current_risk: 20,
    active_cameras: ["ring-cam-03"],
    requires_approval: false,
    requires_escort: false,
    coordinates: { x: 450, y: 200 },
  },
  {
    id: "server_room",
    name: "Core Server Vault",
    security_level: 5,
    description: "Ultra-high security server infrastructure and physical HSM vault",
    allowed_roles: ["security", "admin"],
    current_occupants: [],
    current_risk: 25,
    active_cameras: ["ring-cam-04"],
    requires_approval: true,
    requires_escort: false,
    coordinates: { x: 650, y: 140 },
  },
  {
    id: "finance",
    name: "Executive & Finance Wing",
    security_level: 4,
    description: "Restricted executive offices and treasury records",
    allowed_roles: ["admin", "finance", "security"],
    current_occupants: [],
    current_risk: 10,
    active_cameras: [],
    requires_approval: true,
    requires_escort: false,
    coordinates: { x: 450, y: 420 },
  },
  {
    id: "loading_bay",
    name: "Logistics & Loading Bay",
    security_level: 2,
    description: "Commercial delivery portal monitored by Ring Spotlight Cam Plus",
    allowed_roles: ["employee", "contractor", "security", "admin"],
    current_occupants: ["Rahul Sharma"],
    current_risk: 18,
    active_cameras: ["ring-cam-05"],
    requires_approval: false,
    requires_escort: false,
    coordinates: { x: 650, y: 420 },
  },
]

const FALLBACK_DEVICES: RingDevice[] = [
  {
    id: "ring-cam-01",
    description: "Main Entrance Video Doorbell Elite",
    kind: "doorbell_elite",
    zone_id: "main_entrance",
    battery_life: 100,
    wifi_status: "excellent",
    wifi_rssi: -48,
    firmware_version: "3.4.12",
    siren_active: false,
    floodlight_active: false,
    snapshot_url: "/api/integrations/ring/snapshots/ring-cam-01.jpg",
  },
  {
    id: "ring-cam-02",
    description: "Reception Stick Up Cam Pro",
    kind: "stickup_cam_elite",
    zone_id: "reception",
    battery_life: 94,
    wifi_status: "good",
    wifi_rssi: -58,
    firmware_version: "3.4.12",
    siren_active: false,
    floodlight_active: false,
    snapshot_url: "/api/integrations/ring/snapshots/ring-cam-02.jpg",
  },
  {
    id: "ring-cam-03",
    description: "Server Corridor Spotlight Cam Pro",
    kind: "spotlight_cam",
    zone_id: "server_room_corridor",
    battery_life: 88,
    wifi_status: "good",
    wifi_rssi: -62,
    firmware_version: "3.4.12",
    siren_active: false,
    floodlight_active: false,
    snapshot_url: "/api/integrations/ring/snapshots/ring-cam-03.jpg",
  },
  {
    id: "ring-cam-04",
    description: "Core Server Vault Floodlight Cam Wired Pro",
    kind: "floodlight_cam",
    zone_id: "server_room",
    battery_life: 100,
    wifi_status: "excellent",
    wifi_rssi: -44,
    firmware_version: "3.5.01",
    siren_active: false,
    floodlight_active: false,
    snapshot_url: "/api/integrations/ring/snapshots/ring-cam-04.jpg",
  },
  {
    id: "ring-cam-05",
    description: "Loading Bay Spotlight Cam Plus",
    kind: "spotlight_cam",
    zone_id: "loading_bay",
    battery_life: 91,
    wifi_status: "fair",
    wifi_rssi: -71,
    firmware_version: "3.4.12",
    siren_active: false,
    floodlight_active: false,
    snapshot_url: "/api/integrations/ring/snapshots/ring-cam-05.jpg",
  },
]

let fallbackDemoStep = 0
let fallbackRequests: AccessRequest[] = [
  {
    id: "REQ-01",
    subject_id: "cnt-rahul",
    subject_name: "Rahul Sharma",
    role: "maintenance",
    resource_id: "server_room",
    resource_name: "Core Server Vault",
    permission: "temporary_access",
    requested_start: "14:00",
    requested_expiration: "16:00",
    duration_minutes: 60,
    reason: "Scheduled HVAC maintenance pass",
    status: "APPROVED",
    approver: "Admin Console",
    created_at: new Date().toISOString(),
  }
]

export const api = {
  async getStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE}/status`)
      if (res.ok) return await res.json()
    } catch {}
    return {
      system: "AEGIS Physical Security OS",
      tagline: "From camera events to intelligent security decisions",
      status: "OPERATIONAL",
      ring_integration: {
        mode: "SIMULATOR",
        is_live: false,
        device_count: 5,
        status: "CONNECTED",
      },
      aws_services: {
        amazon_bedrock: "ACTIVE",
        agentcore_runtime: "INITIALIZED",
        strands_sdk: "ACTIVE",
        dynamodb_adapter: "ACTIVE",
        cloudwatch_metrics: "ACTIVE",
      },
      policymesh: {
        engine: "PolicyMesh v1.0.0 (Open Source)",
        rules_active: 6,
        evaluation_mode: "Zero-Trust Deterministic",
      },
      facility: {
        facility_id: "FAC-APEX-ALPHA",
        name: "Apex Cybernetics HQ - Building Alpha",
        status: "OPERATIONAL",
        overall_threat_level: "NOMINAL",
        average_risk_score: 16,
        zones_count: 6,
        active_devices_count: 5,
        personnel_on_site: 4,
        active_incidents_count: 1,
        zones: FALLBACK_ZONES,
        devices: FALLBACK_DEVICES,
      },
    }
  },

  async getFacility(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/facility`)
      if (res.ok) return await res.json()
    } catch {}
    return (await this.getStatus()).facility
  },

  async getZones(): Promise<Zone[]> {
    try {
      const res = await fetch(`${API_BASE}/zones`)
      if (res.ok) return await res.json()
    } catch {}
    return FALLBACK_ZONES
  },

  async getZoneDetails(zoneId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/zones/${zoneId}`)
      if (res.ok) return await res.json()
    } catch {}
    const z = FALLBACK_ZONES.find((item) => item.id === zoneId) || FALLBACK_ZONES[0]
    return {
      zone: z,
      cameras: FALLBACK_DEVICES.filter((d) => d.zone_id === z.id),
      occupants: z.current_occupants,
      recent_incidents: [],
      security_level_label: "LEVEL_" + z.security_level,
    }
  },

  async getEvents(): Promise<SecurityEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/events`)
      if (res.ok) return await res.json()
    } catch {}
    return [
      {
        event_id: "AE-EVT-01",
        source: "ring",
        device_id: "ring-cam-01",
        device_type: "doorbell_elite",
        zone_id: "main_entrance",
        zone_name: "Main Entrance",
        event_type: "VISITOR_DETECTED",
        timestamp: new Date().toLocaleTimeString(),
        confidence: 0.96,
        risk_score: 25,
        risk_level: "LOW",
        reasons: ["✓ Routine visitor check-in at gate"],
        actor: "Vikram Patel",
        snapshot_url: "/api/integrations/ring/snapshots/ring-cam-01.jpg",
        simulation_mode: true,
      },
    ]
  },

  async triggerEvent(deviceId: string, kind: string, actorName?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/events/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, kind, actor_name: actorName }),
      })
      if (res.ok) return await res.json()
    } catch {}
    return {
      event_id: `AE-EVT-${Date.now().toString(16).toUpperCase()}`,
      source: "ring",
      device_id: deviceId,
      device_type: "camera",
      zone_id: "main_entrance",
      zone_name: "Main Entrance",
      event_type: kind.toUpperCase(),
      timestamp: new Date().toLocaleTimeString(),
      confidence: 0.95,
      risk_score: 20,
      risk_level: "LOW",
      reasons: ["✓ Ring sensor signal emitted"],
      actor: actorName || "Visitor",
      simulation_mode: true,
    }
  },

  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch(`${API_BASE}/incidents`)
      if (res.ok) return await res.json()
    } catch {}
    return [
      {
        id: "AE-1042",
        title: "Multi-Camera Correlation: Unauthorized Movement to Core Server Vault",
        severity: "CRITICAL",
        risk_score: 91,
        status: "ESCALATED",
        primary_zone_id: "server_room",
        affected_zones: ["main_entrance", "reception", "server_room_corridor", "server_room"],
        involved_person_name: "Vikram Patel",
        timeline: [
          {
            step: 1,
            time: "10:42:03",
            zone_id: "main_entrance",
            zone_name: "Main Entrance",
            device_id: "ring-cam-01",
            device_type: "doorbell_elite",
            description: "Visitor detected at gate",
            confidence: 0.96,
          },
          {
            step: 2,
            time: "10:43:01",
            zone_id: "reception",
            zone_name: "Reception Lobby",
            device_id: "ring-cam-02",
            device_type: "stickup_cam_elite",
            description: "Temporary reception pass activated",
            confidence: 0.94,
          },
          {
            step: 3,
            time: "10:44:02",
            zone_id: "server_room_corridor",
            zone_name: "Restricted Corridor",
            device_id: "ring-cam-03",
            device_type: "spotlight_cam",
            description: "Unauthorized corridor deviation",
            confidence: 0.92,
          },
          {
            step: 4,
            time: "10:44:31",
            zone_id: "server_room",
            zone_name: "Core Server Vault",
            device_id: "ring-cam-04",
            device_type: "floodlight_cam",
            description: "3 failed door access attempts - Risk jumps to 91",
            confidence: 0.98,
          },
        ],
        evidence: [
          { type: "ring_camera_telemetry", verified: true, detail: "Motion and visual capture logged on 4 Ring devices" },
          { type: "policy_violation", detail: "Server Vault Visitor Exclusion rule violated", severity: "HIGH" },
        ],
        related_event_ids: ["AE-EVT-01", "AE-EVT-02", "AE-EVT-03"],
        ai_summary: "Subject traversed 4 facility zones across 4 Ring devices. Repeated access attempts at the Core Server Vault door triggered autonomous escalation.",
        ai_recommendation: "Revoke temporary authorization, lock server vault access, and dispatch security escort.",
        recommended_actions: [
          "Lock down Core Server Vault Smart Lock",
          "Arm Ring Floodlight Cam siren (110dB)",
          "Revoke temporary badge credentials",
          "Alert on-duty security guard",
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  },

  async getIncident(id: string): Promise<Incident> {
    const list = await this.getIncidents()
    return list.find((i) => i.id === id) || list[0]
  },

  async investigateIncident(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/investigate`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {}
    const inc = await this.getIncident(id)
    return {
      success: true,
      incident_id: inc.id,
      severity: inc.severity,
      risk_score: inc.risk_score,
      status: inc.status,
      timeline: inc.timeline,
      evidence: inc.evidence,
      root_cause: inc.ai_summary,
      ai_summary: inc.ai_summary,
      ai_recommendation: inc.ai_recommendation,
      recommended_actions: inc.recommended_actions,
    }
  },

  async escalateIncident(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/escalate`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {}
    return { success: true, incident_id: id, new_status: "ESCALATED" }
  },

  async getAccessRequests(): Promise<AccessRequest[]> {
    try {
      const res = await fetch(`${API_BASE}/access/requests`)
      if (res.ok) return await res.json()
    } catch {}
    return fallbackRequests
  },

  async executeNlCommand(command: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/access/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      })
      if (res.ok) return await res.json()
    } catch {}

    const lower = command.toLowerCase()
    const name = lower.includes("rahul") ? "Rahul Sharma" : lower.includes("vikram") ? "Vikram Patel" : "Authorized Subject"
    const role = lower.includes("maintenance") ? "maintenance" : "contractor"
    const zone = lower.includes("server") ? "Core Server Vault" : "Reception"

    const newReq: AccessRequest = {
      id: `REQ-${Date.now().toString(16).toUpperCase().slice(-4)}`,
      subject_id: "cnt-rahul",
      subject_name: name,
      role: role,
      resource_id: "server_room",
      resource_name: zone,
      permission: "temporary_access",
      requested_start: "14:00",
      requested_expiration: "16:00",
      duration_minutes: 60,
      reason: command,
      status: "APPROVED",
      approver: "Admin Console",
      created_at: new Date().toISOString(),
    }
    fallbackRequests.unshift(newReq)

    return {
      success: true,
      structured_authorization: {
        subject: name,
        role: role,
        resource: zone,
        permission: "temporary_access",
        start: "2 PM",
        expiration: "4 PM",
        duration_minutes: 60,
        approval_required: true,
      },
      message: `Successfully provisioned temporary access for ${name} (${role}) to ${zone}. Valid for 60 minutes.`,
      trace: [
        { stage: "IDENTITY_AGENT", agent: "Identity Agent", status: "SUCCESS" },
        { stage: "POLICY_AGENT", agent: "Policy Agent (PolicyMesh)", decision: "ALLOW" },
        { stage: "RISK_AGENT", agent: "Risk Agent", risk_score: 15 },
        { stage: "ACTION_AGENT", agent: "Action Agent", action: "TEMPORARY_ACCESS_GRANTED" },
      ],
    }
  },

  async getVisitors(): Promise<Person[]> {
    try {
      const res = await fetch(`${API_BASE}/visitors`)
      if (res.ok) return await res.json()
    } catch {}
    return [
      {
        id: "emp-elena",
        name: "Dr. Elena Vance",
        person_type: "admin",
        role: "admin",
        department: "Executive AI Research",
        clearance_level: 5,
        active_zone_id: "reception",
        current_risk: 5,
        status: "active",
      },
      {
        id: "emp-marcus",
        name: "Marcus Thorne",
        person_type: "security",
        role: "security",
        department: "Physical Security Operations",
        clearance_level: 5,
        active_zone_id: "main_entrance",
        current_risk: 4,
        status: "active",
      },
      {
        id: "cnt-rahul",
        name: "Rahul Sharma",
        person_type: "contractor",
        role: "maintenance",
        department: "HVAC & Infrastructure Services",
        clearance_level: 2,
        active_zone_id: "loading_bay",
        current_risk: 14,
        status: "active",
      },
      {
        id: "vis-vikram",
        name: "Vikram Patel",
        person_type: "visitor",
        role: "visitor",
        department: "Vanguard Systems",
        clearance_level: 1,
        host_name: "Dr. Elena Vance",
        purpose: "Quarterly Cloud Infrastructure Review",
        active_zone_id: "main_entrance",
        current_risk: 28,
        status: "active",
      },
    ]
  },

  async revokeVisitor(personId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/visitors/${personId}/revoke`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {}
    fallbackRequests = fallbackRequests.map((r) =>
      r.subject_id === personId ? { ...r, status: "REVOKED" } : r
    )
    return { success: true, action: "REVOKE_ACCESS", person_id: personId }
  },

  async getPolicies(): Promise<PolicyRule[]> {
    try {
      const res = await fetch(`${API_BASE}/policies`)
      if (res.ok) return await res.json()
    } catch {}
    return [
      { id: "rule-1", name: "Security Operations Universal Access", resource: "*", role: "security", action: "ALLOW", conditions: { max_risk: 80 }, priority: 1 },
      { id: "rule-2", name: "Executive Admin Universal Access", resource: "*", role: "admin", action: "ALLOW", conditions: { max_risk: 75 }, priority: 2 },
      { id: "rule-3", name: "Server Vault Visitor Exclusion", resource: "server_room", role: "visitor", action: "DENY", conditions: {}, priority: 5 },
      { id: "rule-4", name: "Server Vault Maintenance Gate", resource: "server_room", role: "maintenance", action: "ALLOW", conditions: { requires_approval: true, max_duration_minutes: 60, max_risk: 45 }, priority: 10 },
      { id: "rule-5", name: "Lobby Visitor Daytime Policy", resource: "reception", role: "visitor", action: "ALLOW", conditions: { max_risk: 50 }, priority: 20 },
      { id: "rule-6", name: "Logistics Bay Standard Clearance", resource: "loading_bay", role: "maintenance", action: "ALLOW", conditions: { max_risk: 50 }, priority: 25 },
    ]
  },

  async getAuditTrail(): Promise<AuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/audit`)
      if (res.ok) return await res.json()
    } catch {}
    return [
      {
        id: "AUD-0001",
        timestamp: new Date().toISOString(),
        actor: "AEGIS Action Agent",
        action: "CREATE_TEMPORARY_ACCESS",
        source: "ring",
        target_resource: "Core Server Vault",
        decision: "ALLOW",
        risk_score: 15,
        reasons: ["Issued temporary credential (60m) to Rahul Sharma"],
      },
    ]
  },

  async queryCopilot(query: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (res.ok) return await res.json()
    } catch {}

    const lower = query.toLowerCase()
    if (lower.includes("deny") || lower.includes("why")) {
      return {
        answer: "**Zero-Trust Policy Explanation:**\n✓ Unknown visitor with unverified biometric signature\n✓ No scheduled appointment found in visitor calendar\n✓ Target zone: High-security Core Server Vault\n✓ PolicyMesh Rule 'Server Vault Visitor Exclusion' strictly denies unbadged guests\n✓ Risk threshold: 91/100 (CRITICAL) triggers automatic lockout",
        agent: "Risk & Policy Agent",
      }
    }
    if (lower.includes("give") || lower.includes("access")) {
      return {
        answer: "✓ Successfully provisioned temporary credential with 60-minute TTL. PolicyMesh rules verified.",
        agent: "AEGIS Orchestrator & Action Agent",
      }
    }
    return {
      answer: `AEGIS Operational Status: **HEALTHY**\n• Ring Cameras: 5 devices active\n• Facility Twin: 6 zones monitored\n• Active Incidents: 1\n• Policy Engine: PolicyMesh (Zero-Trust RBAC/ABAC active)\n\nYou asked: "${query}". All system telemetry is operational.`,
      agent: "AEGIS Orchestrator",
    }
  },

  async getDemoStatus(): Promise<DemoStatus> {
    try {
      const res = await fetch(`${API_BASE}/demo/status`)
      if (res.ok) return await res.json()
    } catch {}
    return {
      current_step: fallbackDemoStep,
      total_steps: 11,
      is_running: false,
      mode: "SIMULATION MODE",
      incident_id: "AE-1042",
      step_history: [],
    }
  },

  async resetDemo(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {}
    fallbackDemoStep = 0
    return { status: "reset", current_step: 0 }
  },

  async runDemoStep(stepNumber: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/demo/step/${stepNumber}`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {}
    fallbackDemoStep = stepNumber
    return { step: stepNumber, status: "completed", mode: "SIMULATION MODE" }
  },

  async controlRingDevice(deviceId: string, action: string, state: boolean = true): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/integrations/ring/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, action, state }),
      })
      if (res.ok) return await res.json()
    } catch {}
    return { success: true, mode: "SIMULATOR", device_id: deviceId, action, state }
  },
}
