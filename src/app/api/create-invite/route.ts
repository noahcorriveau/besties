import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseServer'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 })
  }

  const token = randomUUID()

  // Insert invite row (service role bypasses RLS safely on the server)
  const sb = supabaseService()
  const { error } = await sb.from('invites').insert({
    token,
    email: email.toLowerCase(),
    // created_by: (optional) you can pass a user id from the client if you want to track who created it
  })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, token })
}
