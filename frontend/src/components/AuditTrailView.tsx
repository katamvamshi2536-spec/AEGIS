import React from 'react'
import {
  History,
  Shield,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { AuditLog } from '../types'

interface AuditTrailViewProps {
  logs: AuditLog[]
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-sky-400" />
          <span>Immutable Physical Security Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Cryptographically auditable record of every Ring event, agent reasoning step, and cyber-physical actuator mutation.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-xl border border-cyber-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>AUDIT EVENT LEDGER ({logs.length})</span>
          <span>COMPLIANCE LEVEL: ZERO-TRUST</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">
              No audit entries recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const isAllow = log.decision === 'ALLOW'
              const isRevoke = log.decision === 'REVOKE' || log.decision === 'DENY'

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {log.id}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {log.action}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        Source: {log.source}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
                      <span>Actor: <strong className="text-slate-200">{log.actor}</strong></span>
                      <span>Target: <strong className="text-slate-200">{log.target_resource}</strong></span>
                    </div>

                    {log.reasons && log.reasons.length > 0 && (
                      <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                        {log.reasons[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-center shrink-0">
                    <div className="text-right">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border inline-block ${
                          isAllow
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isRevoke
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {log.decision}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
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
