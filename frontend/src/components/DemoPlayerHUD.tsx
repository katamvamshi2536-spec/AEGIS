import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Volume2,
  Clock,
  Eye,
  Layers,
  Camera,
  Shield,
  Activity,
} from 'lucide-react'
import { NavTab } from './Sidebar'

export interface DemoStepConfig {
  id: number
  backendStep: number
  startTimeSec: number
  endTimeSec: number
  timeLabel: string
  title: string
  targetTab: NavTab
  openCopilot?: boolean
  selectedIncidentId?: string
  trackBadge: string
  trackColor: string
  visualCue: string
  scriptText: string
}

// 1. User's Presentation Script (Default 3-Minute Walkthrough)
export const USER_WALKTHROUGH_TIMELINE: DemoStepConfig[] = [
  {
    id: 1,
    backendStep: 1,
    startTimeSec: 0,
    endTimeSec: 20,
    timeLabel: '0:00 – 0:20',
    title: 'Introduction',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'INTRODUCTION • OVERVIEW',
    trackColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    visualCue: 'Keep camera on top header and command center dashboard overview.',
    scriptText:
      'Hello everyone. Today I’m going to demonstrate our project AEGIS – Agentic Physical Security Intelligence. This website is designed as an intelligent security platform that helps users monitor situations, analyze information, and get useful security insights through an easy-to-use interface.',
  },
  {
    id: 2,
    backendStep: 1,
    startTimeSec: 20,
    endTimeSec: 50,
    timeLabel: '0:20 – 0:50',
    title: 'Home Page',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'HOME PAGE • SOC DASHBOARD',
    trackColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    visualCue: 'Slowly scroll through the homepage showcasing system telemetry, facility zones, and Ring device tiles.',
    scriptText:
      'First, this is the AEGIS home page. Here we can see the project name, its purpose, and the main sections of the application. The website is designed with a simple and modern interface so that users can easily understand the system and access its different features.',
  },
  {
    id: 3,
    backendStep: 5,
    startTimeSec: 50,
    endTimeSec: 80,
    timeLabel: '0:50 – 1:20',
    title: 'Main Features',
    targetTab: 'security_map',
    openCopilot: false,
    trackBadge: 'MAIN FEATURES • MULTI-CAMERA',
    trackColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    visualCue: 'Open each major feature/section: Security Map (Digital Twin), Live Events, and Access Control.',
    scriptText:
      'AEGIS provides different features related to intelligent security monitoring. The main idea is to collect relevant information, analyze it using intelligent systems, and present the results in a simple way. Instead of manually going through large amounts of information, the user can use the platform to understand important events and situations more efficiently.',
  },
  {
    id: 4,
    backendStep: 9,
    startTimeSec: 80,
    endTimeSec: 115,
    timeLabel: '1:20 – 1:55',
    title: 'Intelligent Analysis',
    targetTab: 'investigations',
    openCopilot: true,
    trackBadge: 'INTELLIGENT ANALYSIS • AI COPILOT',
    trackColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    visualCue: 'Demonstrate the AI / agent / analysis section and open the interactive AI Copilot drawer.',
    scriptText:
      'Now we come to the intelligent part of AEGIS. The system uses an agent-based approach to process information and support security analysis. The purpose of this approach is to help identify important information, understand the situation, and provide useful outputs to the user. This makes the system more than just a normal information-display website.',
  },
  {
    id: 5,
    backendStep: 8,
    startTimeSec: 115,
    endTimeSec: 145,
    timeLabel: '1:55 – 2:25',
    title: 'Alerts and Information',
    targetTab: 'incidents',
    openCopilot: false,
    selectedIncidentId: 'AE-1042',
    trackBadge: 'ALERTS & THREATS • INCIDENTS',
    trackColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    visualCue: 'Show Alerts, status cards, analysis results, or other dashboard information (Threat: 91/100, sirens armed).',
    scriptText:
      'Another important part of the website is how information is presented to the user. Important events or information can be highlighted so that the user can pay attention to the areas that require action. The dashboard-style presentation makes it easier to understand the current situation without going through unnecessary information.',
  },
  {
    id: 6,
    backendStep: 11,
    startTimeSec: 145,
    endTimeSec: 170,
    timeLabel: '2:25 – 2:50',
    title: 'Benefits',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'PLATFORM VALUE • CENTRALIZATION',
    trackColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    visualCue: 'Return to Command Center or Policies view. Point to centralized multi-system synchronization.',
    scriptText:
      'The main benefits of AEGIS are centralized monitoring, intelligent analysis, automation, and faster decision support. The website provides a single platform where security-related information can be organized and analyzed. This can help users respond to situations more efficiently.',
  },
  {
    id: 7,
    backendStep: 11,
    startTimeSec: 170,
    endTimeSec: 180,
    timeLabel: '2:50 – 3:00',
    title: 'Conclusion',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'CONCLUSION • SMARTER SECURITY',
    trackColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    visualCue: 'Conclude on the clean Command Center with system status OPERATIONAL and AEGIS tagline.',
    scriptText:
      'So, this is our AEGIS platform, Agentic Physical Security Intelligence. It combines a user-friendly web interface with intelligent analysis to provide a smarter approach to security monitoring. Thank you.',
  },
]

