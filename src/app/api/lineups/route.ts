import { type NextRequest } from 'next/server'
import {
  getUser,
  getToken,
  supabaseHeaders,
  REST_URL,
} from '@/lib/utils/auth-helpers'

/**
 * GET /api/lineups
 * List lineups with optional filters: map, type, side, search
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const map = searchParams.get('map')
  const type = searchParams.get('type')
  const side = searchParams.get('side')
  const search = searchParams.get('search')

  // Build PostgREST query string
  const params = new URLSearchParams()
  params.set('select', '*')
  params.set('order', 'created_at.desc')

  if (map) params.set('map', `eq.${map}`)
  if (type) params.set('type', `eq.${type}`)
  if (side) params.set('side', `eq.${side}`)
  if (search) params.set('title', `ilike.*${search}*`)

  try {
    const res = await fetch(`${REST_URL}/lineups?${params.toString()}`, {
      headers: supabaseHeaders(),
    })

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to fetch lineups' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lineups
 * Create a new lineup. Auth required.
 */
export async function POST(request: NextRequest) {
  const token = getToken(request)
  const user = await getUser(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Whitelist fields — prevent injection of is_seed, id, etc.
    const lineup = {
      name: body.name,
      map: body.map,
      side: body.side,
      type: body.type,
      from: body.from,
      to: body.to,
      throw_type: body.throw_type,
      description: body.description || '',
      video: body.video || '',
      video_url: body.video_url || '',
      screenshots: body.screenshots || [],
      author_id: user.id,
    }

    const res = await fetch(`${REST_URL}/lineups`, {
      method: 'POST',
      headers: supabaseHeaders(token),
      body: JSON.stringify(lineup),
    })

    if (!res.ok) {
      const error = await res.text()
      return Response.json(
        { error: 'Failed to create lineup' },
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
