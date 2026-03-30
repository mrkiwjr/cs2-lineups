import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parsePositiveInt } from '@/lib/utils/validation'
import { generalLimiter, checkRateLimit, getClientIP } from '@/lib/utils/rate-limit'

export async function POST(request: Request) {
  try {
    const rl = await checkRateLimit(generalLimiter, getClientIP(request))
    if (rl) return rl

    const body = await request.json()
    const lineupId = parsePositiveInt(body.lineup_id)
    if (!lineupId) {
      return NextResponse.json({ error: 'Valid lineup_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    await (supabase.from('lineup_views') as any).upsert(
      { lineup_id: lineupId, viewer_ip: ip },
      { onConflict: 'lineup_id,viewer_ip' },
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
