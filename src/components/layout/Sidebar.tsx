'use client'

import { useState, useEffect, useRef } from 'react'
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
  { value: 'all', label: 'ВСЕ' },
  { value: 'smoke', label: 'ДЫМ' },
  { value: 'flash', label: 'ФЛЭШ' },
  { value: 'molotov', label: 'МОЛОТОВ' },
  { value: 'he', label: 'HE' },
]

const SIDE_FILTERS: { value: Side | 'all'; label: string }[] = [
  { value: 'all', label: 'ОБЕ' },
  { value: 'T', label: 'T' },
  { value: 'CT', label: 'CT' },
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
    <aside className="w-[260px] bg-[#0a0a0a] overflow-y-auto flex flex-col shrink-0 border-r border-[#1c1c1c]">
      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative flex items-center">
          <span className="absolute left-2.5 text-[#444444] text-xs font-bold">{'>'}</span>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="поиск..."
            className="w-full bg-black border border-[#1c1c1c] pl-6 pr-7 py-1.5 text-xs text-[#888888] placeholder:text-[#2a2a2a] outline-none focus:border-[#2a2a2a] transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2 text-[#444444] hover:text-[#888888] transition-colors text-xs"
            >
              x
            </button>
          )}
        </div>
      </div>

      {/* Grenade filter */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] text-[#2a2a2a] mb-1.5 font-bold">
          // ГРАНАТА
        </div>
        <div className="flex flex-wrap gap-1">
          {TYPE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange('type', value)}
              className={`
                flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-wider transition-colors border
                ${
                  filters.type === value
                    ? 'border-[#2a2a2a] bg-[#1a1a1a] text-[#cccccc]'
                    : 'border-transparent text-[#444444] hover:text-[#888888]'
                }
              `}
            >
              {value !== 'all' && (
                <span
                  className="w-1.5 h-1.5 shrink-0"
                  style={{ background: colorMap[value] }}
                />
              )}
              [{label}]
            </button>
          ))}
        </div>
      </div>

      {/* Side filter */}
      <div className="px-3 pt-2 pb-1">
        <div className="text-[10px] text-[#2a2a2a] mb-1.5 font-bold">
          // СТОРОНА
        </div>
        <div className="flex gap-1">
          {SIDE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFilterChange('side', value)}
              className={`
                flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-wider transition-colors border
                ${
                  filters.side === value
                    ? 'border-[#2a2a2a] bg-[#1a1a1a] text-[#cccccc]'
                    : 'border-transparent text-[#444444] hover:text-[#888888]'
                }
              `}
            >
              {value !== 'all' && (
                <span
                  className="w-1.5 h-1.5 shrink-0"
                  style={{
                    background: value === 'T' ? '#a89a3a' : '#5a8a9e',
                  }}
                />
              )}
              [{label}]
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3 pb-1">
        <button
          onClick={() => onFilterChange('tab', 'all')}
          className={`
            px-2 py-1 text-[10px] font-bold tracking-wider transition-colors
            ${
              filters.tab === 'all'
                ? 'text-[#cccccc]'
                : 'text-[#444444] hover:text-[#888888]'
            }
          `}
        >
          {'>'} ВСЕ
        </button>
        <button
          onClick={() => onFilterChange('tab', 'favorites')}
          className={`
            px-2 py-1 text-[10px] font-bold tracking-wider transition-colors
            ${
              filters.tab === 'favorites'
                ? 'text-[#cccccc]'
                : 'text-[#444444] hover:text-[#888888]'
            }
          `}
        >
          {'>'} ИЗБРАННЫЕ
        </button>
      </div>

      {/* Section label */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] text-[#2a2a2a] font-bold">
          // ЛАЙНАПЫ
        </div>
      </div>

      {/* Lineup list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {lineups.length === 0 && filters.tab === 'favorites' && (
          <div className="text-[#2a2a2a] text-xs text-center mt-8">
            {'>'} нет избранных лайнапов
          </div>
        )}
        {lineups.length === 0 && filters.tab !== 'favorites' && (
          <div className="text-[#2a2a2a] text-xs text-center mt-8">
            {'>'} лайнапы не найдены
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
                relative flex items-start gap-2 p-2 cursor-pointer transition-colors mb-0.5
                ${
                  isActive
                    ? 'bg-[#1a1a1a] border-l-2'
                    : isHovered
                    ? 'bg-[#111111] border-l-2'
                    : 'border-l-2 border-transparent hover:bg-[#111111]'
                }
              `}
              style={{
                borderLeftColor: isActive || isHovered ? colorMap[lineup.type] : 'transparent',
              }}
            >
              <div
                className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  color: colorMap[lineup.type],
                }}
                dangerouslySetInnerHTML={{ __html: typeIcons[lineup.type] }}
              />

              <div className="flex-1 min-w-0">
                <div className="text-[#cccccc] text-xs font-medium truncate">
                  {lineup.name}
                </div>
                <div className="flex items-center gap-1 text-[#2a2a2a] text-[10px] mt-0.5">
                  <span className="truncate">{lineup.from}</span>
                  <span>→</span>
                  <span className="truncate">{lineup.to}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(lineup.id)
                  }}
                  className={`transition-colors text-xs ${
                    isFav ? 'text-[#9e3e2a]' : 'text-[#2a2a2a] hover:text-[#444444]'
                  }`}
                  title="Избранное"
                >
                  {isFav ? '*' : '.'}
                </button>
                <span
                  className="text-[9px] font-bold px-1"
                  style={{
                    color: lineup.side === 'T' ? '#a89a3a' : '#5a8a9e',
                  }}
                >
                  {lineup.side}
                </span>
                <span className="text-[9px] text-[#2a2a2a]">
                  {throwShortLabels[lineup.throw_type] ?? lineup.throw_type}
                </span>
              </div>
            </div>
          )
        })}

        {hasMore && (
          <button
            onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
            className="w-full py-2 mt-1 border border-[#1c1c1c] text-[#444444] hover:text-[#888888] hover:border-[#2a2a2a] text-xs font-bold transition-colors"
          >
            [ ещё {lineups.length - displayCount} ]
          </button>
        )}
      </div>

      {/* Count */}
      <div className="px-3 py-2 text-[10px] text-[#2a2a2a] border-t border-[#1c1c1c] shrink-0 font-bold">
        [ {displayCount < count ? `${Math.min(displayCount, count)} / ` : ''}{count} {countLabel} ]
      </div>
    </aside>
  )
}
