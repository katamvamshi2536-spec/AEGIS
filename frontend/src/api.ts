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

export const api = {
  async getStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/status`)
    return res.json()
  },

  async getFacility(): Promise<any> {
    const res = await fetch(`${API_BASE}/facility`)
    return res.json()
  },

  async getZones(): Promise<Zone[]> {
    const res = await fetch(`${API_BASE}/zones`)
    return res.json()
  },

  async getZoneDetails(zoneId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/zones/${zoneId}`)
    return res.json()
  },

  async getEvents(): Promise<SecurityEvent[]> {
    const res = await fetch(`${API_BASE}/events`)
    return res.json()
  },

  async triggerEvent(deviceId: string, kind: string, actorName?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/events/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, kind, actor_name: actorName }),
    })
    return res.json()
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/incidents`)
    return res.json()
  },

  async getIncident(id: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${id}`)
    return res.json()
  },

  async investigateIncident(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${id}/investigate`, {
      method: 'POST',
    })
    return res.json()
  },

  async escalateIncident(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${id}/escalate`, {
      method: 'POST',
    })
    return res.json()
  },

  async getAccessRequests(): Promise<AccessRequest[]> {
    const res = await fetch(`${API_BASE}/access/requests`)
    return res.json()
  },

  async executeNlCommand(command: string): Promise<any> {
    const res = await fetch(`${API_BASE}/access/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    return res.json()
  },

  async getVisitors(): Promise<Person[]> {
    const res = await fetch(`${API_BASE}/visitors`)
    return res.json()
  },

  async revokeVisitor(personId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/visitors/${personId}/revoke`, {
      method: 'POST',
    })
    return res.json()
  },

  async getPolicies(): Promise<PolicyRule[]> {
    const res = await fetch(`${API_BASE}/policies`)
    return res.json()
  },

  async getAuditTrail(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit`)
    return res.json()
  },

  async queryCopilot(query: string): Promise<any> {
    const res = await fetch(`${API_BASE}/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    return res.json()
  },

  // Demo Scenario endpoints
  async getDemoStatus(): Promise<DemoStatus> {
    const res = await fetch(`${API_BASE}/demo/status`)
    return res.json()
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' })
    return res.json()
  },

  async runDemoStep(stepNumber: number): Promise<any> {
    const res = await fetch(`${API_BASE}/demo/step/${stepNumber}`, {
      method: 'POST',
    })
    return res.json()
  },

  // Ring device controls
  async controlRingDevice(deviceId: string, action: string, state: boolean = true): Promise<any> {
    const res = await fetch(`${API_BASE}/integrations/ring/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, action, state }),
    })
    return res.json()
  },
}
