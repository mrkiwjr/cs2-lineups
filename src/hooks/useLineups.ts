'use client'

import { useEffect, useState, useCallback } from 'react'
import type { LineupWithStats, MapSlug, GrenadeType, Side, ThrowType } from '@/lib/types/lineup'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface UseLineupsReturn {
  lineups: LineupWithStats[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLineups(): UseLineupsReturn {
  const [lineups, setLineups] = useState<LineupWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLineups = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('[useLineups] fetching via REST...')
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/lineups?select=*&order=id.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      console.log('[useLineups] got', data.length, 'items')

      const merged: LineupWithStats[] = data.map((lineup: any) => ({
        id: lineup.id,
        map: lineup.map as MapSlug,
        side: lineup.side as Side,
        type: lineup.type as GrenadeType,
        name: lineup.name,
        from: lineup.from,
        to: lineup.to,
        throw_type: lineup.throw_type as ThrowType,
        description: lineup.description,
        video: lineup.video ?? '',
        video_url: lineup.video_url ?? '',
        screenshots: lineup.screenshots ?? [],
        author_id: lineup.author_id,
        is_seed: lineup.is_seed,
        created_at: lineup.created_at,
        updated_at: lineup.updated_at,
        views_count: 0,
        favorites_count: 0,
        is_favorited: false,
      }))

      setLineups(merged)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lineups'
      setError(message)
      console.error('[useLineups] error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLineups()
  }, [fetchLineups])

  return { lineups, loading, error, refetch: fetchLineups }
}
