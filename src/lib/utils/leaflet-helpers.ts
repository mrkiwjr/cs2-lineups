import type L from 'leaflet'
import { MAPS } from '@/lib/constants/maps'

export const MAP_SIZE = 1024

export function toLatLng(map: L.Map, pos: { x: number; y: number }) {
  const px = (pos.x / 100) * MAP_SIZE
  const py = (pos.y / 100) * MAP_SIZE
  return map.unproject([px, py], 0)
}

export function getPos(
  mapSlug: string,
  positionName: string
): { x: number; y: number } | null {
  const mapData = MAPS[mapSlug]
  if (!mapData) return null
  return mapData.positions[positionName] || null
}
