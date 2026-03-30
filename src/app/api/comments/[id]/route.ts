import { type NextRequest } from 'next/server'
import { getUser, getToken, supabaseHeaders, REST_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { writeLimiter, checkRateLimit } from '@/lib/utils/rate-limit'
import { parsePositiveInt, validateCommentText } from '@/lib/utils/validation'

type RouteParams = { params: Promise<{ id: string }> }

export const PUT = safeHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params
  const numericId = parsePositiveInt(id)
  if (!numericId) return errorResponse('Invalid comment ID', 400)

  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlPut = await checkRateLimit(writeLimiter, user.id)
  if (rlPut) return rlPut

  const body = await request.json()
  const text = validateCommentText(body.text)
  if (!text) return errorResponse('text is required (1-2000 chars)', 400)

  const res = await fetch(
    `${REST_URL}/comments?id=eq.${numericId}&user_id=eq.${user.id}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(token),
      body: JSON.stringify({ text }),
    },
  )

  if (!res.ok) {
    return errorResponse('Failed to update comment', res.status, await res.text())
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    return errorResponse('Comment not found', 404)
  }

  return Response.json(data[0])
})

export const DELETE = safeHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params
  const numericId = parsePositiveInt(id)
  if (!numericId) return errorResponse('Invalid comment ID', 400)

  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlDel = await checkRateLimit(writeLimiter, user.id)
  if (rlDel) return rlDel

  const res = await fetch(
    `${REST_URL}/comments?id=eq.${numericId}&user_id=eq.${user.id}`,
    {
      method: 'DELETE',
      headers: supabaseHeaders(token),
    },
  )

  if (!res.ok) {
    return errorResponse('Failed to delete comment', res.status, await res.text())
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    return errorResponse('Comment not found', 404)
  }

  return Response.json({ success: true })
})
