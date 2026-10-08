import React from 'react'
import {
  Scale,
  Shield,
  Clock,
  Layers,
  Code2,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { PolicyRule } from '../types'

interface PoliciesViewProps {
  policies: PolicyRule[]
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({ policies }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Scale className="w-5 h-5 text-sky-400" />
            <span>PolicyMesh: Open-Source Deterministic Security Rules</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Secondary Mini Challenge: Reusable Zero-Trust physical access policy evaluation engine.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            MIT LICENSE • OPEN SOURCE
          </span>
        </div>
      </div>

      {/* Code Snippet & Open Source Highlight Card */}
      <div className="glass-panel p-5 rounded-xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-cyber-850 to-slate-900/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              Clean Developer API: policymesh (Python & TypeScript)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Standalone Package in /policymesh/
          </span>
        </div>

        <pre className="p-3.5 rounded-lg bg-black/75 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`from policymesh import PolicyEngine, PolicyRule, PolicyDecision

engine = PolicyEngine()
decision = engine.evaluate_access(
    subject=Subject(name="Rahul Sharma", role="maintenance", clearance_level=2),
    resource=Resource(id="server_room", security_level=4),
    action="enter",
    context=AccessContext(risk_score=15, current_time="14:00")
)
# Returns: PolicyDecision.REQUEST_APPROVAL (required_approval=True, max_duration=60m)`}
        </pre>
      </div>

      {/* Active Rules Grid */}
      <div className="glass-panel rounded-xl border border-cyber-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border text-xs text-slate-400 font-mono">
          ACTIVE DETERMINISTIC RULES ENFORCED ({policies.length})
        </div>

        <div className="divide-y divide-slate-800/80">
          {policies.map((rule) => {
            const isAllow = rule.action === 'ALLOW'
            const isDeny = rule.action === 'DENY'

            return (
              <div
                key={rule.id}
                className="p-5 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">
                      {rule.name}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      ID: {rule.id}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400">
                      Priority: {rule.priority}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
                    <span>Target: <strong className="text-slate-200">{rule.resource}</strong></span>
                    <span>Role: <strong className="text-slate-200">{rule.role}</strong></span>
                  </div>

                  {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                    <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-2 pt-1">
                      {rule.conditions.max_risk && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Max Risk: {rule.conditions.max_risk}
                        </span>
                      )}
                      {rule.conditions.requires_approval && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-bold">
                          Approval Required
                        </span>
                      )}
                      {rule.conditions.max_duration_minutes && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Max Duration: {rule.conditions.max_duration_minutes}m
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="shrink-0 self-end md:self-center">
                  <span
                    className={`font-mono text-xs font-bold px-3 py-1 rounded border ${
                      isAllow
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isDeny
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    ACTION: {rule.action}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
