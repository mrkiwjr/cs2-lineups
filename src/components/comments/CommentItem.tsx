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
    <div className="flex gap-2.5 group">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="w-6 h-6 rounded-sm shrink-0 mt-0.5"
        />
      ) : (
        <div className="w-6 h-6 shrink-0 mt-0.5 bg-[#1c1c1c] flex items-center justify-center text-[10px] font-bold text-[#888888]">
          {username[0].toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#888888] truncate">
            {username}
          </span>
          <span className="text-[10px] text-[#2a2a2a] shrink-0">
            {relativeTime(comment.created_at)}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-[10px] text-[#1c1c1c] shrink-0">
              [ред.]
            </span>
          )}

          {isOwn && !editing && (
            <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="text-[10px] font-bold text-[#444444] hover:text-[#888888] transition-colors"
                title="Редактировать"
              >
                [EDIT]
              </button>
              <button
                onClick={handleDelete}
                className="text-[10px] font-bold text-[#444444] hover:text-[#9e3e2a] transition-colors"
                title="Удалить"
              >
                [DEL]
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
              className="w-full bg-black border border-[#1c1c1c] px-3 py-2 text-xs text-[#888888] placeholder-[#2a2a2a] resize-none focus:outline-none focus:border-[#2a2a2a] transition-colors"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!editText.trim() || editText.trim().length > 2000}
                className="px-2 py-1 text-[10px] font-bold border border-[#2a2a2a] text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                [ SAVE ]
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-[10px] font-bold text-[#444444] hover:text-[#888888] transition-colors"
              >
                [ CANCEL ]
              </button>
              <span className="text-[10px] text-[#2a2a2a] ml-auto font-bold">
                {editText.length}/2000
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#888888] whitespace-pre-wrap break-words leading-relaxed">
            {comment.text}
          </p>
        )}
      </div>
    </div>
  )
}
