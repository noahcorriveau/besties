'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

export default function JoinClient(){
  const sp = useSearchParams()
  const token = sp.get('token') || ''
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  async function submit(){
    if (!token) { setStatus('Missing invite token.'); return }

    setStatus('Checking invite…')
    const r = await fetch('/api/use-invite', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ token, email })
    })
    if (!r.ok) { setStatus('Invalid or already used invite.'); return }

    setStatus('Sending magic link…')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/feed?token=' + encodeURIComponent(token),
      }
    })
    if (error) { setStatus(error.message); return }
    setStatus('Check your email to finish sign-in.')
  }

  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:24}}>
      <h1 style={{fontWeight:600, fontSize:20, marginBottom:12}}>You’re invited to besties</h1>
      <input
        placeholder="you@example.com"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        style={{width:'100%', padding:12, border:'1px solid #E2E0DA', borderRadius:12, marginBottom:12}}
      />
      <button onClick={submit} style={{background:'#8B7E6A', color:'#fff', padding:'10px 14px', borderRadius:12}}>
        Continue
      </button>
      <div style={{marginTop:8, color:'#7A756A', fontSize:14}}>{status}</div>
    </main>
  )
}
