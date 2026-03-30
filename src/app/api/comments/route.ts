import { type NextRequest } from 'next/server'
import { getUser, getToken, supabaseHeaders, REST_URL } from '@/lib/utils/auth-helpers'
import { safeHandler, errorResponse } from '@/lib/utils/api-response'
import { generalLimiter, writeLimiter, checkRateLimit, getClientIP } from '@/lib/utils/rate-limit'
import { parsePositiveInt, validateCommentText } from '@/lib/utils/validation'

export const GET = safeHandler(async (request: NextRequest) => {
  const rl = await checkRateLimit(generalLimiter, getClientIP(request))
  if (rl) return rl

  const { searchParams } = request.nextUrl
  const lineupId = parsePositiveInt(searchParams.get('lineup_id'))
  if (!lineupId) return errorResponse('Valid lineup_id is required', 400)

  const commentsRes = await fetch(
    `${REST_URL}/comments?lineup_id=eq.${lineupId}&order=created_at.asc`,
    { headers: supabaseHeaders() },
  )

  if (!commentsRes.ok) {
    return errorResponse('Failed to fetch comments', commentsRes.status, await commentsRes.text())
  }

  const comments = await commentsRes.json()
  if (comments.length === 0) return Response.json([])

  const userIds = [...new Set(comments.map((c: any) => c.user_id))]
  const profilesRes = await fetch(
    `${REST_URL}/profiles?id=in.(${userIds.join(',')})&select=id,username,avatar_url`,
    { headers: supabaseHeaders() },
  )

  const profiles = profilesRes.ok ? await profilesRes.json() : []
  const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

  const merged = comments.map((c: any) => ({
    ...c,
    author: profileMap.get(c.user_id) || { username: 'Unknown', avatar_url: null },
  }))

  return Response.json(merged)
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

  const text = validateCommentText(body.text)
  if (!text) return errorResponse('text is required (1-2000 chars)', 400)

  const res = await fetch(`${REST_URL}/comments`, {
    method: 'POST',
    headers: supabaseHeaders(token),
    body: JSON.stringify({ lineup_id: lineupId, text, user_id: user.id }),
  })

  if (!res.ok) {
    return errorResponse('Failed to create comment', res.status, await res.text())
  }

  const data = await res.json()
  return Response.json(data[0] ?? data, { status: 201 })
})
