'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { LineupFilters, MapSlug, GrenadeType, Side } from '@/lib/types/lineup'
import { MAPS } from '@/lib/constants/maps'

const VALID_MAPS = Object.keys(MAPS) as MapSlug[]
const VALID_TYPES: (GrenadeType | 'all')[] = ['all', 'smoke', 'flash', 'molotov', 'he']
const VALID_SIDES: (Side | 'all')[] = ['all', 'T', 'CT']

const DEFAULT_FILTERS: LineupFilters = {
  map: 'mirage',
  type: 'all',
  side: 'all',
  search: '',
  tab: 'all',
}

/* Parse URL hash into filter state */
function parseHash(): Partial<LineupFilters> & { lineupId?: number } {
  if (typeof window === 'undefined') return {}

  const hash = window.location.hash.slice(1)
  if (!hash) return {}

  if (hash === 'favorites') {
    return { tab: 'favorites' }
  }

  if (hash.startsWith('lineup/')) {
    const id = parseInt(hash.split('/')[1], 10)
    if (!isNaN(id)) return { lineupId: id, tab: 'all' }
    return {}
  }

  const parts = hash.split('/')
  const result: Partial<LineupFilters> = { tab: 'all' }

  if (parts[0] && VALID_MAPS.includes(parts[0] as MapSlug)) {
    result.map = parts[0] as MapSlug
  }
  if (parts[1] && VALID_TYPES.includes(parts[1] as GrenadeType)) {
    result.type = parts[1] as GrenadeType | 'all'
  }
  if (parts[2] && VALID_SIDES.includes(parts[2] as Side)) {
    result.side = parts[2] as Side | 'all'
  }

  return result
}

/* Build hash from filter state */
function buildHash(filters: LineupFilters): string {
  if (filters.tab === 'favorites') return '#favorites'

  const parts: string[] = [filters.map]
  if (filters.type !== 'all') parts.push(filters.type)
  if (filters.side !== 'all') parts.push(filters.side)

  return '#' + parts.join('/')
}

interface UseFiltersReturn {
  filters: LineupFilters
  setFilter: <K extends keyof LineupFilters>(key: K, value: LineupFilters[K]) => void
  setMap: (map: MapSlug) => void
  setTab: (tab: 'all' | 'favorites') => void
  setSearch: (search: string) => void
  initialLineupId: number | null
}

export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<LineupFilters>(DEFAULT_FILTERS)
  const [initialLineupId, setInitialLineupId] = useState<number | null>(null)
  const suppressHash = useRef(false)

  /* Read hash on mount */
  useEffect(() => {
    const parsed = parseHash()
    if (parsed.lineupId) {
      setInitialLineupId(parsed.lineupId)
    }
    setFilters((prev) => ({ ...prev, ...parsed }))
  }, [])

  /* Update hash when filters change */
  useEffect(() => {
    if (suppressHash.current) {
      suppressHash.current = false
      return
    }
    const hash = buildHash(filters)
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash)
    }
  }, [filters])

  /* Listen to hashchange (browser back/forward) */
  useEffect(() => {
    const handler = () => {
      suppressHash.current = true
      const parsed = parseHash()
      setFilters((prev) => ({
        ...prev,
        type: 'all',
        side: 'all',
        ...parsed,
      }))
    }

    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const setFilter = useCallback(
    <K extends keyof LineupFilters>(key: K, value: LineupFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const setMap = useCallback((map: MapSlug) => {
    setFilters((prev) => ({ ...prev, map, type: 'all', side: 'all' }))
  }, [])

  const setTab = useCallback((tab: 'all' | 'favorites') => {
    setFilters((prev) => ({ ...prev, tab }))
  }, [])

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }, [])

  return { filters, setFilter, setMap, setTab, setSearch, initialLineupId }
}
