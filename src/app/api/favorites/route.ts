import { type NextRequest } from 'next/server'
import { getUser, getToken, supabaseHeaders, REST_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { writeLimiter, checkRateLimit } from '@/lib/utils/rate-limit'
import { parsePositiveInt } from '@/lib/utils/validation'

export const GET = safeHandler(async (request: NextRequest) => {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rl = await checkRateLimit(writeLimiter, user.id)
  if (rl) return rl

  const res = await fetch(
    `${REST_URL}/favorites?user_id=eq.${user.id}&select=lineup_id`,
    { headers: supabaseHeaders(token) },
  )

  if (!res.ok) {
    return errorResponse('Failed to fetch favorites', res.status, await res.text())
  }

  const data = await res.json()
  return Response.json(data.map((row: { lineup_id: number }) => row.lineup_id))
})

export const POST = safeHandler(async (request: NextRequest) => {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlPost = await checkRateLimit(writeLimiter, user.id)
  if (rlPost) return rlPost

  const body = await request.json()
  const lineupId = parsePositiveInt(body.lineup_id)
  if (!lineupId) return errorResponse('Valid lineup_id is required', 400)

  const res = await fetch(`${REST_URL}/favorites`, {
    method: 'POST',
    headers: supabaseHeaders(token),
    body: JSON.stringify({ user_id: user.id, lineup_id: lineupId }),
  })

  if (!res.ok) {
    if (res.status === 409) return errorResponse('Already in favorites', 409)
    return errorResponse('Failed to add favorite', res.status, await res.text())
  }

  const data = await res.json()
  return Response.json(data[0] ?? data, { status: 201 })
})

export const DELETE = safeHandler(async (request: NextRequest) => {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlDel = await checkRateLimit(writeLimiter, user.id)
  if (rlDel) return rlDel

  const body = await request.json()
  const lineupId = parsePositiveInt(body.lineup_id)
  if (!lineupId) return errorResponse('Valid lineup_id is required', 400)

  const res = await fetch(
    `${REST_URL}/favorites?user_id=eq.${user.id}&lineup_id=eq.${lineupId}`,
    {
      method: 'DELETE',
      headers: supabaseHeaders(token),
    },
  )

  if (!res.ok) {
    return errorResponse('Failed to remove favorite', res.status, await res.text())
  }

  return Response.json({ success: true })
})
