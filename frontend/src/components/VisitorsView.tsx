import React, { useState } from 'react'
import {
  Users,
  Shield,
  Clock,
  KeyRound,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import { Person } from '../types'
import { api } from '../api'

interface VisitorsViewProps {
  visitors: Person[]
  onRefresh: () => void
}

export const VisitorsView: React.FC<VisitorsViewProps> = ({ visitors, onRefresh }) => {
  const [filter, setFilter] = useState<string>('ALL')
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleRevoke = async (personId: string, name: string) => {
    try {
      await api.revokeVisitor(personId)
      setFeedback(`✓ Revoked credentials for ${name}`)
      onRefresh()
      setTimeout(() => setFeedback(null), 3000)
    } catch (err: any) {
      setFeedback(`✗ Error: ${err.message}`)
    }
  }

  const filteredVisitors = visitors.filter((v) => {
    if (filter === 'ALL') return true
    if (filter === 'VISITORS') return v.person_type === 'visitor'
    if (filter === 'EMPLOYEES') return v.person_type === 'employee' || v.person_type === 'admin' || v.person_type === 'security'
    if (filter === 'CONTRACTORS') return v.person_type === 'contractor'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Personnel & Visitor Identity Registry</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Managed identity profiles, active credentials, clearances, and host sponsorships.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs">
          {['ALL', 'VISITORS', 'EMPLOYEES', 'CONTRACTORS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-semibold transition-all ${
                filter === f
                  ? 'bg-sky-500 text-white shadow-glow-blue'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="px-4 py-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
          {feedback}
        </div>
      )}

      {/* Grid of Person Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitors.map((p) => {
          const isVisitor = p.person_type === 'visitor'
          const isSecurity = p.person_type === 'security' || p.role === 'admin'

          return (
            <div
              key={p.id}
              className="glass-panel p-5 rounded-xl border border-cyber-border hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {p.role}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {p.department || 'External Guest'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isSecurity
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : isVisitor
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  Clearance {p.clearance_level}
                </span>
              </div>

              {/* Host & Purpose */}
              {isVisitor && (
                <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] space-y-1 font-mono">
                  <div className="text-slate-400">
                    Host: <strong className="text-slate-200">{p.host_name || 'Dr. Elena Vance'}</strong>
                  </div>
                  <div className="text-slate-400">
                    Purpose: <span className="text-slate-300">{p.purpose || 'Technical Briefing'}</span>
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">
                  Zone: <strong className="text-cyan-300">{p.active_zone_id || 'Exterior'}</strong>
                </span>

                <button
                  onClick={() => handleRevoke(p.id, p.name)}
                  className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-semibold border border-rose-500/30 transition-colors"
                >
                  Revoke Pass
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
