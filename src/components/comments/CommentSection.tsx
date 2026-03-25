'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Comment } from '@/lib/types/comment'
import CommentItem from './CommentItem'

interface CommentSectionProps {
  lineupId: number
  user: User | null
  accessToken?: string | null
}

export default function CommentSection({ lineupId, user, accessToken }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?lineup_id=${lineupId}`)
      if (!res.ok) throw new Error('Ошибка загрузки')
      const data: Comment[] = await res.json()
      setComments(data)
    } catch {
      setError('Не удалось загрузить комментарии')
    } finally {
      setLoading(false)
    }
  }, [lineupId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || !user || submitting) return
    if (trimmed.length > 2000) {
      setError('Максимум 2000 символов')
      return
    }

    setSubmitting(true)
    setError(null)

    // Optimistic comment
    const optimistic: Comment = {
      id: Date.now(), // temp ID
      lineup_id: lineupId,
      user_id: user.id,
      text: trimmed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        username: user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Вы',
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    }

    setComments((prev) => [...prev, optimistic])
    setText('')

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers,
        body: JSON.stringify({ lineup_id: lineupId, text: trimmed }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Ошибка отправки')
      }

      // Re-fetch to get the real comment with correct ID and author
      await fetchComments()
    } catch (err: any) {
      // Roll back optimistic update
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setText(trimmed)
      setError(err.message || 'Не удалось отправить комментарий')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: number, newText: string) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, text: newText, updated_at: new Date().toISOString() }
          : c
      )
    )

    try {
      const editHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) editHeaders['Authorization'] = `Bearer ${accessToken}`
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: editHeaders,
        body: JSON.stringify({ text: newText }),
      })

      if (!res.ok) throw new Error('Ошибка редактирования')
      await fetchComments()
    } catch {
      await fetchComments() // rollback to server state
      setError('Не удалось отредактировать комментарий')
    }
  }

  const handleDelete = async (commentId: number) => {
    // Optimistic removal
    const prev = comments
    setComments((c) => c.filter((item) => item.id !== commentId))

    try {
      const delHeaders: Record<string, string> = {}
      if (accessToken) delHeaders['Authorization'] = `Bearer ${accessToken}`
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: delHeaders,
      })

      if (!res.ok) throw new Error('Ошибка удаления')
    } catch {
      setComments(prev) // rollback
      setError('Не удалось удалить комментарий')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3 className="text-sm font-medium text-white/60">
          Комментарии{comments.length > 0 && ` (${comments.length})`}
        </h3>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#2a2b36]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-[#2a2b36] rounded" />
                <div className="h-3 w-full bg-[#2a2b36] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-white/20">Нет комментариев</p>
          <p className="text-xs text-white/10 mt-1">Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwn={user?.id === comment.user_id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#2a2b36]" />

      {/* Add comment form or login prompt */}
      {user ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Добавить комментарий..."
            maxLength={2000}
            rows={3}
            className="w-full bg-[#13141f] border border-[#2a2b36] rounded-lg px-3 py-2 text-sm text-[#c0c4d6] placeholder-white/20 resize-none focus:outline-none focus:border-[#3b7fc4] transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/20">
              {text.length}/2000 &middot; Ctrl+Enter для отправки
            </span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || text.trim().length > 2000 || submitting}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[#3b7fc4] text-white hover:bg-[#4a8fd4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-white/[0.02] rounded-lg border border-[#2a2b36]">
          <p className="text-sm text-white/30">
            Войдите, чтобы комментировать
          </p>
        </div>
      )}
    </div>
  )
}
