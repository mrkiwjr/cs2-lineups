'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { colorMap, typeLabels } from '@/lib/constants/labels'
import type {
  GrenadeType,
  LineupFilters,
  LineupWithStats,
  Side,
} from '@/lib/types/lineup'
import type { User } from '@supabase/supabase-js'

const typeIcons: Record<GrenadeType, string> = {
  smoke: `<svg viewBox="0 0 24 24" width="14" height="14"><ellipse cx="12" cy="14" rx="9" ry="7" fill="currentColor" opacity=".15"/><ellipse cx="10" cy="13" rx="5" ry="4" fill="currentColor" opacity=".7"/><ellipse cx="14" cy="11" rx="5" ry="4" fill="currentColor" opacity=".6"/><ellipse cx="12" cy="12" rx="6" ry="5" fill="currentColor" opacity=".5"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" width="14" height="14"><polygon points="12,1 14.5,8.5 22,9 16,14 18,22 12,17.5 6,22 8,14 2,9 9.5,8.5" fill="currentColor" opacity=".85"/></svg>`,
  molotov: `<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 22c-4 0-7-3-7-7 0-3 2-5.5 4-8 1-1.3 2-2.5 2.5-4 .3.8 1 1.5 1.5 2 2 2.5 4 5 4 8 0 2-1 4-2.5 5.5" fill="currentColor" opacity=".85"/><path d="M12 22c-2 0-3.5-1.5-3.5-3.5 0-2 1.5-3.5 2.5-5 .5.8 1 1.3 1.5 2 1 1.3 1.5 2.5 1.5 4 0 1.2-.8 2.5-2 2.5z" fill="currentColor" opacity=".5"/></svg>`,
  he: `<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="5" fill="currentColor" opacity=".7"/><path d="M12 2l1 5M12 22l-1-5M2 12l5 1M22 12l-5-1M5 5l3.5 3M19 19l-3.5-3M5 19l3.5-3M19 5l-3.5 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".6"/></svg>`,
}

const throwShortLabels: Record<string, string> = {
  jumpthrow: 'JT',
  normal: 'N',
  runthrow: 'RT',
  walkthrow: 'WT',
}

const TYPE_FILTERS: { value: GrenadeType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'smoke', label: 'Дым' },
  { value: 'flash', label: 'Флэш' },
  { value: 'molotov', label: 'Молотов' },
  { value: 'he', label: 'HE' },
]

const SIDE_FILTERS: { value: Side | 'all'; label: string }[] = [
  { value: 'all', label: 'Обе' },
  { value: 'T', label: 'Атака' },
  { value: 'CT', label: 'Защита' },
]

interface SidebarProps {
  lineups: LineupWithStats[]
  filters: LineupFilters
  onFilterChange: (key: keyof LineupFilters, value: string) => void
  onLineupClick: (lineup: LineupWithStats) => void
  activeLineupId: number | null
  favorites: Set<number>
  onToggleFavorite: (id: number) => void
  user: User | null
  hoveredId?: number | null
  onHover?: (id: number | null) => void
}

