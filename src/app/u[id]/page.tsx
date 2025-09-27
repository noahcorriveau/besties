'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import { uploadAvatar } from '@/lib/images'

type Profile = { id:string; full_name?:string|null; username?:string|null; bio?:string|null; avatar_url?:string|null }
type Post = { id:string; content:string; image_url?:string|null; created_at:string }

export default function ProfilePage(){
  const params = useParams(); const id = String(params.id)
  const [me, setMe] = useState<string>(''); const [p, setP] = useState<Profile|null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const isMe = p?.id === me

  useEffect(()=>{ (async ()=>{
    const { data: u } = await supabase.auth.getUser()
    setMe(u.user?.id || '')
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    setP(prof ?? null)
    const { data: ps } = await supabase.from('posts').select('id,content,image_url,created_at')
      .eq('author', id).order('created_at', { ascending:false })
    setPosts(ps ?? [])
  })() }, [id])

  async function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !p) return
    const url = await uploadAvatar(file, p.id)
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', p.id)
    setP({ ...p, avatar_url: url })
  }

  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:16}}>
      {p && (
        <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
          <img src={p.avatar_url ?? '/avatar.png'} style={{width:72, height:72, borderRadius:999, border:'1px solid #E2E0DA'}}/>
          <div>
            <div style={{fontWeight:600, fontSize:18}}>{p.full_name ?? 'Friend'}</div>
            <div style={{fontSize:12, color:'#7A756A'}}>@{p.username}</div>
            {isMe && (
              <label style={{display:'inline-block', marginTop:8, cursor:'pointer',
                border:'1px solid #E2E0DA', borderRadius:10, padding:'6px 10px', background:'#fff'}}>
                Change photo
                <input type="file" accept="image/*" onChange={pickAvatar} style={{display:'none'}}/>
              </label>
            )}
          </div>
        </div>
      )}

      <div style={{display:'grid', gap:12}}>
        {posts.map(post => (
          <div key={post.id} style={{background:'#fff', border:'1px solid #E2E0DA', borderRadius:16, padding:12}}>
            <div style={{whiteSpace:'pre-wrap', marginBottom:8}}>{post.content}</div>
            {post.image_url && (
              <img src={post.image_url} style={{width:'100%', borderRadius:12, border:'1px solid #E2E0DA'}}/>
            )}
            <div style={{fontSize:12, color:'#7A756A', marginTop:6}}>{new Date(post.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
