import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  supabaseHeaders,
  REST_URL,
} from '@/lib/utils/auth-helpers'

/**
 * GET /api/comments?lineup_id=xxx
 * List comments for a lineup. Joins with profiles to get username/avatar.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lineupId = searchParams.get('lineup_id')

  if (!lineupId) {
    return Response.json(
      { error: 'lineup_id query param is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch comments
    const commentsRes = await fetch(
      `${REST_URL}/comments?lineup_id=eq.${lineupId}&order=created_at.asc`,
      { headers: supabaseHeaders() }
    )
    if (!commentsRes.ok) {
      return Response.json({ error: 'Failed to fetch comments' }, { status: commentsRes.status })
    }
    const comments = await commentsRes.json()

    if (comments.length === 0) return Response.json([])

    // Fetch profiles for comment authors
    const userIds = [...new Set(comments.map((c: any) => c.user_id))]
    const profilesRes = await fetch(
      `${REST_URL}/profiles?id=in.(${userIds.join(',')})&select=id,username,avatar_url`,
      { headers: supabaseHeaders() }
    )
    const profiles = profilesRes.ok ? await profilesRes.json() : []
    const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

    // Merge
    const merged = comments.map((c: any) => ({
      ...c,
      author: profileMap.get(c.user_id) || { username: 'Unknown', avatar_url: null },
    }))

    return Response.json(merged)
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/comments
 * Create a comment. Body: { lineup_id, text }. Auth required.
 */
export async function POST(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lineup_id, text } = await request.json()
    if (!lineup_id || !text) {
      return Response.json(
        { error: 'lineup_id and text are required' },
        { status: 400 }
      )
    }

    const res = await fetch(`${REST_URL}/comments`, {
      method: 'POST',
      headers: supabaseHeaders(token),
      body: JSON.stringify({
        lineup_id,
        text,
        user_id: user.id,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to create comment' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data[0] ?? data, { status: 201 })
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
