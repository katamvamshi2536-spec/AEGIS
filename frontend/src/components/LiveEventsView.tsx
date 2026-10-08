import React, { useState } from 'react'
import {
  Radio,
  Camera,
  Filter,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { SecurityEvent } from '../types'
import { api } from '../api'

interface LiveEventsViewProps {
  events: SecurityEvent[]
  onRefreshEvents: () => void
}

export const LiveEventsView: React.FC<LiveEventsViewProps> = ({
  events,
  onRefreshEvents,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null)
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null)

  const handleManualTrigger = async (deviceId: string, kind: string, actor?: string) => {
    try {
      setTriggerStatus(`Triggering ${kind} on ${deviceId}...`)
      await api.triggerEvent(deviceId, kind, actor)
      setTriggerStatus(`✓ Successfully emitted ${kind} event from ${deviceId}`)
      onRefreshEvents()
      setTimeout(() => setTriggerStatus(null), 3500)
    } catch (err: any) {
      setTriggerStatus(`✗ Error: ${err.message}`)
    }
  }

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true
    if (filterType === 'HIGH_RISK') return e.risk_score > 60
    if (filterType === 'DING') return e.event_type.toLowerCase().includes('doorbell') || e.event_type.toLowerCase().includes('visitor')
    if (filterType === 'MOTION') return e.event_type.toLowerCase().includes('motion')
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header & Quick Manual Trigger Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>Real-time Ring Security Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Live ingestion from Ring Video Doorbell, Stick Up Cam, and Floodlight devices.
          </p>
        </div>

        {/* Live Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {['ALL', 'HIGH_RISK', 'DING', 'MOTION'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-all ${
                filterType === f
                  ? 'bg-sky-500 text-white shadow-glow-blue'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Hardware Simulation Bar */}
      <div className="glass-panel p-4 rounded-xl border border-cyber-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>Interactive Ring Device Signal Dispatcher</span>
          </span>
          {triggerStatus && (
            <span className="text-[11px] font-mono text-cyan-300 animate-pulse">
              {triggerStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleManualTrigger('ring-cam-01', 'ding', 'Guest Visitor')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
          >
            <div className="text-[11px] font-semibold text-slate-200 group-hover:text-sky-300">
              Doorbell Ring (Cam 01)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Main Entrance Gate
            </div>
          </button>

          <button
            onClick={() => handleManualTrigger('ring-cam-02', 'motion', 'Dr. Elena Vance')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
          >
            <div className="text-[11px] font-semibold text-slate-200 group-hover:text-sky-300">
              Motion Alert (Cam 02)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Reception Lobby
            </div>
          </button>

          <button
            onClick={() => handleManualTrigger('ring-cam-03', 'motion', 'Unverified Subject')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 text-left transition-all group"
          >
            <div className="text-[11px] font-semibold text-slate-200 group-hover:text-amber-300">
              Corridor Traversal (Cam 03)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Server Room Approach
            </div>
          </button>

          <button
            onClick={() => handleManualTrigger('ring-cam-04', 'access_attempt', 'Intruder')}
            className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 text-left transition-all group"
          >
            <div className="text-[11px] font-semibold text-slate-200 group-hover:text-rose-300">
              Door Access Failed (Cam 04)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Core Server Vault
            </div>
          </button>
        </div>
      </div>

      {/* Events Table / Timeline */}
      <div className="glass-panel rounded-xl border border-cyber-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>EVENT STREAM ({filteredEvents.length})</span>
          <span>TIMESTAMP • UTC</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              No matching events found. Use the dispatcher above to emit a live Ring event.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isHigh = ev.risk_score > 60
              const isMed = ev.risk_score > 30

              return (
                <div
                  key={ev.event_id}
                  className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isMed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          {ev.event_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {ev.device_id}
                        </span>
                        <span className="text-slate-400 text-xs">
                          at <span className="text-slate-200 font-medium">{ev.zone_name}</span>
                        </span>
                        {ev.simulation_mode && (
                          <span className="font-mono text-[9px] px-1 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                            SIMULATION
                          </span>
                        )}
                      </div>

                      <div className="text-slate-400 text-[11px] flex items-center space-x-3 font-mono">
                        <span>Subject: <strong className="text-slate-300">{ev.actor}</strong></span>
                        <span>Confidence: <strong>{(ev.confidence * 100).toFixed(1)}%</strong></span>
                      </div>

                      {ev.reasons && ev.reasons.length > 0 && (
                        <div className="text-[11px] text-slate-400 font-mono mt-1">
                          {ev.reasons[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <div
                        className={`font-mono text-xs font-bold ${
                          isHigh
                            ? 'text-rose-400'
                            : isMed
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        Risk {ev.risk_score}/100
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {ev.timestamp}
                      </div>
                    </div>

                    {ev.snapshot_url && (
                      <button
                        onClick={() => setSelectedSnapshot(ev.snapshot_url || null)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-mono border border-slate-700 transition-colors"
                      >
                        Snapshot
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Snapshot Preview Modal */}
      {selectedSnapshot && (
        <div
          onClick={() => setSelectedSnapshot(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-cyber-900 border border-cyber-border rounded-xl p-4 max-w-2xl w-full space-y-3 cursor-default shadow-2xl"
          >
            <div className="flex justify-between items-center text-xs font-mono text-slate-300">
              <span>RING CAMERA CAPTURE • 1080p HDR TELEMETRY</span>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
              <img
                src={selectedSnapshot}
                alt="Ring Camera Capture"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
