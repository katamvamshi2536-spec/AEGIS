import React from 'react'
import {
  LayoutDashboard,
  Radio,
  Map,
  KeyRound,
  Users,
  AlertTriangle,
  SearchCode,
  Gauge,
  Scale,
  Sparkles,
  History,
  Camera,
  ExternalLink,
} from 'lucide-react'

export type NavTab =
  | 'command_center'
  | 'live_events'
  | 'security_map'
  | 'access_control'
  | 'visitors'
  | 'incidents'
  | 'investigations'
  | 'risk_intelligence'
  | 'policies'
  | 'audit_trail'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
  incidentCount: number
  eventCount: number
  onToggleCopilot: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  incidentCount,
  eventCount,
  onToggleCopilot,
}) => {
  const navItems = [
    { id: 'command_center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'live_events', label: 'Live Events', icon: Radio, badge: eventCount > 0 ? eventCount : undefined },
    { id: 'security_map', label: 'Security Map', icon: Map },
    { id: 'access_control', label: 'Access Control', icon: KeyRound },
    { id: 'visitors', label: 'Visitors', icon: Users },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: incidentCount > 0 ? incidentCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    { id: 'investigations', label: 'Investigations', icon: SearchCode },
    { id: 'risk_intelligence', label: 'Risk Intelligence', icon: Gauge },
    { id: 'policies', label: 'Policies', icon: Scale },
    { id: 'audit_trail', label: 'Audit Trail', icon: History },
  ]

  return (
    <aside className="w-64 border-r border-cyber-border bg-cyber-900/95 flex flex-col justify-between p-3 select-none shrink-0 h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Physical Security Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-sky-400' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* AI & Ring Direct Quick Link */}
        <div className="p-3 rounded-lg bg-cyber-850/80 border border-cyber-border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center space-x-1.5">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span>Ring Integration</span>
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Connected to 5 physical camera zones. Webhook ingestion & simulator active.
          </p>
          <button
            onClick={onToggleCopilot}
            className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-[11px] font-medium border border-sky-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Copilot</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-cyber-border space-y-1 text-[11px] text-slate-500 font-mono">
        <div className="flex justify-between items-center text-[10px]">
          <span>Track: Ring Primary</span>
          <span className="text-sky-400 font-semibold">AWS Builder</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Engine: PolicyMesh</span>
          <span className="text-emerald-400 font-semibold">Open Source</span>
        </div>
      </div>
    </aside>
  )
}
