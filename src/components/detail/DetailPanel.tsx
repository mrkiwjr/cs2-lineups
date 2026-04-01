'use client'

import { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { typeLabels, throwLabels, mapLabels, colorMap } from '@/lib/constants/labels'
import { getDifficulty } from '@/lib/utils/difficulty'
import CommentSection from '@/components/comments/CommentSection'
import type { LineupWithStats } from '@/lib/types/lineup'
import type { User } from '@supabase/supabase-js'

const SCREENSHOT_LABELS = ['POS', 'AIM', 'RES']

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
          className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row"
        >
          {/* Image area */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[40vh] md:min-h-0">
            <button
              onClick={onClose}
              className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 border border-[#1c1c1c] text-[#888888] text-xs font-bold hover:bg-[#1a1a1a] hover:text-[#cccccc] transition-colors"
            >
              [ ← ESC ]
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
              <div className="text-[#2a2a2a] text-xs">{'>'} нет изображений</div>
            )}

            {!lineup.video && total > 1 && (
              <>
                <div className="absolute top-3 right-3 flex gap-1 z-10">
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`px-3 py-1.5 text-[10px] font-bold border transition-colors ${
                        i === imgIdx
                          ? 'border-[#2a2a2a] bg-[#1a1a1a] text-[#cccccc]'
                          : 'border-[#1c1c1c] text-[#444444] hover:text-[#888888]'
                      }`}
                    >
                      [{String(i + 1).padStart(2, '0')} {SCREENSHOT_LABELS[i] || ''}]
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setImgIdx(i => (i - 1 + total) % total)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-[#1c1c1c] text-[#444444] hover:text-[#cccccc] hover:border-[#2a2a2a] transition-colors z-10 text-xs font-bold"
                >
                  {'<'}
                </button>
                <button
                  onClick={() => setImgIdx(i => (i + 1) % total)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-[#1c1c1c] text-[#444444] hover:text-[#cccccc] hover:border-[#2a2a2a] transition-colors z-10 text-xs font-bold"
                >
                  {'>'}
                </button>
              </>
            )}
          </div>

          {/* Info panel */}
          <div className="w-full md:w-[340px] lg:w-[380px] bg-[#0a0a0a] border-l border-[#1c1c1c] overflow-y-auto shrink-0">
            <div className="px-5 pt-5 pb-4">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 border" style={{ borderColor: `${color}40`, color }}>
                  [{typeLabels[lineup.type].toUpperCase()}]
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 border ${lineup.side === 'T' ? 'border-[#a89a3a]/40 text-[#a89a3a]' : 'border-[#5a8a9e]/40 text-[#5a8a9e]'}`}>
                  [{lineup.side === 'T' ? 'АТАКА' : 'ЗАЩИТА'}]
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 border border-[#1c1c1c] text-[#444444]">
                  [{mapLabels[lineup.map].toUpperCase()}]
                </span>
              </div>
              <h2 className="text-[#cccccc] text-base font-bold leading-tight crt-glow" style={{ textShadow: `0 0 8px ${color}50` }}>
                {lineup.name}
              </h2>
            </div>

            <div className="px-5 pb-6 space-y-4">
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border transition-colors ${
                    isFavorite ? 'border-[#9e3e2a]/40 text-[#9e3e2a]' : 'border-[#1c1c1c] text-[#444444] hover:text-[#888888]'
                  }`}
                >
                  [ {isFavorite ? '* FAV' : 'FAV'} ]
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-[#1c1c1c] text-[#444444] hover:text-[#888888] transition-colors">
                  [ LINK ]
                </button>
              </div>

              {/* Properties table */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c]">
                  <span className="text-[#444444]">СТОРОНА</span>
                  <span className={`font-bold ${lineup.side === 'T' ? 'text-[#a89a3a]' : 'text-[#5a8a9e]'}`}>
                    {lineup.side === 'T' ? 'Террорист' : 'Спецназ'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c]">
                  <span className="text-[#444444]">БРОСОК</span>
                  <span className="font-bold text-[#888888]">{throwLabels[lineup.throw_type]}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1c1c1c]">
                  <span className="text-[#444444]">СЛОЖНОСТЬ</span>
                  <span className="font-bold" style={{ color: diff.color }}>{diff.label}</span>
                </div>
              </div>

              {/* From → To */}
              <div className="border border-[#1c1c1c] p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-[#2a2a2a] font-bold mb-0.5">FROM:</div>
                    <div className="text-[#888888] font-bold">{lineup.from}</div>
                  </div>
                  <span className="text-[#2a2a2a] font-bold">→</span>
                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-[#2a2a2a] font-bold mb-0.5">TO:</div>
                    <div className="text-[#888888] font-bold">{lineup.to}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {lineup.description && (
                <div>
                  <div className="text-[10px] text-[#2a2a2a] font-bold mb-1.5">// ИНСТРУКЦИЯ</div>
                  <p className="text-[#444444] text-xs leading-relaxed border-l-2 pl-3 py-2" style={{ borderColor: `${color}40` }}>
                    {'>'} {lineup.description}
                  </p>
                </div>
              )}

              <CommentSection lineupId={lineup.id} user={user} accessToken={accessToken} />

              {/* Hotkeys */}
              <div className="text-[10px] text-[#2a2a2a] pt-2 flex gap-3 font-bold">
                <span><kbd className="px-1.5 py-0.5 border border-[#1c1c1c] text-[#444444]">Esc</kbd> закрыть</span>
                {total > 1 && <span><kbd className="px-1.5 py-0.5 border border-[#1c1c1c] text-[#444444]">← →</kbd> листать</span>}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