// 2. Technical Ring & AWS Forensic Scenario Timeline
export const TECHNICAL_SCENARIO_TIMELINE: DemoStepConfig[] = [
  {
    id: 1,
    backendStep: 1,
    startTimeSec: 0,
    endTimeSec: 10,
    timeLabel: '0:00 – 0:10',
    title: 'Ring Event: Known Employee Authenticated',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'RING TRACK • TECH IMPLEMENTATION',
    trackColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    visualCue: 'Ring Video Doorbell Elite captures Dr. Elena Vance arriving at Main Entrance with routine clearance.',
    scriptText:
      'Welcome to AEGIS: Agentic Physical Security Intelligence. While conventional security cameras merely capture video after a breach, AEGIS transforms Ring devices into an active, intelligent physical security nervous system. Here at the main entrance, Dr. Elena Vance arrives—authenticated immediately via Ring Video Doorbell Elite with routine clearance.',
  },
  {
    id: 2,
    backendStep: 2,
    startTimeSec: 10,
    endTimeSec: 30,
    timeLabel: '0:10 – 0:30',
    title: 'AI Context Analysis: Unknown Visitor Ding',
    targetTab: 'live_events',
    openCopilot: false,
    trackBadge: 'QUALITY OF IDEA • MULTI-AGENT PIPELINE',
    trackColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    visualCue: 'Ring Doorbell Ding triggered by unverified visitor. Zero-trust evaluation holds access and contacts host.',
    scriptText:
      'Ten seconds later, an unregistered visitor rings the doorbell. Instead of spamming security guards with generic motion alerts, AEGIS activates its Amazon Bedrock Identity and Policy agents. Biometrics are unverified and no scheduled calendar appointment exists. AEGIS automatically places entry on hold and initiates contextual verification with the host.',
  },
  {
    id: 3,
    backendStep: 4,
    startTimeSec: 30,
    endTimeSec: 50,
    timeLabel: '0:30 – 0:50',
    title: 'Natural-Language Access Request',
    targetTab: 'access_control',
    openCopilot: false,
    trackBadge: 'TECH IMPLEMENTATION • ZERO-TRUST RBAC',
    trackColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    visualCue: 'Security operator executes natural-language approval: "Grant temporary 60m reception pass".',
    scriptText:
      'Security personnel can interact with AEGIS using natural language. Host Dr. Vance confirms the guest, and AEGIS issues a cryptographically-bound temporary pass with a 60-minute time-to-live, strictly restricted to the Reception zone.',
  },
  {
    id: 4,
    backendStep: 5,
    startTimeSec: 50,
    endTimeSec: 70,
    timeLabel: '0:50 – 1:10',
    title: 'Temporary Access Verified by Ring Cam 02',
    targetTab: 'security_map',
    openCopilot: false,
    trackBadge: 'DESIGN • SPATIAL DIGITAL TWIN',
    trackColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    visualCue: 'Reception Stick Up Cam Pro verifies visitor entry within authorized bounds on Digital Twin.',
    scriptText:
      'The visitor enters Reception. The Ring Stick Up Cam Pro verifies arrival. Notice our live facility Digital Twin map updating in real time with green authorization status. Everything is compliant.',
  },
  {
    id: 5,
    backendStep: 6,
    startTimeSec: 70,
    endTimeSec: 90,
    timeLabel: '1:10 – 1:30',
    title: 'Multi-Camera Anomaly: Restricted Traversal',
    targetTab: 'security_map',
    openCopilot: false,
    trackBadge: 'RING TRACK • ANOMALY DETECTION',
    trackColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    visualCue: 'Ring Spotlight Cam Pro detects visitor deviating into Restricted Server Corridor.',
    scriptText:
      'At 1 minute 10 seconds, anomaly occurs. The visitor leaves the designated reception zone and wanders into the restricted Server Room Corridor. Monitored by a Ring Spotlight Cam Pro, AEGIS immediately flags a spatial trajectory violation.',
  },
  {
    id: 6,
    backendStep: 8,
    startTimeSec: 90,
    endTimeSec: 110,
    timeLabel: '1:30 – 1:50',
    title: 'Risk Escalation: Door Breach Attempts (Risk 91/100)',
    targetTab: 'incidents',
    openCopilot: false,
    selectedIncidentId: 'AE-1042',
    trackBadge: 'TECH IMPLEMENTATION • MULTI-CAMERA CORRELATION',
    trackColor: 'text-red-400 bg-red-950/60 border-red-800/60',
    visualCue: 'Correlation Engine fuses 3 camera streams into Incident #AE-1042. Threat score jumps to 91/100 CRITICAL.',
    scriptText:
      'At 1:30, the subject attempts three unauthorized badge swipes at the Core Server Vault door. Notice how AEGIS doesn\'t treat these as isolated camera pings. Our Correlation Engine fuses streams from Cam 01, 02, 03, and 04 into unified Incident AE-1042. Facility threat score spikes to 91 out of 100—CRITICAL.',
  },
  {
    id: 7,
    backendStep: 10,
    startTimeSec: 110,
    endTimeSec: 135,
    timeLabel: '1:50 – 2:15',
    title: 'AI Forensic Investigation & Ring Siren Actuation',
    targetTab: 'investigations',
    openCopilot: false,
    selectedIncidentId: 'AE-1042',
    trackBadge: 'POTENTIAL IMPACT • AUTONOMOUS CONTAINMENT',
    trackColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    visualCue: 'Investigation Agent reconstructs forensic evidence. Pass revoked instantly; Ring Floodlight 110dB siren armed.',
    scriptText:
      'AEGIS\'s Investigation Agent autonomously synthesizes the full multi-camera forensic evidence chain: entry timestamp, path anomaly, and repeated badge rejections. In under two seconds, the Action Agent revokes the visitor pass and arms the Ring Floodlight Cam siren and floodlights to contain the intruder physically.',
  },
  {
    id: 8,
    backendStep: 11,
    startTimeSec: 135,
    endTimeSec: 155,
    timeLabel: '2:15 – 2:35',
    title: 'AWS Builder Stack: Amazon Bedrock & AgentCore',
    targetTab: 'command_center',
    openCopilot: true,
    trackBadge: 'MINI CHALLENGE • AWS BUILDER',
    trackColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    visualCue: 'Amazon Bedrock Claude 3.5 Sonnet, AgentCore runtime, Strands SDK, Lambda, DynamoDB, S3, CloudWatch.',
    scriptText:
      'Under the hood, AEGIS is powered by Amazon Bedrock running Claude 3.5 Sonnet through the AgentCore runtime and Strands SDK. AWS Lambda processes real-time Ring webhook streams, DynamoDB handles sub-second state persistence, and Amazon S3 with CloudWatch preserves an immutable, tamper-evident audit trail.',
  },
  {
    id: 9,
    backendStep: 11,
    startTimeSec: 155,
    endTimeSec: 170,
    timeLabel: '2:35 – 2:50',
    title: 'PolicyMesh: Open-Source Deterministic Engine',
    targetTab: 'policies',
    openCopilot: false,
    trackBadge: 'SECONDARY MINI CHALLENGE • OPEN SOURCE',
    trackColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    visualCue: 'Standalone open-source policy evaluation library with MIT license, zero-trust RBAC/ABAC rules.',
    scriptText:
      'For our open-source mini-challenge, we built PolicyMesh—a standalone, MIT-licensed deterministic policy evaluation engine. PolicyMesh decouples AI reasoning from policy enforcement, guaranteeing that generative agent outputs can never violate hard physical security bounds.',
  },
  {
    id: 10,
    backendStep: 11,
    startTimeSec: 170,
    endTimeSec: 180,
    timeLabel: '2:50 – 3:00',
    title: 'Final Impact: Autonomous Physical Security',
    targetTab: 'command_center',
    openCopilot: false,
    trackBadge: 'POTENTIAL IMPACT • OVERALL SCORECARD',
    trackColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    visualCue: 'On-duty guard Marcus Thorne dispatched. Threat mitigated. From camera events to intelligent security decisions.',
    scriptText:
      'AEGIS bridges the gap between passive video monitoring and autonomous enterprise security. From camera events to intelligent security decisions—this is the future of physical security. Thank you.',
  },
]

