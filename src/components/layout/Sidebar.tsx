'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { colorMap, typeLabels } from '@/lib/constants/labels'
import type {
  GrenadeType,
  LineupFilters,
  LineupWithStats,
  Side,
} from '@/lib/types/lineup'
import type { User } from '@supabase/supabase-js'

/* ── Grenade SVG icons (sidebar variant with detail strokes) ── */
const typeIcons: Record<GrenadeType, string> = {
  smoke: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 7V2M12 22v-5M7 12H2M22 12h-5M8.5 8.5 5 5M19 19l-3.5-3.5M8.5 15.5 5 19M19 5l-3.5 3.5" opacity=".4"/></svg>`,
  flash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  molotov: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c-3 0-5 2.5-5 5.5S9 23 12 23s5-2 5-5.5S15 12 12 12z"/><path d="M12 12V7M10 7h4"/><path d="M11 4c0-1 1-2 1-2s1 1 1 2-1 2-1 2-1-1-1-2z" opacity=".5"/></svg>`,
  he: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="7"/><path d="M12 6V3M9 3h6"/><path d="M8.5 9.5l7 7M15.5 9.5l-7 7" opacity=".35"/></svg>`,
}

const throwShortLabels: Record<string, string> = {
  jumpthrow: 'JT',
  normal: 'N',
  runthrow: 'RT',
  walkthrow: 'WT',
}

/* ── Filter definitions ── */
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

/* ── Props ── */
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

/* ── Component ── */
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

  return (
    <aside className="w-[260px] bg-[#13141a] overflow-y-auto flex flex-col shrink-0 border-r border-[#2a2b36]">
      {/* Grenade type filters */}
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

      {/* Side filters */}
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

      {/* Tabs: All / Favorites */}
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

      {/* Lineup list header */}
      <div className="px-3 pt-3 pb-1">
        <div className="text-[10px] uppercase tracking-wider text-white/30 font-medium">
          Лайнапы
        </div>
      </div>

      {/* Lineup cards */}
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

        {lineups.map((lineup, index) => {
          const isActive = lineup.id === activeLineupId
          const isFav = favorites.has(lineup.id)
          const isHovered = hoveredId === lineup.id

          return (
            <motion.div
              key={lineup.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
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
              {/* Glow accent */}
              <span
                className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ background: colorMap[lineup.type] }}
              />

              {/* Grenade icon */}
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: `${colorMap[lineup.type]}20`,
                  color: colorMap[lineup.type],
                }}
                dangerouslySetInnerHTML={{ __html: typeIcons[lineup.type] }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-xs font-medium truncate">
                  {lineup.name}
                </div>
                <div className="flex items-center gap-1 text-white/35 text-[10px] mt-0.5">
                  <span className="truncate">{lineup.from}</span>
                  <span className="text-white/20">&#x25B8;</span>
                  <span className="truncate">{lineup.to}</span>
                  {lineup.views_count > 0 && (
                    <span className="ml-1 text-white/25">
                      &#x1F441; {lineup.views_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Right badges */}
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
            </motion.div>
          )
        })}
      </div>

      {/* Count footer */}
      <div className="px-3 py-2 text-[10px] text-white/25 border-t border-[#2a2b36] shrink-0">
        {count} {countLabel}
      </div>
    </aside>
  )
}
