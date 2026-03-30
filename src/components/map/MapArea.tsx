'use client'

import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { MAPS } from '@/lib/constants/maps'
import { CALLOUTS } from '@/lib/constants/callouts'
import { colorMap } from '@/lib/constants/labels'
import type { PositionMap } from '@/hooks/useLineups'
import type { MapSlug, LineupWithStats, GrenadeType } from '@/lib/types/lineup'

const markerIcons: Record<GrenadeType, string> = {
  smoke: `<svg viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="14" rx="9" ry="7" fill="white" opacity=".15"/><ellipse cx="10" cy="13" rx="5" ry="4" fill="white" opacity=".7"/><ellipse cx="14" cy="11" rx="5" ry="4" fill="white" opacity=".6"/><ellipse cx="12" cy="12" rx="6" ry="5" fill="white" opacity=".5"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12,1 14.5,8.5 22,9 16,14 18,22 12,17.5 6,22 8,14 2,9 9.5,8.5" fill="white" opacity=".85"/></svg>`,
  molotov: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 22c-4 0-7-3-7-7 0-3 2-5.5 4-8 1-1.3 2-2.5 2.5-4 .3.8 1 1.5 1.5 2 2 2.5 4 5 4 8 0 2-1 4-2.5 5.5" fill="white" opacity=".85"/><path d="M12 22c-2 0-3.5-1.5-3.5-3.5 0-2 1.5-3.5 2.5-5 .5.8 1 1.3 1.5 2 1 1.3 1.5 2.5 1.5 4 0 1.2-.8 2.5-2 2.5z" fill="white" opacity=".5"/></svg>`,
  he: `<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="5" fill="white" opacity=".7"/><path d="M12 2l1 5M12 22l-1-5M2 12l5 1M22 12l-5-1M5 5l3.5 3M19 19l-3.5-3M5 19l3.5-3M19 5l-3.5 3" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity=".6"/></svg>`,
}

interface MapAreaProps {
  map: MapSlug
  lineups: LineupWithStats[]
  activeLineup: LineupWithStats | null
  onLineupClick: (lineup: LineupWithStats) => void
  hoveredId?: number | null
  onHover?: (id: number | null) => void
  positions?: PositionMap
  key?: string
}

interface Cluster {
  x: number
  y: number
  lineups: LineupWithStats[]
  primaryType: GrenadeType | null
}

const CLUSTER_RADIUS = 3

