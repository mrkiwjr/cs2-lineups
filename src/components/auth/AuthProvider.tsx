'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  accessToken: string | null
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, accessToken: null })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Use a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('[AuthProvider] getSession timed out')
      setLoading(false)
    }, 5000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setAccessToken(session?.access_token ?? null)

      if (currentUser) {
        // Fetch profile via REST to avoid supabase client hanging
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}&select=id,username,avatar_url`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${session!.access_token}`,
              },
            }
          )
          const profiles = await res.json()
          if (profiles?.[0]) setProfile(profiles[0])
        } catch (err) {
          console.error('[AuthProvider] profile fetch error:', err)
        }
      }

      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setAccessToken(session?.access_token ?? null)

        if (!currentUser) {
          setProfile(null)
          return
        }

        // Fetch profile for the new session
        try {
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}&select=id,username,avatar_url`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${session!.access_token}`,
              },
            }
          )
          const profiles = await res.json()
          if (profiles?.[0]) setProfile(profiles[0])
        } catch (err) {
          console.error('[AuthProvider] profile fetch error on auth change:', err)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, accessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
