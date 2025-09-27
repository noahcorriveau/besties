'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

export default function Onboarding(){
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [err, setErr] = useState('')

  // If already has a profile, send to feed
  useEffect(()=>{
    (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/join'; return }
      const { data: p } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle()
      if (p) window.location.href = '/feed'
    })()
  }, [])

  async function save(){
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return
    const { error } = await supabase.from('profiles')
      .insert({ id: u.user.id, full_name: fullName, username })
    if (error) { setErr(error.message); return }
    window.location.href = '/feed'
  }

  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:24}}>
      <h1 style={{fontWeight:600, fontSize:20, marginBottom:12}}>Set up your profile</h1>
      <input placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)}
             style={{width:'100%', padding:12, border:'1px solid #E2E0DA', borderRadius:12, marginBottom:10}}/>
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)}
             style={{width:'100%', padding:12, border:'1px solid #E2E0DA', borderRadius:12, marginBottom:10}}/>
      {err && <div style={{color:'crimson', marginBottom:10}}>{err}</div>}
      <button onClick={save} style={{background:'#8B7E6A', color:'#fff', padding:'10px 14px', borderRadius:12}}>
        Continue
      </button>
    </main>
  )
}
