import React, { useState } from 'react'
import {
  KeyRound,
  Sparkles,
  Send,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { AccessRequest } from '../types'
import { api } from '../api'

interface AccessControlViewProps {
  accessRequests: AccessRequest[]
  onRefreshRequests: () => void
  onExecuteNlCommand: (cmd: string) => Promise<any>
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({
  accessRequests,
  onRefreshRequests,
  onExecuteNlCommand,
}) => {
  const [nlInput, setNlInput] = useState(
    'Give Rahul from maintenance access to the server room from 2 PM to 4 PM'
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [revocationMsg, setRevocationMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlInput.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await onExecuteNlCommand(nlInput)
      setResult(res)
      onRefreshRequests()
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (personId: string, subjectName: string) => {
    try {
      await api.revokeVisitor(personId)
      setRevocationMsg(`✓ Access revoked immediately for ${subjectName}`)
      onRefreshRequests()
      setTimeout(() => setRevocationMsg(null), 3500)
    } catch (err: any) {
      setRevocationMsg(`✗ Error revoking: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <KeyRound className="w-5 h-5 text-sky-400" />
          <span>Natural Language Access Control & Temporary Credentials</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Transforms natural language directives into structured Zero-Trust authorization through PolicyMesh.
        </p>
      </div>

      {/* Main Interactive NL Input Panel */}
      <div className="glass-panel p-6 rounded-xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-cyber-850 to-slate-900/90 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>AI Natural Language Parser & PolicyMesh Gate</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            RBAC + ABAC + Risk Thresholds
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder='e.g. "Give Rahul from maintenance access to the server room from 2 PM to 4 PM"'
            className="flex-1 px-4 py-3 rounded-lg bg-slate-950/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs flex items-center space-x-2 transition-colors shrink-0 font-mono"
          >
            {loading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>EXECUTE PASS</span>
          </button>
        </form>

        {/* Execution Trace Pipeline Card */}
        {result && (
          <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300">
                PIPELINE EXECUTION TRACE
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  result.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {result.success ? 'AUTHORIZED' : 'POLICY DENIED'}
              </span>
            </div>

            {/* Trace Step Nodes */}
            {result.trace && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs font-mono">
                {result.trace.map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1"
                  >
                    <div className="text-[10px] text-sky-400 font-bold uppercase">
                      {t.stage}
                    </div>
                    <div className="text-slate-200 text-[11px] font-sans">
                      {t.agent}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {t.decision || t.status || t.action || 'Complete'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Authorization Output */}
            {result.structured_authorization && (
              <div className="p-3 rounded bg-slate-900/90 border border-sky-500/20 space-y-2">
                <div className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                  Structured Authorization JSON
                </div>
                <pre className="text-[11px] text-slate-300 font-mono overflow-x-auto p-2 bg-black/60 rounded">
                  {JSON.stringify(result.structured_authorization, null, 2)}
                </pre>
              </div>
            )}

            {result.message && (
              <p className="text-xs text-emerald-300 font-sans font-medium">
                {result.message}
              </p>
            )}
            {result.error && (
              <p className="text-xs text-rose-300 font-sans font-medium">
                {result.error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Active Passes & Requests Table */}
      <div className="glass-panel rounded-xl border border-cyber-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>ACTIVE TEMPORARY PASSES & PERMITS</span>
          {revocationMsg && (
            <span className="text-emerald-400 animate-pulse font-bold">
              {revocationMsg}
            </span>
          )}
        </div>

        <div className="divide-y divide-slate-800/80">
          {accessRequests.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500 font-mono">
              No temporary credentials issued. Use the command box above to provision access.
            </div>
          ) : (
            accessRequests.map((req) => {
              const isApproved = req.status === 'APPROVED'
              const isRevoked = req.status === 'REVOKED'

              return (
                <div
                  key={req.id}
                  className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isRevoked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <KeyRound className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          {req.subject_name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {req.role}
                        </span>
                        <span className="text-slate-400 text-xs">
                          target: <strong className="text-slate-200">{req.resource_name}</strong>
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] font-sans">
                        {req.reason}
                      </p>

                      <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-3">
                        <span>Approver: {req.approver || 'System'}</span>
                        <span>Duration: {req.duration_minutes}m TTL</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isRevoked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {req.status}
                    </span>

                    {isApproved && (
                      <button
                        onClick={() => handleRevoke(req.subject_id, req.subject_name)}
                        className="px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold border border-rose-500/30 transition-colors"
                      >
                        Revoke Now
                      </button>
                    )}
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
