import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  supabaseHeaders,
  REST_URL,
} from '@/lib/utils/auth-helpers'

/**
 * GET /api/favorites
 * List the authenticated user's favorites. Returns array of lineup_ids.
 */
export async function GET(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `${REST_URL}/favorites?user_id=eq.${user.id}&select=lineup_id`,
      { headers: supabaseHeaders(token) }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to fetch favorites' },
        { status: res.status }
      )
    }

    const data = await res.json()
    const lineupIds = data.map((row: { lineup_id: string }) => row.lineup_id)
    return Response.json(lineupIds)
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Add a lineup to favorites. Body: { lineup_id }
 */
export async function POST(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lineup_id } = await request.json()
    if (!lineup_id) {
      return Response.json(
        { error: 'lineup_id is required' },
        { status: 400 }
      )
    }

    const res = await fetch(`${REST_URL}/favorites`, {
      method: 'POST',
      headers: supabaseHeaders(token),
      body: JSON.stringify({
        user_id: user.id,
        lineup_id,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      // 409 Conflict likely means it already exists (unique constraint)
      if (res.status === 409) {
        return Response.json(
          { error: 'Already in favorites' },
          { status: 409 }
        )
      }
      return Response.json(
        { error: 'Failed to add favorite' },
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

/**
 * DELETE /api/favorites
 * Remove a lineup from favorites. Body: { lineup_id }
 */
export async function DELETE(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lineup_id } = await request.json()
    if (!lineup_id) {
      return Response.json(
        { error: 'lineup_id is required' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${REST_URL}/favorites?user_id=eq.${user.id}&lineup_id=eq.${lineup_id}`,
      {
        method: 'DELETE',
        headers: supabaseHeaders(token),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to remove favorite' },
        { status: res.status }
      )
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
