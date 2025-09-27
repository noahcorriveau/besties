'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

type Comment = { id:string; content:string; created_at:string; author:string }
type Profile = { id:string; full_name?:string|null; avatar_url?:string|null }

export default function CommentList({ postId }:{ postId: string }) {
  const [items, setItems] = useState<(Comment & { authorProfile?: Profile })[]>([])
  useEffect(()=>{ load() }, [postId])

  async function load(){
    const { data: comments } = await supabase.from('comments')
      .select('id,content,created_at,author')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    const authorIds = Array.from(new Set((comments ?? []).map(c=>c.author)))
    const { data: authors } = await supabase.from('profiles')
      .select('id,full_name,avatar_url').in('id', authorIds)
    const map = new Map((authors ?? []).map(a=>[a.id, a]))
    setItems((comments ?? []).map(c => ({ ...c, authorProfile: map.get(c.author) })))
  }

  return (
    <div style={{display:'grid', gap:8}}>
      {items.map(c => (
        <div key={c.id} style={{display:'flex', gap:8}}>
          <img src={c.authorProfile?.avatar_url ?? '/avatar.png'} style={{width:28, height:28, borderRadius:999}}/>
          <div>
            <div style={{fontWeight:500, fontSize:14}}>{c.authorProfile?.full_name ?? 'Friend'}</div>
            <div style={{whiteSpace:'pre-wrap'}}>{c.content}</div>
            <div style={{fontSize:11, color:'#7A756A'}}>{new Date(c.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
