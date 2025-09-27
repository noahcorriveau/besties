'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

type Profile = { id:string; full_name?:string|null; avatar_url?:string|null }
type Post = { id:string; author:string; content:string; created_at:string }

export default function Feed(){
  const [userId, setUserId] = useState<string>('')
  const [me, setMe] = useState<Profile|null>(null)
  const [content, setContent] = useState('')
  const [posts, setPosts] = useState<(Post & { authorProfile?: Profile })[]>([])

  useEffect(()=>{
    (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/join'; return }
      setUserId(data.user.id)

      // If returned from email with ?token=..., mark invite used once and clean URL
      const sp = new URLSearchParams(window.location.search)
      const token = sp.get('token')
      if (token) {
        await fetch('/api/mark-invite-used', {
          method:'POST',
          headers:{'content-type':'application/json'},
          body: JSON.stringify({ token, user_id: data.user.id })
        })
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
      }

      // If no profile yet, go to onboarding
      const { data: profile } = await supabase.from('profiles').select('*')
        .eq('id', data.user.id).maybeSingle()
      if (!profile) { window.location.href = '/onboarding'; return }
      setMe(profile)

      await loadPosts()
    })()
  }, [])

  async function loadPosts(){
    const { data: posts } = await supabase.from('posts')
      .select('id,author,content,created_at')
      .order('created_at', { ascending:false }).limit(30)
    const authorIds = Array.from(new Set((posts ?? []).map(p=>p.author)))
    const { data: authors } = await supabase.from('profiles')
      .select('id,full_name,avatar_url').in('id', authorIds)
    const map = new Map((authors ?? []).map(a=>[a.id,a]))
    setPosts((posts ?? []).map(p => ({ ...p, authorProfile: map.get(p.author) })))
  }

  async function createPost(){
    if (!content.trim()) return
    const { error } = await supabase.from('posts').insert({ author: userId, content })
    if (!error) { setContent(''); await loadPosts() }
  }

  async function signOut(){
    await supabase.auth.signOut()
    window.location.href = '/join'
  }

  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{fontWeight:600}}>besties</div>
        <button onClick={signOut} style={{border:'1px solid #E2E0DA', borderRadius:10, padding:'6px 10px'}}>Sign out</button>
      </div>

      {/* Composer */}
      <div style={{background:'#fff', border:'1px solid #E2E0DA', borderRadius:16, padding:12, marginBottom:16}}>
        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
          <img src={me?.avatar_url ?? '/avatar.png'} style={{width:40, height:40, borderRadius:999}}/>
          <div style={{fontWeight:500}}>{me?.full_name ?? 'You'}</div>
        </div>
        <textarea
          value={content}
          onChange={e=>setContent(e.target.value)}
          placeholder="Share something calm and cozy…"
          style={{width:'100%', minHeight:80, padding:10, border:'1px solid #E2E0DA', borderRadius:12}}
        />
        <div style={{display:'flex', justifyContent:'flex-end', marginTop:8}}>
          <button onClick={createPost} style={{background:'#8B7E6A', color:'#fff', padding:'8px 12px', borderRadius:12}}>
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      <div style={{display:'grid', gap:12}}>
        {posts.map(p => (
          <div key={p.id} style={{background:'#fff', border:'1px solid #E2E0DA', borderRadius:16, padding:12}}>
            <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:6}}>
              <img src={p.authorProfile?.avatar_url ?? '/avatar.png'} style={{width:32, height:32, borderRadius:999}}/>
              <div>
                <div style={{fontWeight:500}}>{p.authorProfile?.full_name ?? 'Friend'}</div>
                <div style={{fontSize:12, color:'#7A756A'}}>{new Date(p.created_at).toLocaleString()}</div>
              </div>
            </div>
            <div style={{whiteSpace:'pre-wrap', fontSize:17, lineHeight:1.5}}>{p.content}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
