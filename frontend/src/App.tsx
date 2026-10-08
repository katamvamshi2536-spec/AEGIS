import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Sidebar, NavTab } from './components/Sidebar'
import { CommandCenterView } from './components/CommandCenterView'
import { LiveEventsView } from './components/LiveEventsView'
import { SecurityMapView } from './components/SecurityMapView'
import { AccessControlView } from './components/AccessControlView'
import { VisitorsView } from './components/VisitorsView'
import { IncidentsView } from './components/IncidentsView'
import { InvestigationView } from './components/InvestigationView'
import { RiskIntelligenceView } from './components/RiskIntelligenceView'
import { PoliciesView } from './components/PoliciesView'
import { AuditTrailView } from './components/AuditTrailView'
import { AiCopilotDrawer } from './components/AiCopilotDrawer'
import { DemoScrubberModal } from './components/DemoScrubberModal'
import { api } from './api'
import {
  SystemStatus,
  SecurityEvent,
  Incident,
  AccessRequest,
  Zone,
  RingDevice,
  PolicyRule,
  Person,
  AuditLog,
  DemoStatus,
} from './types'

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('command_center')
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [devices, setDevices] = useState<RingDevice[]>([])
  const [policies, setPolicies] = useState<PolicyRule[]>([])
  const [visitors, setVisitors] = useState<Person[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null)

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('AE-1042')
  const [isCopilotOpen, setIsCopilotOpen] = useState(false)
  const [isDemoScrubberOpen, setIsDemoScrubberOpen] = useState(false)

  // Fetch initial telemetry
  const loadData = async () => {
    try {
      const [
        statusData,
        eventsData,
        incidentsData,
        requestsData,
        zonesData,
        policiesData,
        visitorsData,
        auditData,
        demoData,
      ] = await Promise.all([
        api.getStatus().catch(() => null),
        api.getEvents().catch(() => []),
        api.getIncidents().catch(() => []),
        api.getAccessRequests().catch(() => []),
        api.getZones().catch(() => []),
        api.getPolicies().catch(() => []),
        api.getVisitors().catch(() => []),
        api.getAuditTrail().catch(() => []),
        api.getDemoStatus().catch(() => null),
      ])

      if (statusData) {
        setStatus(statusData)
        if (statusData.facility?.devices) {
          setDevices(statusData.facility.devices)
        }
      }
      setEvents(eventsData)
      setIncidents(incidentsData)
      setAccessRequests(requestsData)
      setZones(zonesData)
      setPolicies(policiesData)
      setVisitors(visitorsData)
      setAuditLogs(auditData)
      if (demoData) setDemoStatus(demoData)
    } catch (e) {
      console.error('Error loading AEGIS data:', e)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  // WebSocket for real-time live events
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`
    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(wsUrl)
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'NEW_EVENT' && msg.event) {
            setEvents((prev) => [msg.event, ...prev])
          } else if (msg.type === 'DEMO_STEP' || msg.type === 'DEMO_RESET') {
            loadData()
          } else if (msg.type === 'ACCESS_UPDATE' || msg.type === 'ACCESS_REVOKED') {
            loadData()
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    } catch (err) {
      console.warn('WebSocket connection error:', err)
    }

    return () => {
      ws?.close()
    }
  }, [])

  // Navigation handlers
  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id)
    setCurrentTab('investigations')
  }

  const handleRunDemoStep = async (step: number) => {
    try {
      await api.runDemoStep(step)
      const newDemo = await api.getDemoStatus()
      setDemoStatus(newDemo)
      await loadData()
      if (step === 7 || step === 8 || step === 9) {
        setSelectedIncidentId('AE-1042')
      }
    } catch (e) {
      console.error('Error running demo step:', e)
    }
  }

  const handleRunNextStep = async () => {
    const next = (demoStatus?.current_step || 0) + 1
    if (next <= 11) {
      await handleRunDemoStep(next)
    }
  }

  const handleResetDemo = async () => {
    try {
      await api.resetDemo()
      const newDemo = await api.getDemoStatus()
      setDemoStatus(newDemo)
      await loadData()
    } catch (e) {
      console.error('Error resetting demo:', e)
    }
  }

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans">
      {/* Top SOC Navigation Bar */}
      <Header
        status={status}
        demoStatus={demoStatus}
        onOpenDemoScrubber={() => setIsDemoScrubberOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        onResetDemo={handleResetDemo}
        onRunNextStep={handleRunNextStep}
        isCopilotOpen={isCopilotOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          incidentCount={incidents.filter((i) => i.status !== 'RESOLVED').length}
          eventCount={events.length}
          onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#090e17] via-[#06090e] to-[#04060a]">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'command_center' && (
              <CommandCenterView
                status={status}
                events={events}
                incidents={incidents}
                accessRequests={accessRequests}
                zones={zones}
                onSelectTab={setCurrentTab}
                onSelectIncident={handleSelectIncident}
                onExecuteNlCommand={api.executeNlCommand}
              />
            )}

            {currentTab === 'live_events' && (
              <LiveEventsView events={events} onRefreshEvents={loadData} />
            )}

            {currentTab === 'security_map' && (
              <SecurityMapView
                zones={zones}
                devices={devices}
                events={events}
                incidents={incidents}
              />
            )}

            {currentTab === 'access_control' && (
              <AccessControlView
                accessRequests={accessRequests}
                onRefreshRequests={loadData}
                onExecuteNlCommand={api.executeNlCommand}
              />
            )}

            {currentTab === 'visitors' && (
              <VisitorsView visitors={visitors} onRefresh={loadData} />
            )}

            {currentTab === 'incidents' && (
              <IncidentsView
                incidents={incidents}
                onSelectIncident={handleSelectIncident}
              />
            )}

            {currentTab === 'investigations' && (
              <InvestigationView
                incidents={incidents}
                selectedIncidentId={selectedIncidentId}
                onRefresh={loadData}
              />
            )}

            {currentTab === 'risk_intelligence' && <RiskIntelligenceView />}

            {currentTab === 'policies' && <PoliciesView policies={policies} />}

            {currentTab === 'audit_trail' && <AuditTrailView logs={auditLogs} />}
          </div>
        </main>
      </div>

      {/* Floating / Docked AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Single-Click Demo Scenario Scrubber Modal */}
      <DemoScrubberModal
        isOpen={isDemoScrubberOpen}
        onClose={() => setIsDemoScrubberOpen(false)}
        demoStatus={demoStatus}
        onRunStep={handleRunDemoStep}
        onReset={handleResetDemo}
      />
    </div>
  )
}
export default App
