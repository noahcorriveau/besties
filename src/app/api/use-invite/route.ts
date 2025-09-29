import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  const { token, email } = await req.json()
  if (!token || !email) return NextResponse.json({ ok: false }, { status: 400 })

  const sb = supabaseService()
  const { data, error } = await sb
    .from('invites')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ ok: false }, { status: 400 })

  // If invite has an email, enforce it
  if (data.email && data.email.toLowerCase() !== String(email).toLowerCase()) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
