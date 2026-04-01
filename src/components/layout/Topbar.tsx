'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { mapLabels } from '@/lib/constants/labels'
import type { MapSlug } from '@/lib/types/lineup'

const MAP_SLUGS: MapSlug[] = [
  'mirage',
  'inferno',
  'dust2',
  'nuke',
  'anubis',
  'ancient',
  'overpass',
]

interface TopbarProps {
  activeMap: MapSlug
  onMapChange: (map: MapSlug) => void
  children?: ReactNode
}

export default function Topbar({ activeMap, onMapChange, children }: TopbarProps) {
  return (
    <header className="flex items-center h-11 md:h-12 bg-black border-b border-[#1c1c1c] px-2 md:px-4 gap-2 md:gap-3 shrink-0 z-50">
      <Link href="/" className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity">
        <span className="text-[#cccccc] font-bold text-xs crt-glow">[CS2]</span>
        <span className="text-[#888888] font-bold text-xs tracking-wide hidden sm:inline">LINEUPS</span>
      </Link>

      <div className="mx-2 text-[#1c1c1c] hidden sm:block">|</div>

      <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
        {MAP_SLUGS.map((slug) => (
          <button
            key={slug}
            onClick={() => onMapChange(slug)}
            className={`
              px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap
              ${
                slug === activeMap
                  ? 'text-[#cccccc] border border-[#2a2a2a] bg-[#1a1a1a]'
                  : 'text-[#444444] hover:text-[#888888]'
              }
            `}
          >
            {slug === activeMap ? `[ ${mapLabels[slug].toUpperCase()} ]` : mapLabels[slug].toUpperCase()}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {children}
      </div>
    </header>
  )
}
