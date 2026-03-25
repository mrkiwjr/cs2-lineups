'use client'

import { useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { MapSlug, LineupWithStats, GrenadeType } from '@/lib/types/lineup'
import { MAPS } from '@/lib/constants/maps'
import { colorMap } from '@/lib/constants/labels'

/* ── Dynamic import: MapInner uses Leaflet, which requires browser APIs ── */
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d0e14] text-white/20 text-sm">
      Загрузка карты...
    </div>
  ),
})

/* ── Props ── */
interface MapAreaProps {
  map: MapSlug
  lineups: LineupWithStats[]
  activeLineup: LineupWithStats | null
  onLineupClick: (lineup: LineupWithStats) => void
}

export default function MapArea({
  map,
  lineups,
  activeLineup,
  onLineupClick,
}: MapAreaProps) {
  const mapData = MAPS[map]
  if (!mapData) return null

  return (
    <main className="flex-1 relative bg-[#0d0e14] overflow-hidden">
      <MapInner
        mapSlug={map}
        imageUrl={mapData.image}
        lineups={lineups}
        activeLineup={activeLineup}
        onLineupClick={onLineupClick}
      />
    </main>
  )
}
