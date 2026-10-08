import React from 'react'
import {
  Shield,
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  Camera,
  Cloud,
  Layers,
  ChevronRight,
} from 'lucide-react'
import { SystemStatus, DemoStatus } from '../types'

interface HeaderProps {
  status: SystemStatus | null
  demoStatus: DemoStatus | null
  onOpenDemoScrubber: () => void
  onOpen3MinDemo: () => void
  onToggleCopilot: () => void
  onResetDemo: () => void
  onRunNextStep: () => void
  isCopilotOpen: boolean
  is3MinDemoActive: boolean
}

export const Header: React.FC<HeaderProps> = ({
  status,
  demoStatus,
  onOpenDemoScrubber,
  onOpen3MinDemo,
  onToggleCopilot,
  onResetDemo,
  onRunNextStep,
  isCopilotOpen,
  is3MinDemoActive,
}) => {
  const currentStep = demoStatus?.current_step || 0
  const isDemoActive = currentStep > 0
  const avgRisk = status?.facility?.average_risk_score ?? 15

  const riskBadgeColor =
    avgRisk > 80
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      : avgRisk > 60
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : avgRisk > 30
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-900/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-glow-blue border border-sky-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AEGIS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                v1.0-SOC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Agentic Physical Security Intelligence
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block" />

        {/* System Operational Status */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium font-mono text-[11px]">
            SYSTEM: <span className="text-emerald-400 font-semibold">OPERATIONAL</span>
          </span>
        </div>

        {/* Ring Technology Mode Indicator */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-800/40 text-[11px]">
          <Camera className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">Ring Track:</span>
          <span className="font-mono font-bold text-sky-300">
            {status?.ring_integration?.is_live ? 'LIVE RING CLOUD' : 'SIMULATION MODE (5 DEVICES)'}
          </span>
        </div>
      </div>

      {/* Right Action Hub */}
      <div className="flex items-center space-x-3">
        {/* Threat Level Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1 rounded-md border text-xs font-mono font-semibold ${riskBadgeColor}`}
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>THREAT: {avgRisk}/100</span>
        </div>

        {/* 3-Minute Live Stage Demo with Teleprompter HUD */}
        <button
          onClick={onOpen3MinDemo}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            is3MinDemoActive
              ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-glow-blue'
              : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/40 text-amber-300 hover:text-amber-200'
          }`}
          title="Launch 3-minute video presentation mode with automated tab switching & teleprompter"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
          <span>⚡ 3-MIN LIVE DEMO</span>
        </button>

        {/* Single-Click Hackathon Demo Launcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 shadow-inner">
          <button
            onClick={onOpenDemoScrubber}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isDemoActive
                ? 'bg-amber-500 text-slate-950 shadow-glow-blue'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-glow-blue'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {isDemoActive ? `DEMO: STEP ${currentStep}/11` : 'START AEGIS DEMO'}
            </span>
          </button>

          {isDemoActive && (
            <>
              <button
                onClick={onRunNextStep}
                title="Advance to next step"
                className="ml-1 px-2 py-1.5 rounded hover:bg-slate-800 text-sky-400 text-xs font-mono flex items-center"
              >
                <span>NEXT</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
              <button
                onClick={onResetDemo}
                title="Reset demo scenario"
                className="ml-1 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* AI Copilot Drawer Toggle */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isCopilotOpen
              ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-glow-blue'
              : 'bg-cyber-850 hover:bg-slate-800 border-cyber-border text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>
      </div>
    </header>
  )
}
