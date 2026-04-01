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

    const optimistic: Comment = {
      id: Date.now(),
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

      await fetchComments()
    } catch (err: any) {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setText(trimmed)
      setError(err.message || 'Не удалось отправить комментарий')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: number, newText: string) => {
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
      await fetchComments()
      setError('Не удалось отредактировать комментарий')
    }
  }

  const handleDelete = async (commentId: number) => {
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
      setComments(prev)
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
      <h3 className="text-[10px] font-bold text-[#2a2a2a]">
        // КОММЕНТАРИИ{comments.length > 0 && ` (${comments.length})`}
      </h3>

      {error && (
        <div className="text-[10px] text-[#9e3e2a] border border-[#9e3e2a]/20 px-3 py-2 font-bold">
          {'>'} {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-6 h-6 bg-[#1c1c1c]" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-20 bg-[#1c1c1c]" />
                <div className="h-2 w-full bg-[#1c1c1c]" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-4">
          <p className="text-xs text-[#2a2a2a] font-bold">{'>'} нет комментариев. будьте первым.<span className="animate-[blink-cursor_0.8s_infinite]">_</span></p>
        </div>
      ) : (
        <div className="space-y-3">
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

      <div className="border-t border-[#1c1c1c]" />

      {user ? (
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-[#2a2a2a] text-xs font-bold">{'>'}</span>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="комментарий..."
              maxLength={2000}
              rows={3}
              className="w-full bg-black border border-[#1c1c1c] pl-6 pr-3 py-2 text-xs text-[#888888] placeholder-[#2a2a2a] resize-none focus:outline-none focus:border-[#2a2a2a] transition-colors"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#2a2a2a] font-bold">
              {text.length}/2000 // Ctrl+Enter
            </span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || text.trim().length > 2000 || submitting}
              className="px-3 py-1 text-[10px] font-bold border border-[#2a2a2a] text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              [ {submitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'} ]
            </button>
          </div>
        </div>
      ) : (
        <div className="py-3 border border-[#1c1c1c] text-center">
          <p className="text-xs text-[#2a2a2a] font-bold">
            {'>'} войдите, чтобы комментировать
          </p>
        </div>
      )}
    </div>
  )
}
