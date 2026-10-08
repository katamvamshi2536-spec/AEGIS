import React, { useState } from 'react'
import {
  Map,
  Camera,
  Shield,
  Activity,
  Users,
  AlertTriangle,
  Lock,
  ChevronRight,
  Info,
  Layers,
  Volume2,
  Lightbulb,
} from 'lucide-react'
import { Zone, RingDevice, SecurityEvent, Incident } from '../types'
import { api } from '../api'

interface SecurityMapViewProps {
  zones: Zone[]
  devices: RingDevice[]
  events: SecurityEvent[]
  incidents: Incident[]
}

export const SecurityMapView: React.FC<SecurityMapViewProps> = ({
  zones,
  devices,
  events,
  incidents,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('server_room')
  const [actuatorFeedback, setActuatorFeedback] = useState<string | null>(null)

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0]
  const zoneDevices = devices.filter(
    (d) => selectedZone && (d.zone_id === selectedZone.id || selectedZone.active_cameras.includes(d.id))
  )
  const zoneIncidents = incidents.filter(
    (i) => selectedZone && (i.primary_zone_id === selectedZone.id || i.affected_zones.includes(selectedZone.id))
  )
  const zoneEvents = events.filter((e) => selectedZone && e.zone_id === selectedZone.id)

  const handleTriggerSiren = async (deviceId: string) => {
    try {
      const res = await api.controlRingDevice(deviceId, 'toggle_siren', true)
      setActuatorFeedback(`Armed 110dB siren on device ${deviceId} (${res.mode})`)
      setTimeout(() => setActuatorFeedback(null), 4000)
    } catch (err: any) {
      setActuatorFeedback(`Error: ${err.message}`)
    }
  }

  const handleTriggerLight = async (deviceId: string) => {
    try {
      const res = await api.controlRingDevice(deviceId, 'toggle_light', true)
      setActuatorFeedback(`Illuminated Ring floodlight on device ${deviceId} (${res.mode})`)
      setTimeout(() => setActuatorFeedback(null), 4000)
    } catch (err: any) {
      setActuatorFeedback(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Map className="w-5 h-5 text-sky-400" />
            <span>Interactive Cyber-Physical Security Digital Twin</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Live spatial topology, Ring camera placements, active occupants, and risk heatmaps.
          </p>
        </div>

        {actuatorFeedback && (
          <div className="px-3 py-1.5 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-300 text-xs font-mono animate-fade-in">
            {actuatorFeedback}
          </div>
        )}
      </div>

      {/* Main Map + Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Facility Blueprint Canvas */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-cyber-border relative min-h-[520px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-4 border-b border-slate-800 pb-2">
            <span>Apex Cybernetics HQ • Building Alpha • Level 1</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Nominal</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Elevated</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Critical Vault</span>
              </span>
            </div>
          </div>

          {/* SVG Map Layout */}
          <div className="relative flex-1 w-full bg-slate-950/70 rounded-xl border border-slate-800/80 p-4 overflow-hidden flex items-center justify-center">
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Zone Map Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl z-10">
              {zones.map((zone) => {
                const isSelected = selectedZone?.id === zone.id
                const isHigh = zone.current_risk > 60
                const isMed = zone.current_risk > 30

                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-sky-950/30 ring-2 ring-sky-400/30 shadow-glow-blue'
                        : isHigh
                        ? 'border-rose-500/60 bg-rose-950/20 hover:border-rose-400'
                        : isMed
                        ? 'border-amber-500/50 bg-amber-950/20 hover:border-amber-400'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                    }`}
                  >
                    {/* Zone Header */}
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">
                        {zone.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isHigh
                            ? 'bg-rose-500/30 text-rose-300'
                            : isMed
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {zone.current_risk}/100
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 font-mono">
                      Level: <span className="text-slate-200">{zone.security_level}</span>
                    </div>

                    {/* Camera Pins */}
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1 text-sky-400">
                        <Camera className="w-3.5 h-3.5" />
                        <span className="font-mono text-[10px]">{zone.active_cameras.length} Ring Cam</span>
                      </div>
                      {zone.current_occupants.length > 0 && (
                        <div className="flex items-center space-x-1 text-cyan-300 font-mono text-[10px]">
                          <Users className="w-3 h-3" />
                          <span>{zone.current_occupants.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Detailed Zone Inspector Drawer */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-xl border border-cyber-border space-y-5">
          {selectedZone ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Zone Inspector
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      selectedZone.current_risk > 60
                        ? 'bg-rose-500/20 text-rose-400'
                        : selectedZone.current_risk > 30
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    Risk {selectedZone.current_risk}/100
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedZone.description}
                </p>
              </div>

              {/* Authorized Roles & Policies */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Authorized Clearance & Roles
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedZone.allowed_roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800/60"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <div className="pt-2 text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>Requires Approval:</span>
                  <span className={selectedZone.requires_approval ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {selectedZone.requires_approval ? 'YES (MANDATORY)' : 'NO'}
                  </span>
                </div>
              </div>

              {/* Active Ring Cameras in Zone */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Connected Ring Devices ({zoneDevices.length})
                </span>
                {zoneDevices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-semibold text-slate-200">{dev.description}</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">ONLINE</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Battery: {dev.battery_life}%</span>
                      <span>WiFi: {dev.wifi_rssi} dBm</span>
                    </div>

                    {/* Actuator Controls */}
                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => handleTriggerSiren(dev.id)}
                        className="flex-1 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[10px] font-semibold border border-rose-500/30 flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Arm Siren</span>
                      </button>
                      <button
                        onClick={() => handleTriggerLight(dev.id)}
                        className="flex-1 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-[10px] font-semibold border border-amber-500/30 flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span>Floodlight</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Occupants */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Active Occupants ({selectedZone.current_occupants.length})
                </span>
                {selectedZone.current_occupants.length === 0 ? (
                  <div className="text-xs text-slate-500 font-mono">No personnel currently detected.</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedZone.current_occupants.map((occ) => (
                      <span
                        key={occ}
                        className="px-2.5 py-1 rounded-md text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-medium"
                      >
                        {occ}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500 font-mono p-6 text-center">
              Select a zone from the facility blueprint to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
