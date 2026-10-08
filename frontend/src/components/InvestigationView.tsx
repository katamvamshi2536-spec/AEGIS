import React, { useState } from 'react'
import {
  SearchCode,
  AlertTriangle,
  Camera,
  ShieldAlert,
  Volume2,
  Lock,
  XOctagon,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Incident } from '../types'
import { api } from '../api'

interface InvestigationViewProps {
  incidents: Incident[]
  selectedIncidentId?: string
  onRefresh: () => void
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  incidents,
  selectedIncidentId,
  onRefresh,
}) => {
  const [currentId, setCurrentId] = useState<string>(
    selectedIncidentId || incidents[0]?.id || 'AE-1042'
  )
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const activeIncident = incidents.find((i) => i.id === currentId) || incidents[0]

  const handleEscalate = async () => {
    if (!activeIncident) return
    try {
      await api.escalateIncident(activeIncident.id)
      setActionNotice(`✓ Incident #${activeIncident.id} escalated to CRITICAL. Ring siren armed.`)
      onRefresh()
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err: any) {
      setActionNotice(`✗ Error: ${err.message}`)
    }
  }

  const handleArmSiren = async () => {
    try {
      await api.controlRingDevice('ring-cam-04', 'toggle_siren', true)
      setActionNotice(`✓ 110dB siren armed on Core Server Vault Ring Floodlight Cam!`)
      setTimeout(() => setActionNotice(null), 4000)
    } catch (err: any) {
      setActionNotice(`✗ Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <SearchCode className="w-5 h-5 text-sky-400" />
            <span>AI Forensic Investigation Engine</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Multi-camera correlation, chronological event timeline, corroborated evidence, and automated countermeasure dispatch.
          </p>
        </div>

        {actionNotice && (
          <div className="px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-300 text-xs font-mono animate-fade-in">
            {actionNotice}
          </div>
        )}
      </div>

      {activeIncident ? (
        <div className="space-y-6">
          {/* Incident Triage Header Card */}
          <div className="glass-panel p-6 rounded-xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-cyber-850 to-slate-900 shadow-glow-red">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                    INCIDENT CASEFILE
                  </span>
                  <span className="text-xl font-black text-white font-mono">
                    #{activeIncident.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {activeIncident.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300">
                    STATUS: {activeIncident.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-2">
                  {activeIncident.title}
                </h3>
              </div>

              {/* Threat Risk Meter */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    THREAT RISK SCORE
                  </div>
                  <div className="text-3xl font-black font-mono text-rose-400">
                    {activeIncident.risk_score}
                    <span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                </div>

                {/* Countermeasure Actions */}
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={handleEscalate}
                    className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono transition-colors flex items-center space-x-1.5 shadow-glow-red"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>ESCALATE THREAT</span>
                  </button>
                  <button
                    onClick={handleArmSiren}
                    className="px-3.5 py-1.5 rounded bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-colors flex items-center space-x-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>ARM RING SIREN (110dB)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Narrative & Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Summary */}
            <div className="glass-panel p-5 rounded-xl border border-cyber-border space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Agent Forensic Summary</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeIncident.ai_summary ||
                  'The visitor entered the facility under temporary reception authorization but subsequently moved toward a restricted zone outside the scope of their credential. Repeated access attempts increased the risk score.'}
              </p>
            </div>

            {/* AI Recommendations */}
            <div className="glass-panel p-5 rounded-xl border border-cyber-border space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Recommended Countermeasures</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                {(activeIncident.recommended_actions || [
                  'Lock down Core Server Vault Smart Lock',
                  'Arm Ring Floodlight Cam siren (110dB)',
                  'Revoke temporary authorization passes immediately',
                  'Dispatch security officer Marcus Thorne',
                ]).map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">›</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Chronological Multi-Camera Timeline */}
          <div className="glass-panel p-6 rounded-xl border border-cyber-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Correlated Multi-Camera Event Timeline</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {activeIncident.timeline.length} Sequenced Telemetry Signals
              </span>
            </div>

            <div className="relative border-l border-slate-800 ml-4 space-y-6 pl-6 py-2">
              {activeIncident.timeline.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono">
                  No chronological events recorded yet. Run the Demo Scenario to view timeline reconstruction.
                </div>
              ) : (
                activeIncident.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center text-[10px] font-mono font-bold text-sky-400 group-hover:bg-sky-500 group-hover:text-black transition-colors">
                      {step.step || idx + 1}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sky-300 font-bold">
                          {step.time}
                        </span>
                        <span className="font-bold text-white">
                          {step.zone_name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {step.device_id}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        CV Match: {step.confidence ? (step.confidence * 100).toFixed(0) : 95}%
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-300 font-sans">
                      {step.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-xs text-slate-500 font-mono">
          No incident selected. Launch the Demo Scenario to trigger and investigate Incident #AE-1042.
        </div>
      )}
    </div>
  )
}
