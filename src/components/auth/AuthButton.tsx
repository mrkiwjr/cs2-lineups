'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

export function AuthButton() {
  const { user, profile, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const signIn = async (provider: 'discord' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  if (loading) {
    return <div className="h-6 w-16 animate-pulse border border-[#1c1c1c]" />
  }

  if (!user) {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1 text-[10px] font-bold border border-[#2a2a2a] text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] transition-colors"
        >
          [ ВОЙТИ ]
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 top-full mt-2 w-44 border border-[#1c1c1c] bg-black p-1.5 shadow-xl"
            >
              <button
                onClick={() => signIn('discord')}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] transition-colors font-bold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
                </svg>
                {'>'} DISCORD
              </button>
              <button
                onClick={() => signIn('google')}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] transition-colors font-bold"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {'>'} GOOGLE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 hover:bg-[#1a1a1a] transition-colors"
      >
        {profile?.avatar_url && !avatarError ? (
          <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full" onError={() => setAvatarError(true)} />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center bg-[#1c1c1c] text-[10px] font-bold text-[#888888] rounded-full">
            {(profile?.username || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs text-[#888888]">{profile?.username || 'User'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 top-full mt-2 w-36 border border-[#1c1c1c] bg-black p-1.5 shadow-xl"
          >
            <button
              onClick={signOut}
              className="w-full px-3 py-2 text-left text-xs text-[#9e3e2a] hover:bg-[#1a1a1a] transition-colors font-bold"
            >
              [ ВЫЙТИ ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
