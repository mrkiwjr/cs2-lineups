import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { lineup_id } = await request.json()
    if (!lineup_id) {
      return NextResponse.json({ error: 'lineup_id required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get viewer IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

    // Upsert — one view per IP per lineup
    await (supabase.from('lineup_views') as any).upsert(
      { lineup_id, viewer_ip: ip },
      { onConflict: 'lineup_id,viewer_ip' }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
