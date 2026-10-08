import React, { useState } from 'react'
import {
  Gauge,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react'

export const RiskIntelligenceView: React.FC = () => {
  // Interactive Simulator State
  const [factors, setFactors] = useState({
    unknown_visitor: true,
    no_appointment: true,
    invalid_credential: true,
    restricted_zone: true,
    failed_attempts_3: true,
    after_hours: false,
    abnormal_movement: true,
    velocity_anomaly: false,
    tamper_alert: false,
    policy_violation: true,
    historical_incident: false,
  })

  // Dynamic Score Calculation
  let score = 0
  const reasons: string[] = []

  if (factors.unknown_visitor) {
    score += 25
    reasons.push('✓ Unknown visitor / unverified biometric signature')
  }
  if (factors.no_appointment) {
    score += 20
    reasons.push('✓ No scheduled appointment found in visitor registry')
  }
  if (factors.invalid_credential) {
    score += 25
    reasons.push('✓ Unrecognized or missing access credential')
  }
  if (factors.restricted_zone) {
    score += 25
    reasons.push('✓ High-security restricted area (Zone clearance required)')
  }
  if (factors.failed_attempts_3) {
    score += 45
    reasons.push('✓ 3 repeated failed door access attempt(s)')
  }
  if (factors.after_hours) {
    score += 15
    reasons.push('✓ Movement outside facility operational hours')
  }
  if (factors.abnormal_movement) {
    score += 20
    reasons.push('✓ Anomaly: Unauthorized trajectory away from authorized reception route')
  }
  if (factors.velocity_anomaly) {
    score += 15
    reasons.push('✓ Multi-camera velocity anomaly (rapid traversal across security zones)')
  }
  if (factors.tamper_alert) {
    score += 40
    reasons.push('✓ Physical device tamper alert triggered on Ring camera')
  }
  if (factors.policy_violation) {
    score += 30
    reasons.push('✓ Explicit security policy violation detected')
  }
  if (factors.historical_incident) {
    score += 15
    reasons.push('✓ Subject linked to prior security alert record')
  }

  score = Math.min(100, score)

  const level =
    score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : score <= 80 ? 'HIGH' : 'CRITICAL'

  const toggleFactor = (key: keyof typeof factors) => {
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const resetAll = () => {
    setFactors({
      unknown_visitor: false,
      no_appointment: false,
      invalid_credential: false,
      restricted_zone: false,
      failed_attempts_3: false,
      after_hours: false,
      abnormal_movement: false,
      velocity_anomaly: false,
      tamper_alert: false,
      policy_violation: false,
      historical_incident: false,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-sky-400" />
          <span>Explainable AI Risk Engine & Behavioral Reasoning</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Zero black-box decisions: Every threat escalation is accompanied by transparent, audit-ready causal factors.
        </p>
      </div>

      {/* Main Interactive Risk Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Factor Toggle Matrix */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-cyber-border space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Contextual Risk Factor Matrix (11 Explanations)
            </span>
            <button
              onClick={resetAll}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'unknown_visitor', label: 'Unknown Visitor', pts: '+25' },
              { key: 'no_appointment', label: 'No Scheduled Appointment', pts: '+20' },
              { key: 'invalid_credential', label: 'Invalid / Missing Badge', pts: '+25' },
              { key: 'restricted_zone', label: 'Restricted Vault Zone', pts: '+25' },
              { key: 'failed_attempts_3', label: '3 Failed Door Swipes', pts: '+45' },
              { key: 'after_hours', label: 'Outside Operating Hours', pts: '+15' },
              { key: 'abnormal_movement', label: 'Trajectory Anomaly', pts: '+20' },
              { key: 'velocity_anomaly', label: 'Multi-Cam Velocity Spike', pts: '+15' },
              { key: 'tamper_alert', label: 'Ring Device Tamper', pts: '+40' },
              { key: 'policy_violation', label: 'Explicit Policy Breach', pts: '+30' },
              { key: 'historical_incident', label: 'Prior Security Record', pts: '+15' },
            ].map((item) => {
              const active = factors[item.key as keyof typeof factors]
              return (
                <div
                  key={item.key}
                  onClick={() => toggleFactor(item.key as keyof typeof factors)}
                  className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex items-center justify-between ${
                    active
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-medium font-sans">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40">
                    {item.pts}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Score Gauge & Explainable Breakdown */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl border border-cyber-border space-y-5 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
              Autonomous Risk Assessment
            </div>

            {/* Big Risk Display */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div
                  className={`text-5xl font-black font-mono tracking-tight ${
                    score > 80
                      ? 'text-rose-400'
                      : score > 60
                      ? 'text-amber-400'
                      : score > 30
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {score}
                  <span className="text-xl text-slate-600 font-normal">/100</span>
                </div>
                <div className="mt-1 text-xs font-bold font-mono tracking-wider uppercase text-slate-300">
                  CLASSIFICATION: <span className="text-rose-400">{level}</span>
                </div>
              </div>

              {/* Threshold Gauge Scale */}
              <div className="text-right text-[10px] font-mono text-slate-500 space-y-0.5">
                <div>0-30: LOW</div>
                <div>31-60: MEDIUM</div>
                <div>61-80: HIGH</div>
                <div className="text-rose-400 font-bold">81-100: CRITICAL</div>
              </div>
            </div>

            {/* Explainable Checklist "WHY:" */}
            <div className="mt-6 space-y-2 border-t border-slate-800 pt-4">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Transparent Causal Audit (WHY):</span>
              </span>

              {reasons.length === 0 ? (
                <div className="text-xs text-slate-500 font-mono italic">
                  ✓ Verified baseline state: zero threat indicators active.
                </div>
              ) : (
                <ul className="space-y-1.5 text-xs text-slate-200 font-sans">
                  {reasons.map((r, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-1.5 text-[11px] leading-snug"
                    >
                      <span className="text-rose-400 font-bold">›</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
            Mandate: Never display "AI says this is dangerous." Always provide itemized, verifiable physical evidence.
          </div>
        </div>
      </div>
    </div>
  )
}
