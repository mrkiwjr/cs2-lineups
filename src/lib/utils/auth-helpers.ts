const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface SupabaseUser {
  id: string
  email: string
  [key: string]: unknown
}

/**
 * Extract and verify user from the Authorization header via Supabase Auth REST API.
 * Returns the user object or null if unauthenticated.
 */
export async function getUser(request: Request): Promise<SupabaseUser | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

/**
 * Extract the raw Bearer token from the request.
 * Used when we need to forward the user's token to Supabase REST calls.
 */
export function getToken(request: Request): string | null {
  return request.headers.get('authorization')?.replace('Bearer ', '') ?? null
}

/**
 * Build standard headers for Supabase REST API calls.
 * If a user token is provided, it's used for RLS. Otherwise uses the anon key.
 */
export function supabaseHeaders(token?: string | null): Record<string, string> {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }
}

/** Base URL for Supabase PostgREST */
export const REST_URL = `${SUPABASE_URL}/rest/v1`

/** Base URL for Supabase Storage */
export const STORAGE_URL = `${SUPABASE_URL}/storage/v1`
