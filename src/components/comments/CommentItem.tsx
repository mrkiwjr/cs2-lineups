'use client'

import { useState, useRef, useEffect } from 'react'
import { relativeTime } from '@/lib/utils/relative-time'
import type { Comment } from '@/lib/types/comment'

interface CommentItemProps {
  comment: Comment
  isOwn: boolean
  onEdit: (id: number, text: string) => void
  onDelete: (id: number) => void
}

export default function CommentItem({ comment, isOwn, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [editing])

  const handleSave = () => {
    const trimmed = editText.trim()
    if (!trimmed || trimmed.length > 2000) return
    onEdit(comment.id, trimmed)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditText(comment.text)
    setEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('Удалить комментарий?')) {
      onDelete(comment.id)
    }
  }

  const avatar = comment.author?.avatar_url
  const username = comment.author?.username || 'Аноним'

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="w-8 h-8 rounded-full shrink-0 mt-0.5"
        />
      ) : (
        <div className="w-8 h-8 rounded-full shrink-0 mt-0.5 bg-[#3b7fc4] flex items-center justify-center text-xs font-bold text-white">
          {username[0].toUpperCase()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white/80 truncate">
            {username}
          </span>
          <span className="text-[11px] text-white/25 shrink-0">
            {relativeTime(comment.created_at)}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-[10px] text-white/15 italic shrink-0">
              ред.
            </span>
          )}

          {/* Edit / Delete buttons */}
          {isOwn && !editing && (
            <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
                title="Редактировать"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                title="Удалить"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={2000}
              rows={3}
              className="w-full bg-[#13141f] border border-[#2a2b36] rounded-lg px-3 py-2 text-sm text-[#c0c4d6] placeholder-white/20 resize-none focus:outline-none focus:border-[#3b7fc4] transition-colors"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!editText.trim() || editText.trim().length > 2000}
                className="px-3 py-1 text-xs font-medium rounded-md bg-[#3b7fc4] text-white hover:bg-[#4a8fd4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs font-medium rounded-md bg-white/[0.06] text-white/50 hover:text-white/70 transition-colors"
              >
                Отмена
              </button>
              <span className="text-[10px] text-white/20 ml-auto">
                {editText.length}/2000
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#c0c4d6] whitespace-pre-wrap break-words leading-relaxed">
            {comment.text}
          </p>
        )}
      </div>
    </div>
  )
}
