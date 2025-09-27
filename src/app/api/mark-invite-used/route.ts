import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  const { token, user_id } = await req.json()
  if (!token || !user_id) return NextResponse.json({ ok:false }, { status: 400 })

  const sb = supabaseService()
  const { error } = await sb
    .from('invites')
    .update({ used_by: user_id, used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_at', null)

  if (error) return NextResponse.json({ ok:false }, { status: 400 })
  return NextResponse.json({ ok:true })
}