export default function MapArea({ map, lineups, activeLineup, onLineupClick, hoveredId, onHover, positions }: MapAreaProps) {
  const [showCallouts, setShowCallouts] = useState(false)
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null)
  const mapData = MAPS[map]
  const imageUrl = mapData?.image
  const callouts = CALLOUTS[map] || []

  const getPos = (mapSlug: string, name: string): { x: number; y: number } | null => {
    const p = positions?.[mapSlug]?.[name] || MAPS[mapSlug]?.positions[name] || null
    if (!p) return null
    return { x: Math.max(3, Math.min(97, p.x)), y: Math.max(3, Math.min(97, p.y)) }
  }

  const clusters = useMemo(() => {
    const items: { x: number; y: number; lineup: LineupWithStats }[] = []
    for (const l of lineups) {
      const pos = getPos(map, l.to)
      if (pos) items.push({ x: pos.x, y: pos.y, lineup: l })
    }

    const used = new Set<number>()
    const result: Cluster[] = []

    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue
      used.add(i)

      const cluster: LineupWithStats[] = [items[i].lineup]
      let cx = items[i].x
      let cy = items[i].y

      for (let j = i + 1; j < items.length; j++) {
        if (used.has(j)) continue
        const dx = items[j].x - cx
        const dy = items[j].y - cy
        if (Math.sqrt(dx * dx + dy * dy) < CLUSTER_RADIUS) {
          used.add(j)
          cluster.push(items[j].lineup)
          cx = (cx * (cluster.length - 1) + items[j].x) / cluster.length
          cy = (cy * (cluster.length - 1) + items[j].y) / cluster.length
        }
      }

      const types = new Set(cluster.map(l => l.type as GrenadeType))
      result.push({
        x: cx,
        y: cy,
        lineups: cluster,
        primaryType: types.size === 1 ? [...types][0] : null,
      })
    }
    return result
  }, [lineups, map, positions])

  const expandedLines = useMemo(() => {
    if (expandedCluster === null) return []
    const cluster = clusters[expandedCluster]
    if (!cluster) return []

    const fromMap: Record<string, { x: number; y: number; lineups: LineupWithStats[] }> = {}
    for (const l of cluster.lineups) {
      const fp = getPos(map, l.from)
      if (!fp) continue
      if (!fromMap[l.from]) fromMap[l.from] = { x: fp.x, y: fp.y, lineups: [] }
      fromMap[l.from].lineups.push(l)
    }
    return Object.entries(fromMap).map(([name, d]) => ({
      name, fromX: d.x, fromY: d.y, toX: cluster.x, toY: cluster.y, lineups: d.lineups,
    }))
  }, [expandedCluster, clusters, map, positions])

  const activeTrajectory = useMemo(() => {
    if (!activeLineup) return null
    const f = getPos(map, activeLineup.from)
    const t = getPos(map, activeLineup.to)
    if (!f || !t) return null
    return { from: f, to: t }
  }, [activeLineup, map, positions])

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const targetZoom = useRef(1)
  const targetPan = useRef({ x: 0, y: 0 })
  const animFrame = useRef<number>(0)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const animate = useCallback(() => {
    setZoom(z => {
      const diff = targetZoom.current - z
      return Math.abs(diff) < 0.01 ? targetZoom.current : z + diff * 0.25
    })
    setPan(p => {
      if (isPanning.current) return p
      const dx = targetPan.current.x - p.x
      const dy = targetPan.current.y - p.y
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return targetPan.current
      return { x: p.x + dx * 0.25, y: p.y + dy * 0.25 }
    })
    animFrame.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    animFrame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame.current)
  }, [animate])

  useEffect(() => {
    targetZoom.current = 1
    targetPan.current = { x: 0, y: 0 }
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [map])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    const prev = targetZoom.current
    const next = Math.max(1, Math.min(5, prev + delta))
    targetZoom.current = next
    if (next === 1) {
      targetPan.current = { x: 0, y: 0 }
    } else if (containerRef.current && next !== prev) {
      const rect = containerRef.current.getBoundingClientRect()
      const cx = e.clientX - rect.left - rect.width / 2
      const cy = e.clientY - rect.top - rect.height / 2
      const factor = next / prev
      targetPan.current = {
        x: cx - factor * (cx - targetPan.current.x),
        y: cy - factor * (cy - targetPan.current.y),
      }
    }
  }, [])

  const didPan = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 1) return
    isPanning.current = true
    didPan.current = false
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [zoom, pan])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return
    didPan.current = true
    const newPan = { x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y }
    setPan(newPan)
    targetPan.current = newPan
  }, [])

  const handlePointerUp = useCallback(() => { isPanning.current = false }, [])

  if (!imageUrl) return null

  const hasExpanded = expandedCluster !== null
  const lineColor = '#e5a93e'
  const markerScale = 1 / zoom
  const lineScale = 1 / zoom

  return (
    <main className="flex-1 relative bg-[#0d0e14] overflow-hidden" style={{ height: 'calc(100vh - 48px)' }} onClick={() => { if (!didPan.current) setExpandedCluster(null) }}>
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
        <button onClick={() => { targetZoom.current = Math.min(5, targetZoom.current + 0.5) }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1b26]/90 border border-[#2a2b36] text-white/60 hover:text-white text-lg font-bold transition-colors">+</button>
        <button onClick={() => { targetZoom.current = Math.max(1, targetZoom.current - 0.5); if (targetZoom.current === 1) targetPan.current = {x:0,y:0} }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1b26]/90 border border-[#2a2b36] text-white/60 hover:text-white text-lg font-bold transition-colors">&minus;</button>
        {zoom > 1 && (
          <button onClick={() => { targetZoom.current = 1; targetPan.current = {x:0,y:0} }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1b26]/90 border border-[#2a2b36] text-white/40 hover:text-white transition-colors" title="Сбросить зум">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: zoom > 1 ? (isPanning.current ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
      >
        <div
          className="relative overflow-hidden rounded-sm"
          style={{
            width: 'min(100%, calc(100vh - 56px))',
            aspectRatio: '1/1',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <img src={imageUrl} alt={`${map} radar`} className="w-full h-full object-contain" draggable={false} style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }} />

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {expandedLines.map((l) => (
              <line key={l.name} x1={l.fromX} y1={l.fromY} x2={l.toX} y2={l.toY}
                stroke={lineColor} strokeWidth={0.3 * lineScale} strokeDasharray={`${0.8 * lineScale},${0.6 * lineScale}`} strokeLinecap="round" opacity="0.8" />
            ))}
            {activeTrajectory && (
              <line x1={activeTrajectory.from.x} y1={activeTrajectory.from.y}
                x2={activeTrajectory.to.x} y2={activeTrajectory.to.y}
                stroke="white" strokeWidth={0.35 * lineScale} strokeDasharray={`${1 * lineScale},${0.8 * lineScale}`} strokeLinecap="round" />
            )}
          </svg>

          {showCallouts && callouts.map((c) => (
            <div key={c.name} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[9px] text-white/50 font-mono whitespace-nowrap"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: `translate(-50%,-50%) scale(${markerScale})` }}>{c.name}</div>
          ))}

          {clusters.map((cluster, idx) => {
            const color = cluster.primaryType ? colorMap[cluster.primaryType] : '#888'
            const isExp = expandedCluster === idx
            const hasActive = activeLineup ? cluster.lineups.some(l => l.id === activeLineup.id) : false
            const dimmed = (hasExpanded && !isExp) || (activeLineup && !hasActive)
            const count = cluster.lineups.length
            const size = isExp || hasActive ? 32 : count > 1 ? 28 : 24

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  if (count === 1) {
                    onLineupClick(cluster.lineups[0])
                    setExpandedCluster(null)
                  } else {
                    setExpandedCluster(isExp ? null : idx)
                  }
                }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 hover:scale-110"
                style={{
                  left: `${cluster.x}%`, top: `${cluster.y}%`,
                  opacity: dimmed ? 0.2 : 1,
                  transform: `translate(-50%,-50%) scale(${markerScale})`,
                }}
              >
                <div className="relative flex items-center justify-center rounded-full" style={{
                  width: size, height: size,
                  backgroundColor: color,
                  boxShadow: isExp ? `0 0 18px ${color}, 0 0 4px ${color}` : `0 0 6px ${color}80`,
                  border: isExp || hasActive ? '2.5px solid white' : '1.5px solid rgba(255,255,255,0.35)',
                }} dangerouslySetInnerHTML={{ __html: cluster.primaryType ? markerIcons[cluster.primaryType] : '' }} />
                {count > 1 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none px-0.5"
                    style={{ backgroundColor: isExp ? lineColor : 'white', color: isExp ? 'white' : '#111' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}

          {expandedLines.map((line) => (
            <div key={`f-${line.name}`} className="absolute z-25 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${line.fromX}%`, top: `${line.fromY}%`, transform: `translate(-50%,-50%) scale(${markerScale})` }}>
              <button
                onClick={(e) => { e.stopPropagation(); onLineupClick(line.lineups[0]) }}
                onMouseEnter={() => onHover?.(line.lineups[0].id)}
                onMouseLeave={() => onHover?.(null)}
                className="flex items-center justify-center rounded-full hover:scale-125 transition-transform"
                style={{
                  width: line.lineups.length > 1 ? 24 : 20,
                  height: line.lineups.length > 1 ? 24 : 20,
                  backgroundColor: lineColor,
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  boxShadow: `0 0 8px ${lineColor}80`,
                }}
              >
                {line.lineups.length > 1
                  ? <span className="text-[9px] font-bold text-white">{line.lineups.length}</span>
                  : <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="5"/></svg>
                }
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 whitespace-nowrap text-[9px] font-medium px-1 py-0.5 rounded pointer-events-none"
                style={{ backgroundColor: `${lineColor}d0`, color: 'white' }}>
                {line.name}
              </div>
            </div>
          ))}

          {activeLineup && !hasExpanded && (() => {
            const fp = getPos(map, activeLineup.from)
            const tp = getPos(map, activeLineup.to)
            const tc = colorMap[activeLineup.type as GrenadeType] || '#ef4444'
            return (
              <>
                {fp && (
                  <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${fp.x}%`, top: `${fp.y}%`, transform: `translate(-50%,-50%) scale(${markerScale})` }}>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" style={{ boxShadow: '0 0 12px rgba(16,185,129,0.6)' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="5"/></svg>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/90 text-white">{activeLineup.from}</div>
                  </div>
                )}
                {tp && (
                  <div className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${tp.x}%`, top: `${tp.y}%`, transform: `translate(-50%,-50%) scale(${markerScale})` }}>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: tc, boxShadow: `0 0 12px ${tc}` }}
                      dangerouslySetInnerHTML={{ __html: markerIcons[activeLineup.type as GrenadeType] || '' }} />
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: `${tc}e0` }}>{activeLineup.to}</div>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      <button onClick={() => setShowCallouts((v) => !v)}
        className={`absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
          showCallouts ? 'bg-white/15 text-white border border-white/20' : 'bg-[#1a1b26]/80 text-white/50 border border-[#2a2b36] hover:text-white/70'
        }`}>
        Callouts
      </button>
    </main>
  )
}
