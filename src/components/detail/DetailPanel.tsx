'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { typeLabels, throwLabels, mapLabels, colorMap } from '@/lib/constants/labels'
import { getDifficulty } from '@/lib/utils/difficulty'
import CommentSection from '@/components/comments/CommentSection'
import type { LineupWithStats } from '@/lib/types/lineup'
import type { User } from '@supabase/supabase-js'

interface DetailPanelProps {
  lineup: LineupWithStats | null
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
  user: User | null
  accessToken?: string | null
}

export default function DetailPanel({
  lineup,
  onClose,
  isFavorite,
  onToggleFavorite,
  user,
  accessToken,
}: DetailPanelProps) {
  /* Esc key handler */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const diff = lineup ? getDifficulty(lineup.throw_type) : null
  const color = lineup ? colorMap[lineup.type] : ''

  /* Share handler */
  const handleShare = async () => {
    if (!lineup) return
    const url = `${window.location.origin}${window.location.pathname}#lineup/${lineup.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      /* clipboard unavailable */
    }
  }

  /* Video embed or placeholder */
  const videoSection = lineup ? (
    lineup.video ? (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/40">
        <iframe
          src={`https://www.youtube.com/embed/${lineup.video}?rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          loading="lazy"
          title={lineup.name}
        />
      </div>
    ) : lineup.screenshots && lineup.screenshots.length > 0 ? (
      <div className="flex flex-col gap-2">
        {lineup.screenshots.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${lineup.name} screenshot ${i + 1}`}
            className="rounded-lg w-full"
            loading="lazy"
          />
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg bg-white/[0.03] text-white/20">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <span className="text-xs">Видео скоро появится</span>
      </div>
    )
  ) : null

  return (
    <AnimatePresence>
      {lineup && diff && (
    <motion.aside
      key="detail-panel"
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed right-0 top-12 md:top-14 w-full md:w-[420px] h-[calc(100vh-48px)] md:h-[calc(100vh-56px)] bg-[#1a1b26] overflow-y-auto z-40 border-l border-[#2a2b36] shadow-2xl">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10 text-lg"
      >
        &times;
      </button>

      {/* Hero / Tags */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)`,
        }}
      >
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{ background: `${color}25`, color }}
          >
            {typeLabels[lineup.type]}
          </span>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              lineup.side === 'T'
                ? 'bg-[#d4a843]/20 text-[#d4a843]'
                : 'bg-[#4ea8d1]/20 text-[#4ea8d1]'
            }`}
          >
            {lineup.side === 'T' ? 'Атака' : 'Защита'}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-white/50">
            {throwLabels[lineup.throw_type]}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-white/50">
            {mapLabels[lineup.map]}
          </span>
        </div>

        <h2 className="text-white text-base font-semibold leading-tight">
          {lineup.name}
        </h2>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 space-y-5">
        {/* Actions: Favorite + Share */}
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${
                isFavorite
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-white/[0.06] text-white/50 hover:text-white/70'
              }
            `}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isFavorite ? 'В избранном' : 'В избранное'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/50 hover:text-white/70 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Скопировать ссылку
          </button>
        </div>

        {/* From → To path */}
        <div className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
          <div className="flex-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
              Откуда
            </div>
            <div className="text-white/80 text-sm font-medium">{lineup.from}</div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/20 shrink-0"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <div className="flex-1 text-right">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">
              Куда
            </div>
            <div className="text-white/80 text-sm font-medium">{lineup.to}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold" style={{ color: diff.color }}>
              {diff.label}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">Сложность</div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold text-white/70">
              {throwLabels[lineup.throw_type]?.split(' ')[0]}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">Бросок</div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
            <div className="text-sm font-semibold text-white/70">
              {lineup.views_count}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">Просмотры</div>
          </div>
        </div>

        {/* Video / Screenshots */}
        {videoSection}

        {/* Description / Instructions */}
        {lineup.description && (
          <div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs font-medium mb-2">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Инструкция
            </div>
            <p
              className="text-white/60 text-xs leading-relaxed rounded-lg p-3"
              style={{ background: `${color}08` }}
            >
              {lineup.description}
            </p>
          </div>
        )}

        {/* Comments */}
        <CommentSection lineupId={lineup.id} user={user} accessToken={accessToken} />

        {/* Keyboard hint */}
        <div className="text-[10px] text-white/20 pt-2">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/30 text-[10px]">
            Esc
          </kbd>{' '}
          закрыть
        </div>
      </div>
    </motion.aside>
      )}
    </AnimatePresence>
  )
}
