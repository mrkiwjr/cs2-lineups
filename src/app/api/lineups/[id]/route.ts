import { type NextRequest } from 'next/server'
import { getUser, getToken, supabaseHeaders, REST_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { generalLimiter, writeLimiter, checkRateLimit, getClientIP } from '@/lib/utils/rate-limit'
import { parsePositiveInt, validateLineupUpdate } from '@/lib/utils/validation'

type RouteParams = { params: Promise<{ id: string }> }

export const GET = safeHandler(async (request: NextRequest, { params }: RouteParams) => {
  const rl = await checkRateLimit(generalLimiter, getClientIP(request))
  if (rl) return rl

  const { id } = await params
  const numericId = parsePositiveInt(id)
  if (!numericId) return errorResponse('Invalid lineup ID', 400)

  const res = await fetch(
    `${REST_URL}/lineups?id=eq.${numericId}&select=*`,
    { headers: supabaseHeaders() },
  )

  if (!res.ok) {
    return errorResponse('Failed to fetch lineup', res.status, await res.text())
  }

  const data = await res.json()
  if (!data.length) return errorResponse('Lineup not found', 404)

  return Response.json(data[0])
})

export const PUT = safeHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params
  const numericId = parsePositiveInt(id)
  if (!numericId) return errorResponse('Invalid lineup ID', 400)

  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlPut = await checkRateLimit(writeLimiter, user.id)
  if (rlPut) return rlPut

  const body = await request.json()
  const result = validateLineupUpdate(body)
  if (!result.valid) return errorResponse(result.error, 400)

  const res = await fetch(
    `${REST_URL}/lineups?id=eq.${numericId}&author_id=eq.${user.id}`,
    {
      method: 'PATCH',
      headers: supabaseHeaders(token),
      body: JSON.stringify(result.data),
    },
  )

  if (!res.ok) {
    return errorResponse('Failed to update lineup', res.status, await res.text())
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    return errorResponse('Lineup not found', 404)
  }

  return Response.json(data[0])
})

export const DELETE = safeHandler(async (request: NextRequest, { params }: RouteParams) => {
  const { id } = await params
  const numericId = parsePositiveInt(id)
  if (!numericId) return errorResponse('Invalid lineup ID', 400)

  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rlDel = await checkRateLimit(writeLimiter, user.id)
  if (rlDel) return rlDel

  const res = await fetch(
    `${REST_URL}/lineups?id=eq.${numericId}&author_id=eq.${user.id}`,
    {
      method: 'DELETE',
      headers: supabaseHeaders(token),
    },
  )

  if (!res.ok) {
    return errorResponse('Failed to delete lineup', res.status, await res.text())
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    return errorResponse('Lineup not found', 404)
  }

  return Response.json({ success: true })
})
