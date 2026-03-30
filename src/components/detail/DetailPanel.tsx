'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { typeLabels, throwLabels, mapLabels, colorMap } from '@/lib/constants/labels'
import { getDifficulty } from '@/lib/utils/difficulty'
import CommentSection from '@/components/comments/CommentSection'
import type { LineupWithStats } from '@/lib/types/lineup'
import type { User } from '@supabase/supabase-js'

const SCREENSHOT_LABELS = ['Позиция', 'Прицел', 'Результат']

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
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { setImgIdx(0) }, [lineup?.id])

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (!lineup) return
      const total = lineup.screenshots?.length || 0
      if (e.key === 'ArrowLeft' && total > 1) setImgIdx(i => (i - 1 + total) % total)
      if (e.key === 'ArrowRight' && total > 1) setImgIdx(i => (i + 1) % total)
    },
    [onClose, lineup],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const diff = lineup ? getDifficulty(lineup.throw_type) : null
  const color = lineup ? colorMap[lineup.type] : ''
  const screenshots = lineup?.screenshots || []
  const total = screenshots.length

  const handleShare = async () => {
    if (!lineup) return
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#lineup/${lineup.id}`
      )
    } catch { }
  }

  return (
    <AnimatePresence>
      {lineup && diff && (
        <motion.div
          key="detail-fullscreen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#0d0e14] flex flex-col md:flex-row"
        >
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[40vh] md:min-h-0">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white/80 text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Назад
            </button>

            {lineup.video ? (
              <iframe
                src={`https://www.youtube.com/embed/${lineup.video}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                title={lineup.name}
              />
            ) : total > 0 ? (
              screenshots[imgIdx].includes('csnades.gg') ? (
                <Image
                  src={screenshots[imgIdx]}
                  alt={`${lineup.name} — ${SCREENSHOT_LABELS[imgIdx] || ''}`}
                  fill
                  sizes="(max-width: 768px) 100vw, calc(100vw - 380px)"
                  className="object-contain"
                  priority
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={screenshots[imgIdx]}
                  alt={`${lineup.name} — ${SCREENSHOT_LABELS[imgIdx] || ''}`}
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="text-white/20 text-sm">Нет изображений</div>
            )}

            {!lineup.video && total > 1 && (
              <>
                <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors backdrop-blur-sm ${
                        i === imgIdx
                          ? 'bg-white text-black'
                          : 'bg-black/50 text-white/70 hover:bg-black/70'
                      }`}
                    >
                      {SCREENSHOT_LABELS[i] || `${i + 1}`}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + total) % total)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % total)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-10"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </>
            )}
          </div>

          <div className="w-full md:w-[340px] lg:w-[380px] bg-[#1a1b26] border-l border-[#2a2b36] overflow-y-auto shrink-0">
            <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)` }}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: `${color}25`, color }}>
                  {typeLabels[lineup.type]}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${lineup.side === 'T' ? 'bg-[#d4a843]/20 text-[#d4a843]' : 'bg-[#4ea8d1]/20 text-[#4ea8d1]'}`}>
                  {lineup.side === 'T' ? 'Атака' : 'Защита'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-white/50">
                  {mapLabels[lineup.map]}
                </span>
              </div>
              <h2 className="text-white text-lg font-semibold leading-tight">{lineup.name}</h2>
            </div>

            <div className="px-5 pb-6 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isFavorite ? 'bg-red-500/15 text-red-400' : 'bg-white/[0.06] text-white/50 hover:text-white/70'
                  }`}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white/50 hover:text-white/70 transition-colors">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Ссылка
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/40">Сторона</span>
                  <span className={`text-sm font-semibold ${lineup.side === 'T' ? 'text-[#d4a843]' : 'text-[#4ea8d1]'}`}>
                    {lineup.side === 'T' ? 'Террорист' : 'Спецназ'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/40">Бросок</span>
                  <span className="text-sm font-semibold text-white/80">{throwLabels[lineup.throw_type]}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/40">Сложность</span>
                  <span className="text-sm font-semibold" style={{ color: diff.color }}>{diff.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/[0.03] rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Откуда</div>
                  <div className="text-white/80 text-sm font-medium">{lineup.from}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div className="flex-1 text-right">
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Куда</div>
                  <div className="text-white/80 text-sm font-medium">{lineup.to}</div>
                </div>
              </div>

              {lineup.description && (
                <div>
                  <div className="text-xs text-white/40 mb-1.5">Инструкция</div>
                  <p className="text-white/60 text-sm leading-relaxed rounded-lg p-3" style={{ background: `${color}08` }}>
                    {lineup.description}
                  </p>
                </div>
              )}

              <CommentSection lineupId={lineup.id} user={user} accessToken={accessToken} />

              <div className="text-[10px] text-white/20 pt-2 flex gap-3">
                <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/30">Esc</kbd> закрыть</span>
                {total > 1 && <span><kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/30">&larr; &rarr;</kbd> листать</span>}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