export default function Sidebar({
  lineups,
  filters,
  onFilterChange,
  onLineupClick,
  activeLineupId,
  favorites,
  onToggleFavorite,
  user,
  hoveredId,
  onHover,
}: SidebarProps) {
  const count = lineups.length
  const countLabel = filters.tab === 'favorites' ? 'избранных' : 'лайнапов'

  const [searchInput, setSearchInput] = useState(filters.search || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFilterChange('search', searchInput)
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput])

  const PAGE_SIZE = 20
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const visibleLineups = lineups.slice(0, displayCount)
  const hasMore = displayCount < lineups.length

  const filterKey = `${filters.map}-${filters.type}-${filters.side}-${filters.tab}-${filters.search}`
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [filterKey])

  return (
    <aside className="w-[260px] bg-[#13141a] overflow-y-auto flex flex-col shrink-0 border-r border-[#2a2b36]">
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Поиск лайнапов..."
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg pl-8 pr-7 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 font-medium">
          Граната
        </div>
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map(({ value, label }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange('type', value)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${
                  filters.type === value
                    ? 'bg-[#2a2b36] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-[#1e1f2a]'
                }
              `}
            >
              {value === 'all' ? (
                <span className="text-[10px]">&#x2726;</span>
              ) : (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: colorMap[value] }}
                />
              )}
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-2 pb-1">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5 font-medium">
          Сторона
        </div>
        <div className="flex gap-1">
          {SIDE_FILTERS.map(({ value, label }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange('side', value)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${
                  filters.side === value
                    ? 'bg-[#2a2b36] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-[#1e1f2a]'
                }
              `}
            >
              {value !== 'all' && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: value === 'T' ? '#d4a843' : '#4ea8d1',
                  }}
                />
              )}
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 px-3 pt-3 pb-1">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange('tab', 'all')}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
            ${
              filters.tab === 'all'
                ? 'bg-[#2a2b36] text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-[#1e1f2a]'
            }
          `}
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Все
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange('tab', 'favorites')}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors
            ${
              filters.tab === 'favorites'
                ? 'bg-[#2a2b36] text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-[#1e1f2a]'
            }
          `}
        >
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Избранные
        </motion.button>
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] uppercase tracking-wider text-white/30 font-medium">
          Лайнапы
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {lineups.length === 0 && filters.tab === 'favorites' && (
          <div className="text-white/30 text-xs text-center mt-8">
            Нет избранных лайнапов
          </div>
        )}
        {lineups.length === 0 && filters.tab !== 'favorites' && (
          <div className="text-white/30 text-xs text-center mt-8">
            Лайнапы не найдены
          </div>
        )}

        {visibleLineups.map((lineup) => {
          const isActive = lineup.id === activeLineupId
          const isFav = favorites.has(lineup.id)
          const isHovered = hoveredId === lineup.id

          return (
            <div
              key={lineup.id}
              onClick={() => onLineupClick(lineup)}
              onMouseEnter={() => onHover?.(lineup.id)}
              onMouseLeave={() => onHover?.(null)}
              className={`
                relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors mb-0.5
                ${
                  isActive
                    ? 'bg-[#2a2b36]'
                    : isHovered
                    ? 'bg-[#1e1f2a] ring-1 ring-[#4ea8d1]/30'
                    : 'hover:bg-[#1e1f2a]'
                }
              `}
            >
              <span
                className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ background: colorMap[lineup.type] }}
              />

              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: `${colorMap[lineup.type]}20`,
                  color: colorMap[lineup.type],
                }}
                dangerouslySetInnerHTML={{ __html: typeIcons[lineup.type] }}
              />

              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-xs font-medium truncate">
                  {lineup.name}
                </div>
                <div className="flex items-center gap-1 text-white/35 text-[10px] mt-0.5">
                  <span className="truncate">{lineup.from}</span>
                  <span className="text-white/20">&#x25B8;</span>
                  <span className="truncate">{lineup.to}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(lineup.id)
                  }}
                  className={`transition-colors ${
                    isFav ? 'text-red-400' : 'text-white/20 hover:text-white/40'
                  }`}
                  title="Избранное"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill={isFav ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    lineup.side === 'T'
                      ? 'bg-[#d4a843]/20 text-[#d4a843]'
                      : 'bg-[#4ea8d1]/20 text-[#4ea8d1]'
                  }`}
                >
                  {lineup.side}
                </span>
                <span className="text-[9px] text-white/25">
                  {throwShortLabels[lineup.throw_type] ?? lineup.throw_type}
                </span>
              </div>
            </div>
          )
        })}

        {hasMore && (
          <button
            onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
            className="w-full py-2 mt-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 text-xs font-medium transition-colors"
          >
            Показать ещё ({lineups.length - displayCount})
          </button>
        )}
      </div>

      <div className="px-3 py-2 text-[10px] text-white/25 border-t border-[#2a2b36] shrink-0">
        {displayCount < count ? `${Math.min(displayCount, count)} из ` : ''}{count} {countLabel}
      </div>
    </aside>
  )
}
