'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import { MAP_SIZE, getPos } from '@/lib/utils/leaflet-helpers'
import { colorMap, typeLabels } from '@/lib/constants/labels'
import type { MapSlug, LineupWithStats, GrenadeType } from '@/lib/types/lineup'

/* ── Grenade SVG icons for map markers ── */
const markerSVGs: Record<GrenadeType, string> = {
  smoke: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 7V4M12 20v-3M7 12H4M20 12h-3" opacity=".6"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  molotov: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5"><path d="M12 12c-3 0-5 2.5-5 5.5S9 23 12 23s5-2 5-5.5S15 12 12 12z"/><path d="M12 12V8M10 8h4"/></svg>`,
  he: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="13" r="7"/><path d="M12 6V3M9 3h6"/></svg>`,
}

/* ── Helper: convert percentage position to Leaflet LatLng ── */
function toLatLng(map: L.Map, pos: { x: number; y: number }): L.LatLng {
  const px = (pos.x / 100) * MAP_SIZE
  const py = (pos.y / 100) * MAP_SIZE
  return map.unproject([px, py], 0)
}

/* ── Sub-component: handle map change (re-fit bounds) ── */
function MapController({ imageUrl }: { imageUrl: string }) {
  const map = useMap()

  useEffect(() => {
    const corner = map.unproject([MAP_SIZE, MAP_SIZE], 0)
    const bounds = new L.LatLngBounds([0, 0], corner)
    map.setMaxBounds(bounds)
    map.fitBounds(bounds)
  }, [map, imageUrl])

  return null
}

/* ── Marker sub-component (needs useMap) ── */
function LineupMarkers({
  lineups,
  activeLineup,
  onLineupClick,
}: {
  lineups: LineupWithStats[]
  activeLineup: LineupWithStats | null
  onLineupClick: (lineup: LineupWithStats) => void
}) {
  const map = useMap()

  return (
    <>
      {lineups.map((lineup) => {
        const toPos = getPos(lineup.map, lineup.to)
        if (!toPos) return null

        const color = colorMap[lineup.type]
        const isActive = activeLineup?.id === lineup.id
        const size = isActive ? 30 : 24
        const latLng = toLatLng(map, toPos)

        const icon = L.divIcon({
          className: 'grenade-marker',
          html: `<div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${color};
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 ${isActive ? '12px' : '6px'} ${color}80;
            border:${isActive ? '2px solid white' : '1.5px solid rgba(255,255,255,0.3)'};
            transition:all 0.15s;
          ">${markerSVGs[lineup.type]}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        return (
          <Marker
            key={lineup.id}
            position={latLng}
            icon={icon}
            eventHandlers={{
              click: () => onLineupClick(lineup),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -14]}
              className="leaflet-rich-tooltip"
            >
              <div className="text-xs">
                <div className="font-medium text-white">{lineup.name}</div>
                <div className="text-white/50 text-[10px] mt-0.5">
                  {lineup.from} → {lineup.to}
                </div>
                <span
                  className="inline-block text-[9px] mt-1 px-1.5 py-0.5 rounded"
                  style={{ background: `${color}30`, color }}
                >
                  {typeLabels[lineup.type]}
                </span>
              </div>
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}

/* ── Trajectory sub-component ── */
function Trajectory({
  lineup,
}: {
  lineup: LineupWithStats | null
}) {
  const map = useMap()

  if (!lineup) return null

  const fromPos = getPos(lineup.map, lineup.from)
  const toPos = getPos(lineup.map, lineup.to)
  if (!fromPos || !toPos) return null

  const color = colorMap[lineup.type]
  const from = toLatLng(map, fromPos)
  const to = toLatLng(map, toPos)

  return (
    <>
      {/* Dashed trajectory line */}
      <Polyline
        positions={[from, to]}
        pathOptions={{
          color,
          weight: 2.5,
          opacity: 0.6,
          dashArray: '8 6',
          interactive: false,
        }}
      />

      {/* From dot */}
      <CircleMarker
        center={from}
        radius={5}
        pathOptions={{
          fillColor: color,
          fillOpacity: 0.5,
          color,
          weight: 1.5,
          opacity: 0.6,
          interactive: false,
        }}
      >
        <Tooltip
          permanent
          direction="top"
          offset={[0, -8]}
          className="leaflet-marker-tooltip"
        >
          {lineup.from}
        </Tooltip>
      </CircleMarker>
    </>
  )
}

/* ── Props ── */
interface MapInnerProps {
  mapSlug: MapSlug
  imageUrl: string
  lineups: LineupWithStats[]
  activeLineup: LineupWithStats | null
  onLineupClick: (lineup: LineupWithStats) => void
}

/* ── Main inner component ── */
export default function MapInner({
  mapSlug,
  imageUrl,
  lineups,
  activeLineup,
  onLineupClick,
}: MapInnerProps) {
  /* Calculate image bounds at zoom 0 */
  const bounds = useMemo(() => {
    /* Use a temporary map to unproject — but we can also compute directly.
       For CRS.Simple at zoom 0, unproject([px,py], 0) => LatLng(py, px) inverted.
       Leaflet CRS.Simple: latlng.lat = y, latlng.lng = x (in pixel coords).
       unproject at zoom 0 divides by 1 (2^0), so LatLng(-py, px). */
    const corner: L.LatLngTuple = [-MAP_SIZE, MAP_SIZE]
    return new L.LatLngBounds([0, 0], corner)
  }, [])

  return (
    <MapContainer
      crs={L.CRS.Simple}
      minZoom={-1}
      maxZoom={3}
      zoomSnap={0.25}
      zoomDelta={0.5}
      attributionControl={false}
      zoomControl={true}
      bounds={bounds}
      className="w-full h-full"
      style={{ background: '#0d0e14' }}
    >
      <MapController imageUrl={imageUrl} />

      <ImageOverlay url={imageUrl} bounds={bounds} opacity={0.85} />

      <LineupMarkers
        lineups={lineups}
        activeLineup={activeLineup}
        onLineupClick={onLineupClick}
      />

      <Trajectory lineup={activeLineup} />
    </MapContainer>
  )
}
