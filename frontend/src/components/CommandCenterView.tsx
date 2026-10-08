import React, { useState } from 'react'
import {
  Shield,
  Activity,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Camera,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Zap,
} from 'lucide-react'
import {
  SystemStatus,
  SecurityEvent,
  Incident,
  AccessRequest,
  Zone,
} from '../types'
import { NavTab } from './Sidebar'

interface CommandCenterViewProps {
  status: SystemStatus | null
  events: SecurityEvent[]
  incidents: Incident[]
  accessRequests: AccessRequest[]
  zones: Zone[]
  onSelectTab: (tab: NavTab) => void
  onSelectIncident: (incidentId: string) => void
  onExecuteNlCommand: (cmd: string) => Promise<any>
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  status,
  events,
  incidents,
  accessRequests,
  zones,
  onSelectTab,
  onSelectIncident,
  onExecuteNlCommand,
}) => {
  const [nlInput, setNlInput] = useState('')
  const [nlLoading, setNlLoading] = useState(false)
  const [nlFeedback, setNlFeedback] = useState<string | null>(null)

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED')
  const avgRisk = status?.facility?.average_risk_score ?? 16

  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlInput.trim()) return
    setNlLoading(true)
    setNlFeedback(null)
    try {
      const res = await onExecuteNlCommand(nlInput)
      if (res.success) {
        setNlFeedback(`✓ ${res.message || 'Authorization successfully processed.'}`)
        setNlInput('')
      } else {
        setNlFeedback(`✗ ${res.error || 'Request rejected by policy.'}`)
      }
    } catch (err: any) {
      setNlFeedback(`✗ Failed to execute: ${err.message}`)
    } finally {
      setNlLoading(false)
    }
  }

  const handlePresetCommand = (preset: string) => {
    setNlInput(preset)
  }

  return (
    <div className="space-y-6">
      {/* Top Cyber Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: System Threat Level */}
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-sky-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Facility Threat Level
            </span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {avgRisk}/100
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                avgRisk > 80
                  ? 'bg-rose-500/20 text-rose-400'
                  : avgRisk > 60
                  ? 'bg-amber-500/20 text-amber-400'
                  : avgRisk > 30
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {avgRisk > 80 ? 'CRITICAL' : avgRisk > 60 ? 'HIGH' : avgRisk > 30 ? 'ELEVATED' : 'NOMINAL'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>6 Zones Monitored</span>
            <span className="text-emerald-400">Zero-Trust Active</span>
          </div>
        </div>

        {/* Metric 2: Ring Camera Integration */}
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-cyan-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Ring Video Devices
            </span>
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">5/5</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              ALL ONLINE
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>1080p HDR • Webhooks</span>
            <span className="text-sky-400">Actuators Armed</span>
          </div>
        </div>

        {/* Metric 3: Active Security Incidents */}
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-rose-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Correlated Incidents
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {activeIncidents.length}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                activeIncidents.length > 0
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {activeIncidents.length > 0 ? 'ACTIVE ACTION' : 'ALL CLEAR'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Multi-Cam Grouping</span>
            <button
              onClick={() => onSelectTab('incidents')}
              className="text-rose-400 hover:underline flex items-center"
            >
              <span>View</span>
              <ArrowRight className="w-2.5 h-2.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Metric 4: Temporary Passes Active */}
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-500 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Temporary Passes
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-white">
              {accessRequests.filter((r) => r.status === 'APPROVED').length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
              WITH TTL
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Automatic Expiration</span>
            <button
              onClick={() => onSelectTab('access_control')}
              className="text-amber-400 hover:underline flex items-center"
            >
              <span>Manage</span>
              <ArrowRight className="w-2.5 h-2.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Natural Language Access Control Directive Bar */}
      <div className="glass-panel p-5 rounded-xl border border-sky-500/30 bg-gradient-to-r from-slate-900/90 via-cyber-850 to-slate-900/90 shadow-glow-blue">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Natural Language Physical Access Control (AgentCore + PolicyMesh)
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Identity → PolicyMesh → Risk → Temporary Grant → Audit
          </div>
        </div>

        <form onSubmit={handleNlSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              placeholder='e.g. "Give Rahul from maintenance access to the server room from 2 PM to 4 PM"'
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={nlLoading}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-2 transition-colors shrink-0"
          >
            {nlLoading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Authorize</span>
          </button>
        </form>

        {/* Quick Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="font-mono text-[10px] text-slate-500 uppercase">Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetCommand('Give Rahul from maintenance access to the server room from 2 PM to 4 PM')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          >
            Rahul (Server Vault, 2 PM - 4 PM)
          </button>
          <button
            type="button"
            onClick={() => handlePresetCommand('Give Vikram visitor access to reception for 60 minutes')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          >
            Vikram (Reception, 60m)
          </button>
          <button
            type="button"
            onClick={() => handlePresetCommand('Revoke access for visitor Vikram Patel immediately')}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors"
          >
            Revoke Vikram Pass
          </button>
        </div>

        {nlFeedback && (
          <div
            className={`mt-3 p-2.5 rounded text-xs font-mono ${
              nlFeedback.startsWith('✓')
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
            }`}
          >
            {nlFeedback}
          </div>
        )}
      </div>

      {/* Main Dual Grid: Digital Twin Minimap & Real-time Live Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Digital Twin Minimap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-cyber-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">
                  Live Cyber-Physical Digital Twin (Apex HQ)
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('security_map')}
                className="text-xs text-sky-400 hover:underline flex items-center"
              >
                <span>Full Map</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Visual Facility Zone Blueprint */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {zones.map((zone) => {
                const isRiskHigh = zone.current_risk > 60
                const isRiskMedium = zone.current_risk > 30

                return (
                  <div
                    key={zone.id}
                    onClick={() => onSelectTab('security_map')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                      isRiskHigh
                        ? 'bg-rose-950/30 border-rose-500/50 shadow-glow-red'
                        : isRiskMedium
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-white leading-tight">
                        {zone.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          isRiskHigh
                            ? 'bg-rose-500/20 text-rose-300'
                            : isRiskMedium
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {zone.current_risk}/100
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">
                      {zone.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-sky-400" />
                        <span>{zone.active_cameras.length} Cam</span>
                      </span>
                      <span>
                        {zone.current_occupants.length > 0 ? (
                          <span className="text-cyan-400 font-semibold">
                            {zone.current_occupants.length} Occupant(s)
                          </span>
                        ) : (
                          'Empty'
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Incidents Banner */}
          {activeIncidents.length > 0 && (
            <div className="glass-panel p-5 rounded-xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-cyber-850 to-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                    High-Risk Incident Active: #{activeIncidents[0].id}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  {activeIncidents[0].severity} • RISK {activeIncidents[0].risk_score}/100
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium">
                {activeIncidents[0].ai_summary || activeIncidents[0].title}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Affected Zones: <span className="text-rose-300 font-mono font-semibold">{activeIncidents[0].affected_zones.join(' → ')}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onSelectIncident(activeIncidents[0].id)}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Investigate Incident</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Live Ring Event Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-cyber-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">
                  Real-time Ring Event Stream
                </h3>
              </div>
              <button
                onClick={() => onSelectTab('live_events')}
                className="text-xs text-sky-400 hover:underline flex items-center"
              >
                <span>Full Feed</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {events.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No events received yet. Start the demo scenario or trigger an event.
                </div>
              ) : (
                events.slice(0, 7).map((ev) => {
                  const isHigh = ev.risk_score > 60
                  const isMed = ev.risk_score > 30

                  return (
                    <div
                      key={ev.event_id}
                      className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Camera className="w-3 h-3 text-sky-400" />
                          <span className="font-mono font-semibold text-slate-200">
                            {ev.device_id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({ev.zone_name})
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {ev.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">
                          {ev.event_type.replace('_', ' ')}
                        </span>
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isHigh
                              ? 'bg-rose-500/20 text-rose-300'
                              : isMed
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          Risk: {ev.risk_score}
                        </span>
                      </div>

                      {ev.reasons && ev.reasons.length > 0 && (
                        <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                          {ev.reasons[0]}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
