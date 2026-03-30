'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
    <header className="flex items-center h-12 md:h-14 bg-[#13141a] border-b border-[#2a2b36] px-2 md:px-4 gap-2 md:gap-3 shrink-0 z-50">
      <Link href="/" className="flex items-center gap-1.5 md:gap-2 shrink-0 hover:opacity-80 transition-opacity">
        <svg
          className="text-white/80"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
          <path d="M2 12h20" />
        </svg>
        <span className="text-white/90 font-semibold text-sm tracking-wide whitespace-nowrap">
          CS2 Lineups
        </span>
      </Link>

      <nav className="flex items-center gap-1 mx-auto overflow-x-auto scrollbar-hide">
        {MAP_SLUGS.map((slug) => (
          <motion.button
            key={slug}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMapChange(slug)}
            className={`
              relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150
              ${
                slug === activeMap
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-[#1e1f2a]'
              }
            `}
          >
            {slug === activeMap && (
              <motion.div
                layoutId="activeMap"
                className="absolute inset-0 bg-[#2a2b36] rounded-md"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{mapLabels[slug]}</span>
          </motion.button>
        ))}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        {children}
      </div>
    </header>
  )
}
