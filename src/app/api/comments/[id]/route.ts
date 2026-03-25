import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  supabaseHeaders,
  REST_URL,
} from '@/lib/utils/auth-helpers'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * PUT /api/comments/[id]
 * Update a comment. Body: { text }. Auth required, only the author.
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
      `${REST_URL}/comments?id=eq.${id}&select=user_id`,
      { headers: supabaseHeaders(token) }
    )
    const existing = await checkRes.json()
    if (!existing.length) {
      return Response.json({ error: 'Comment not found' }, { status: 404 })
    }
    if (existing[0].user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { text } = await request.json()
    if (!text) {
      return Response.json({ error: 'text is required' }, { status: 400 })
    }

    const res = await fetch(
      `${REST_URL}/comments?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: supabaseHeaders(token),
        body: JSON.stringify({ text }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to update comment' },
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
 * DELETE /api/comments/[id]
 * Delete a comment. Auth required, only the author.
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
      `${REST_URL}/comments?id=eq.${id}&select=user_id`,
      { headers: supabaseHeaders(token) }
    )
    const existing = await checkRes.json()
    if (!existing.length) {
      return Response.json({ error: 'Comment not found' }, { status: 404 })
    }
    if (existing[0].user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const res = await fetch(
      `${REST_URL}/comments?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: supabaseHeaders(token),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to delete comment' },
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
