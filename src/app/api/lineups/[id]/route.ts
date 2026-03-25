import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  supabaseHeaders,
  REST_URL,
} from '@/lib/utils/auth-helpers'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/lineups/[id]
 * Fetch a single lineup by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params

  try {
    const res = await fetch(
      `${REST_URL}/lineups?id=eq.${id}&select=*`,
      { headers: supabaseHeaders() }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to fetch lineup' },
        { status: res.status }
      )
    }

    const data = await res.json()
    if (!data.length) {
      return Response.json({ error: 'Lineup not found' }, { status: 404 })
    }

    return Response.json(data[0])
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lineups/[id]
 * Update a lineup. Auth required, only the author can update.
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify ownership
    const checkRes = await fetch(
      `${REST_URL}/lineups?id=eq.${id}&select=user_id`,
      { headers: supabaseHeaders(token) }
    )
    const existing = await checkRes.json()
    if (!existing.length) {
      return Response.json({ error: 'Lineup not found' }, { status: 404 })
    }
    if (existing[0].user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    // Don't allow changing user_id
    delete body.user_id
    delete body.id

    const res = await fetch(
      `${REST_URL}/lineups?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: supabaseHeaders(token),
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to update lineup' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data[0] ?? data)
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lineups/[id]
 * Delete a lineup. Auth required, only the author can delete.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify ownership
    const checkRes = await fetch(
      `${REST_URL}/lineups?id=eq.${id}&select=user_id`,
      { headers: supabaseHeaders(token) }
    )
    const existing = await checkRes.json()
    if (!existing.length) {
      return Response.json({ error: 'Lineup not found' }, { status: 404 })
    }
    if (existing[0].user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const res = await fetch(
      `${REST_URL}/lineups?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: supabaseHeaders(token),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to delete lineup' },
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
