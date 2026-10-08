import React from 'react'
import {
  Play,
  RotateCcw,
  X,
  ChevronRight,
  ShieldAlert,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { DemoStatus } from '../types'

interface DemoScrubberModalProps {
  isOpen: boolean
  onClose: () => void
  demoStatus: DemoStatus | null
  onRunStep: (step: number) => void
  onReset: () => void
}

const STEP_LABELS = [
  'Known employee detected at Main Entrance (Dr. Elena Vance)',
  'Unknown visitor arrives at Main Entrance (Ring Doorbell Ding)',
  'AI evaluates visitor context & requests host approval',
  'Host Dr. Elena Vance approves temporary 60m reception pass',
  'Visitor enters Reception (Ring Cam 02 verifies)',
  'Visitor deviates into Restricted Corridor (Ring Cam 03 flags anomaly)',
  'AEGIS correlates 3 camera streams into Incident #AE-1042',
  'Visitor attempts 3 unauthorized badge swipes at Server Vault (Risk 91/100)',
  'AI Investigation Agent reconstructs forensic evidence & timeline',
  'Temporary access revoked immediately; Ring Floodlight siren armed (110dB)',
  'Incident escalated to Security Ops; Marcus Thorne dispatched',
]

export const DemoScrubberModal: React.FC<DemoScrubberModalProps> = ({
  isOpen,
  onClose,
  demoStatus,
  onRunStep,
  onReset,
}) => {
  if (!isOpen) return null

  const currentStep = demoStatus?.current_step || 0

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel p-6 rounded-2xl max-w-3xl w-full border border-sky-500/40 bg-cyber-900 shadow-2xl cursor-default space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                SIMULATION MODE • 11-STEP SCENARIO ENGINE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              AEGIS Hackathon Cinematic Demo Controller
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Step Banner */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              CURRENT PROGRESS
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              {currentStep === 0
                ? 'Ready to Launch Scenario'
                : `STEP ${currentStep}/11: ${STEP_LABELS[currentStep - 1]}`}
            </div>
          </div>

          <button
            onClick={() => onRunStep(currentStep < 11 ? currentStep + 1 : 1)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold font-mono flex items-center space-x-2 shadow-glow-blue shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{currentStep === 0 ? 'START STEP 1' : currentStep === 11 ? 'REPLAY STEP 1' : `RUN STEP ${currentStep + 1}`}</span>
          </button>
        </div>

        {/* 11 Steps Interactive Timeline List */}
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {STEP_LABELS.map((label, idx) => {
            const stepNum = idx + 1
            const isDone = currentStep >= stepNum
            const isCurrent = currentStep === stepNum

            return (
              <div
                key={stepNum}
                onClick={() => onRunStep(stepNum)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-sky-500/15 border-sky-400 text-white font-semibold ring-1 ring-sky-400/40'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-sky-500 text-white'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone && !isCurrent ? '✓' : stepNum}
                  </div>
                  <span>{label}</span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
