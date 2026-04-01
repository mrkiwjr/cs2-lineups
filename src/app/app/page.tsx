'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import MapArea from '@/components/map/MapArea'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLineups } from '@/hooks/useLineups'
import { useFilters } from '@/hooks/useFilters'
import type { LineupWithStats } from '@/lib/types/lineup'

const DetailPanel = dynamic(() => import('@/components/detail/DetailPanel'), { ssr: false })

export default function Home() {
  const { user, accessToken } = useAuth()
  const { lineups, positions, loading, error } = useLineups()
  const { filters, setFilter, setMap, setTab, setSearch, initialLineupId } = useFilters()

  const [activeLineup, setActiveLineup] = useState<LineupWithStats | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const favoritesRef = useRef(favorites)
  favoritesRef.current = favorites

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

  useEffect(() => {
    if (initialLineupId && lineups.length > 0) {
      const lineup = lineups.find((l) => l.id === initialLineupId)
      if (lineup) {
        setActiveLineup(lineup)
        setMap(lineup.map)
      }
    }
  }, [initialLineupId, lineups])

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

  const handleToggleFavorite = useCallback(
    async (id: number) => {
      if (!user || !accessToken) return
      const isFav = favoritesRef.current.has(id)

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
        console.error('[Home] Toggle favorite error:', err)
        setFavorites((prev) => {
          const next = new Set(prev)
          if (isFav) next.add(id)
          else next.delete(id)
          return next
        })
      }
    },
    [user, accessToken]
  )

  const recordView = async (lineupId: number) => {
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineup_id: lineupId }),
      })
    } catch { }
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen items-center justify-center bg-black"
        >
          <div className="text-center font-mono">
            <div className="text-[#5a8a9e] text-sm crt-glow-smoke">{'>'} ЗАГРУЗКА СИСТЕМЫ...<span className="animate-[blink-cursor_0.8s_infinite]">_</span></div>
            {error && <div className="mt-2 text-[#9e3e2a] text-xs">{error}</div>}
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
            <div className="hidden md:block w-[260px] flex-shrink-0 h-full overflow-y-auto">
              <Sidebar
                lineups={filtered}
                filters={filters}
                onFilterChange={setFilter}
                onLineupClick={handleLineupClick}
                activeLineupId={activeLineup?.id ?? null}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                user={user}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            </div>

            <div className="flex-1 min-h-[50vh] md:min-h-0 flex flex-col">
              <div className="flex-1">
                <MapArea
                  map={filters.map}
                  lineups={filters.tab === 'favorites' ? filtered.filter((l) => l.map === filters.map) : filtered}
                  activeLineup={activeLineup}
                  onLineupClick={handleLineupClick}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  positions={positions}
                />
              </div>

              <div className="md:hidden mx-3 my-4 p-3 border border-[#1c1c1c] bg-[#0a0a0a]">
                <p className="text-[#444444] text-xs leading-relaxed">
                  <span className="text-[#5a8a9e] font-bold">[CS2]</span> LINEUPS — раскиды гранат для CS2.{' '}
                  <a href="/" className="text-[#5a8a9e] underline">Главная</a>
                </p>
              </div>
            </div>

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
