'use client'

import { useMemo, useState } from 'react'
import { MAPS } from '@/lib/constants/maps'
import { CALLOUTS } from '@/lib/constants/callouts'
import { colorMap } from '@/lib/constants/labels'
import { getPos } from '@/lib/utils/leaflet-helpers'
import type { MapSlug, LineupWithStats, GrenadeType } from '@/lib/types/lineup'

const markerSVGs: Record<GrenadeType, string> = {
  smoke: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 7V4M12 20v-3M7 12H4M20 12h-3" opacity=".6"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  molotov: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5"><path d="M12 12c-3 0-5 2.5-5 5.5S9 23 12 23s5-2 5-5.5S15 12 12 12z"/><path d="M12 12V8M10 8h4"/></svg>`,
  he: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="13" r="7"/><path d="M12 6V3M9 3h6"/></svg>`,
}

interface MapAreaProps {
  map: MapSlug
  lineups: LineupWithStats[]
  activeLineup: LineupWithStats | null
  onLineupClick: (lineup: LineupWithStats) => void
  hoveredId?: number | null
  onHover?: (id: number | null) => void
  key?: string
}

export default function MapArea({ map, lineups, activeLineup, onLineupClick, hoveredId, onHover }: MapAreaProps) {
  const [showCallouts, setShowCallouts] = useState(false)
  const mapData = MAPS[map]
  const imageUrl = mapData?.image
  const callouts = CALLOUTS[map] || []

  const markers = useMemo(() => {
    return lineups.map((lineup) => {
      const pos = getPos(map, lineup.to)
      if (!pos) return null
      return { lineup, x: pos.x, y: pos.y }
    }).filter(Boolean) as { lineup: LineupWithStats; x: number; y: number }[]
  }, [lineups, map])

  const trajectoryLine = useMemo(() => {
    if (!activeLineup) return null
    const fromPos = getPos(map, activeLineup.from)
    const toPos = getPos(map, activeLineup.to)
    if (!fromPos || !toPos) return null
    return { from: fromPos, to: toPos }
  }, [activeLineup, map])

  if (!imageUrl) return null

  return (
    <main className="flex-1 relative bg-[#0d0e14] overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Map container — always fits viewport */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative" style={{ width: 'min(100%, calc(100vh - 56px))', aspectRatio: '1/1' }}>
          {/* Map image */}
          <img
            src={imageUrl}
            alt={`${map} radar`}
            className="w-full h-full object-contain"
            draggable={false}
          />

          {/* Trajectory SVG overlay */}
          {trajectoryLine && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <line
                x1={trajectoryLine.from.x}
                y1={trajectoryLine.from.y}
                x2={trajectoryLine.to.x}
                y2={trajectoryLine.to.y}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.3"
                strokeDasharray="1,0.8"
                strokeLinecap="round"
              />
              <circle
                cx={trajectoryLine.from.x}
                cy={trajectoryLine.from.y}
                r="0.8"
                fill="rgba(255,255,255,0.7)"
              />
            </svg>
          )}

          {/* Callout labels */}
          {showCallouts && callouts.map((callout) => (
            <div
              key={callout.name}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-white/50 font-mono whitespace-nowrap"
              style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
            >
              {callout.name}
            </div>
          ))}

          {/* Markers */}
          {markers.map(({ lineup, x, y }) => {
            const color = colorMap[lineup.type as GrenadeType] || '#888'
            const isActive = activeLineup?.id === lineup.id
            const isHovered = hoveredId === lineup.id
            const showLabel = isActive || isHovered
            return (
              <button
                key={lineup.id}
                onClick={() => onLineupClick(lineup)}
                onMouseEnter={() => onHover?.(lineup.id)}
                onMouseLeave={() => onHover?.(null)}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 group"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-all"
                  style={{
                    width: isActive ? 26 : 20,
                    height: isActive ? 26 : 20,
                    backgroundColor: color,
                    boxShadow: isActive || isHovered ? `0 0 12px ${color}` : `0 0 6px ${color}80`,
                    border: isActive ? '2px solid white' : isHovered ? '2px solid rgba(255,255,255,0.7)' : '1.5px solid rgba(255,255,255,0.3)',
                  }}
                  dangerouslySetInnerHTML={{ __html: markerSVGs[lineup.type as GrenadeType] || '' }}
                />
                {/* Label */}
                <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#13141a]/90 border border-[#2a2b36] pointer-events-none transition-opacity ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span style={{ color }}>{lineup.name}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Callouts toggle */}
      <button
        onClick={() => setShowCallouts((v) => !v)}
        className={`absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
          showCallouts
            ? 'bg-white/15 text-white border border-white/20'
            : 'bg-[#1a1b26]/80 text-white/50 border border-[#2a2b36] hover:text-white/70'
        }`}
      >
        Callouts
      </button>
    </main>
  )
}
