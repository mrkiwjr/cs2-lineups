import { type NextRequest } from 'next/server'
import { getUser, getToken, supabaseHeaders, REST_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { generalLimiter, writeLimiter, checkRateLimit, getClientIP } from '@/lib/utils/rate-limit'
import {
  isValidMap, isValidSide, isValidType,
  escapePostgrestPattern, validateLineupCreate,
} from '@/lib/utils/validation'

export const GET = safeHandler(async (request: NextRequest) => {
  const rl = await checkRateLimit(generalLimiter, getClientIP(request))
  if (rl) return rl

  const { searchParams } = request.nextUrl
  const map = searchParams.get('map')
  const type = searchParams.get('type')
  const side = searchParams.get('side')
  const search = searchParams.get('search')

  if (map && !isValidMap(map)) return errorResponse('Invalid map value', 400)
  if (type && !isValidType(type)) return errorResponse('Invalid type value', 400)
  if (side && !isValidSide(side)) return errorResponse('Invalid side value', 400)

  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('order', 'created_at.desc')

  if (map) params.set('map', `eq.${map}`)
  if (type) params.set('type', `eq.${type}`)
  if (side) params.set('side', `eq.${side}`)
  if (search) {
    const safeSearch = escapePostgrestPattern(search.slice(0, 100))
    params.set('name', `ilike.*${safeSearch}*`)
  }

  const res = await fetch(`${REST_URL}/lineups?${params.toString()}`, {
    headers: supabaseHeaders(),
  })

  if (!res.ok) {
    return errorResponse('Failed to fetch lineups', res.status, await res.text())
  }

  return Response.json(await res.json())
})

export const POST = safeHandler(async (request: NextRequest) => {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) return errorResponse('Unauthorized', 401)

  const rl = await checkRateLimit(writeLimiter, user.id)
  if (rl) return rl

  const body = await request.json()
  const result = validateLineupCreate(body)
  if (!result.valid) return errorResponse(result.error, 400)

  const res = await fetch(`${REST_URL}/lineups`, {
    method: 'POST',
    headers: supabaseHeaders(token),
    body: JSON.stringify({ ...result.data, author_id: user.id }),
  })

  if (!res.ok) {
    return errorResponse('Failed to create lineup', res.status, await res.text())
  }

  const data = await res.json()
  return Response.json(data[0] ?? data, { status: 201 })
})