interface DemoPlayerHUDProps {
  isActive: boolean
  onClose: () => void
  onNavigateTab: (tab: NavTab) => void
  onToggleCopilot: (open: boolean) => void
  onSelectIncident: (id: string) => void
  onExecuteStep: (stepNumber: number) => Promise<void>
  onReset: () => Promise<void>
}

export const DemoPlayerHUD: React.FC<DemoPlayerHUDProps> = ({
  isActive,
  onClose,
  onNavigateTab,
  onToggleCopilot,
  onSelectIncident,
  onExecuteStep,
  onReset,
}) => {
  if (!isActive) return null

  const [mode, setMode] = useState<'walkthrough' | 'scenario'>('walkthrough')
  const timeline = mode === 'walkthrough' ? USER_WALKTHROUGH_TIMELINE : TECHNICAL_SCENARIO_TIMELINE

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1)
  const [isPrompterExpanded, setIsPrompterExpanded] = useState(true)

  const activeStep = timeline[currentIndex] || timeline[0]
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Navigate view and trigger step logic on step index change
  const applyStep = async (index: number, activeTimeline = timeline) => {
    const step = activeTimeline[index]
    if (!step) return
    setCurrentIndex(index)
    setSecondsElapsed(step.startTimeSec)

    // Apply UI state transitions
    onNavigateTab(step.targetTab)
    if (step.openCopilot !== undefined) {
      onToggleCopilot(step.openCopilot)
    }
    if (step.selectedIncidentId) {
      onSelectIncident(step.selectedIncidentId)
    }

    // Trigger backend step
    try {
      await onExecuteStep(step.backendStep)
    } catch (e) {
      console.warn('Step execution notice:', e)
    }
  }

  // Handle Play/Pause timer tick
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1
        // Check if we passed into next step
        const nextStepIndex = timeline.findIndex(
          (s) => next >= s.startTimeSec && next < s.endTimeSec
        )

        if (nextStepIndex !== -1 && nextStepIndex !== currentIndex) {
          applyStep(nextStepIndex, timeline)
        }

        if (next >= 180) {
          setIsPlaying(false)
          return 180
        }
        return next
      })
    }, 1000 / playbackSpeed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, currentIndex, playbackSpeed, timeline])

  const handleNext = () => {
    if (currentIndex < timeline.length - 1) {
      applyStep(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      applyStep(currentIndex - 1)
    }
  }

  const handleRestart = async () => {
    setIsPlaying(false)
    setSecondsElapsed(0)
    await onReset()
    applyStep(0)
  }

  const handleToggleMode = (newMode: 'walkthrough' | 'scenario') => {
    setMode(newMode)
    setIsPlaying(false)
    setSecondsElapsed(0)
    const newTimeline = newMode === 'walkthrough' ? USER_WALKTHROUGH_TIMELINE : TECHNICAL_SCENARIO_TIMELINE
    applyStep(0, newTimeline)
  }

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = Math.min(100, (secondsElapsed / 180) * 100)

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none flex justify-center">
      <div className="w-full max-w-4xl bg-cyber-900/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl shadow-2xl shadow-sky-950/80 pointer-events-auto overflow-hidden transition-all">
        {/* Progress Bar (0 to 180s) */}
        <div className="h-1.5 w-full bg-slate-950 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* HUD Top Bar */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-cyber-border bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>3:00 DEMO PROMPTER</span>
            </div>

            {/* Script Mode Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => handleToggleMode('walkthrough')}
                className={`px-2 py-0.5 rounded transition-all ${
                  mode === 'walkthrough'
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Walkthrough Script
              </button>
              <button
                onClick={() => handleToggleMode('scenario')}
                className={`px-2 py-0.5 rounded transition-all ${
                  mode === 'scenario'
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Forensic Incident
              </button>
            </div>

            <div className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${activeStep.trackColor} hidden md:inline-block`}>
              {activeStep.trackBadge}
            </div>
          </div>

          {/* Time & Teleprompter Controls */}
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(secondsElapsed)}</span>
              <span className="text-slate-500">/ 03:00</span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => setPlaybackSpeed(1)}
                className={`px-1.5 py-0.5 rounded ${playbackSpeed === 1 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="1x Realtime speed (180s)"
              >
                1x
              </button>
              <button
                onClick={() => setPlaybackSpeed(2)}
                className={`px-1.5 py-0.5 rounded ${playbackSpeed === 2 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="2x Fast pace (90s)"
              >
                2x
              </button>
              <button
                onClick={() => setPlaybackSpeed(4)}
                className={`px-1.5 py-0.5 rounded ${playbackSpeed === 4 ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                title="4x Rapid rehearsal (45s)"
              >
                4x
              </button>
            </div>

            {/* Toggle Prompter Accordion */}
            <button
              onClick={() => setIsPrompterExpanded((prev) => !prev)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title={isPrompterExpanded ? 'Collapse Prompter' : 'Expand Prompter'}
            >
              {isPrompterExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {/* Close HUD */}
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
              title="Exit Demo HUD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Teleprompter Content */}
        {isPrompterExpanded && (
          <div className="p-4 bg-slate-950/80 space-y-2.5 max-h-56 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                  SECTION {currentIndex + 1} OF {timeline.length} • {activeStep.timeLabel}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeStep.title}</h4>
              </div>

              <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                VIEW: <span className="text-sky-400 uppercase">{activeStep.targetTab.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Visual Action Cue for Presenter */}
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center space-x-2 text-xs">
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400 font-mono font-semibold text-[11px]">[SHOW / ACTION]:</span>
              <span className="text-slate-300 text-[11px] font-medium">{activeStep.visualCue}</span>
            </div>

            {/* Presenter Spoken Lines Card */}
            <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-slate-100 flex items-start space-x-2.5 shadow-inner">
              <Volume2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-sans text-slate-200">
                <span className="text-sky-400 font-semibold font-mono mr-1.5">[SAY THIS]:</span>
                “{activeStep.scriptText}”
              </p>
            </div>
          </div>
        )}

        {/* HUD Bottom Controls */}
        <div className="px-5 py-2.5 bg-cyber-900 flex items-center justify-between border-t border-cyber-border">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRestart}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart (0:00)</span>
            </button>
          </div>

          {/* Stepper Transport Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Section"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold font-mono flex items-center space-x-2 shadow-glow-blue"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>PAUSE PLAYBACK</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{secondsElapsed === 0 ? 'START 3-MIN DEMO' : 'RESUME PLAYBACK'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === timeline.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Section"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Section <span className="text-white font-bold">{currentIndex + 1}</span> / {timeline.length}
          </div>
        </div>
      </div>
    </div>
  )
}
