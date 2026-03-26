'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import MapArea from '@/components/map/MapArea'
import DetailPanel from '@/components/detail/DetailPanel'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLineups } from '@/hooks/useLineups'
import { useFilters } from '@/hooks/useFilters'
import type { LineupWithStats } from '@/lib/types/lineup'

export default function Home() {
  const { user, accessToken } = useAuth()
  const { lineups, loading, error } = useLineups()
  const { filters, setFilter, setMap, setTab, setSearch, initialLineupId } = useFilters()

  const [activeLineup, setActiveLineup] = useState<LineupWithStats | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Load favorites via API when user logs in
  useEffect(() => {
    if (!user || !accessToken) {
      setFavorites(new Set())
      return
    }
    const loadFavorites = async () => {
      try {
        const res = await fetch('/api/favorites', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const lineupIds: number[] = await res.json()
          setFavorites(new Set(lineupIds))
        }
      } catch (err) {
        console.error('[Home] Failed to load favorites:', err)
      }
    }
    loadFavorites()
  }, [user, accessToken])

  // Open lineup from URL hash on load
  useEffect(() => {
    if (initialLineupId && lineups.length > 0) {
      const lineup = lineups.find((l) => l.id === initialLineupId)
      if (lineup) {
        setActiveLineup(lineup)
        setMap(lineup.map)
      }
    }
  }, [initialLineupId, lineups])

  // Filter lineups
  const filtered = useMemo(() => {
    let result = lineups

    if (filters.tab === 'favorites') {
      result = result.filter((l) => favorites.has(l.id))
      if (filters.search) {
        const q = filters.search.toLowerCase()
        result = result.filter((l) =>
          `${l.name} ${l.from} ${l.to} ${l.description}`.toLowerCase().includes(q)
        )
      }
      return result
    }

    result = result.filter((l) => l.map === filters.map)
    if (filters.type !== 'all') result = result.filter((l) => l.type === filters.type)
    if (filters.side !== 'all') result = result.filter((l) => l.side === filters.side)
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter((l) =>
        `${l.name} ${l.from} ${l.to} ${l.description}`.toLowerCase().includes(q)
      )
    }

    return result
  }, [lineups, filters, favorites])

  // Lineup selection
  const handleLineupClick = useCallback(
    (lineup: LineupWithStats) => {
      setActiveLineup(lineup)
      if (lineup.map !== filters.map && filters.tab !== 'favorites') {
        setMap(lineup.map)
      }
      recordView(lineup.id)
    },
    [filters.map, filters.tab]
  )

  const handleCloseDetail = useCallback(() => {
    setActiveLineup(null)
  }, [])

  // Toggle favorite via API
  const handleToggleFavorite = useCallback(
    async (id: number) => {
      if (!user || !accessToken) return
      const isFav = favorites.has(id)

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev)
        if (isFav) next.delete(id)
        else next.add(id)
        return next
      })

      try {
        if (isFav) {
          const res = await fetch('/api/favorites', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ lineup_id: id }),
          })
          if (!res.ok) throw new Error('Failed to remove favorite')
        } else {
          const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ lineup_id: id }),
          })
          if (!res.ok) throw new Error('Failed to add favorite')
        }
      } catch (err) {
        // Rollback optimistic update on error
        console.error('[Home] Toggle favorite error:', err)
        setFavorites((prev) => {
          const next = new Set(prev)
          if (isFav) next.add(id)
          else next.delete(id)
          return next
        })
      }
    },
    [user, accessToken, favorites]
  )

  // Record view
  const recordView = async (lineupId: number) => {
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineup_id: lineupId }),
      })
    } catch {}
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen items-center justify-center bg-[#0d0e14]"
        >
          <div className="text-center">
            <div className="text-[#8b8fa3]">Загрузка...</div>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen flex-col"
        >
          <Topbar activeMap={filters.map} onMapChange={setMap}>
            <AuthButton />
          </Topbar>

          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              lineups={filtered}
              filters={filters}
              onFilterChange={setFilter}
              onLineupClick={handleLineupClick}
              activeLineupId={activeLineup?.id ?? null}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              user={user}
            />

            <MapArea
              map={filters.map}
              lineups={filters.tab === 'favorites' ? filtered.filter((l) => l.map === filters.map) : filtered}
              activeLineup={activeLineup}
              onLineupClick={handleLineupClick}
            />

            <DetailPanel
              lineup={activeLineup}
              onClose={handleCloseDetail}
              isFavorite={activeLineup ? favorites.has(activeLineup.id) : false}
              onToggleFavorite={() => activeLineup && handleToggleFavorite(activeLineup.id)}
              user={user}
              accessToken={accessToken}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
