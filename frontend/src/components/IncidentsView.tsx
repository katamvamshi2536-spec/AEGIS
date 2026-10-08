import React, { useState } from 'react'
import {
  AlertTriangle,
  SearchCode,
  ShieldAlert,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Incident } from '../types'

interface IncidentsViewProps {
  incidents: Incident[]
  onSelectIncident: (id: string) => void
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [filter, setFilter] = useState<string>('ALL')

  const filtered = incidents.filter((i) => {
    if (filter === 'ALL') return true
    if (filter === 'CRITICAL') return i.severity === 'CRITICAL'
    if (filter === 'HIGH') return i.severity === 'HIGH'
    if (filter === 'OPEN') return i.status !== 'RESOLVED'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Correlated Security Incidents Triage</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Multi-camera event correlation groups discrete alerts into unified security investigations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          {['ALL', 'OPEN', 'CRITICAL', 'HIGH'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-all ${
                filter === f
                  ? 'bg-rose-600 text-white shadow-glow-red'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Table */}
      <div className="glass-panel rounded-xl border border-cyber-border overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              No incidents registered. Use the Demo Scenario to trigger Incident #AE-1042.
            </div>
          ) : (
            filtered.map((inc) => {
              const isCrit = inc.severity === 'CRITICAL'
              const isHigh = inc.severity === 'HIGH'

              return (
                <div
                  key={inc.id}
                  className="p-5 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-sm font-black text-rose-400">
                        #{inc.id}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                          isCrit
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-glow-red'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        STATUS: {inc.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm">
                      {inc.title}
                    </h3>

                    <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
                      {inc.ai_summary || 'Correlated physical security anomaly registered.'}
                    </p>

                    <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
                      <span>Affected Zones: <strong className="text-slate-200">{inc.affected_zones.join(' → ')}</strong></span>
                      <span>Timeline: <strong>{inc.timeline.length} events</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        RISK SCORE
                      </div>
                      <div
                        className={`text-2xl font-black font-mono ${
                          isCrit ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-sky-400'
                        }`}
                      >
                        {inc.risk_score}/100
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectIncident(inc.id)}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-glow-blue"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Investigate</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
