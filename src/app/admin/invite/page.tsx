'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

export default function AdminInvite() {
  const [me, setMe] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  // basic guard: require a signed-in user (you)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/join'
      } else {
        setMe(data.user.id)
      }
    })
  }, [])

  async function sendInvite() {
    setStatus('Creating invite…')
    const res = await fetch('/api/create-invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    if (!json.ok) {
      setStatus(`Error: ${json.error || 'unable to create invite'}`)
      return
    }

    const token = json.token as string
    setStatus('Sending magic link…')

    // Ask Supabase to email a magic link that redirects to /join?token=... after they click it.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/join?token=${encodeURIComponent(token)}` },
    })

    if (error) {
      setStatus(`Error sending email: ${error.message}`)
      return
    }

    setEmail('')
    setStatus('Invite sent! They’ll get an email with a sign-in link.')
  }

  if (!me) return null

  return (
    <main className="mx-auto max-w-[720px] p-6 space-y-4">
      <h1 className="text-xl font-semibold">Send an invite</h1>
      <p className="text-textMuted text-sm">Type a friend’s email. They’ll receive a magic link that brings them straight into besties.</p>
      <input
        className="border border-cardBorder rounded-xl p-3 w-full"
        placeholder="friend@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="bg-primary hover:bg-primaryHover text-white rounded-xl px-4 py-2"
          onClick={sendInvite}
          disabled={!email.trim()}
        >
          Send invite
        </button>
        <a href="/feed" className="rounded-xl border border-cardBorder px-4 py-2">Back to feed</a>
      </div>
      <div className="text-sm text-textMuted">{status}</div>
    </main>
  )
}
