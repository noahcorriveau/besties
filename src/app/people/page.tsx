'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'
import Link from 'next/link'

type Profile = { id:string; full_name?:string|null; username?:string|null; avatar_url?:string|null }

export default function People(){
  const [items, setItems] = useState<Profile[]>([])
  useEffect(()=>{ (async ()=>{
    const { data } = await supabase.from('profiles')
      .select('id,full_name,username,avatar_url')
      .order('full_name', { ascending: true })
    setItems(data ?? [])
  })() }, [])

  return (
    <main style={{maxWidth:720, margin:'0 auto', padding:16}}>
      <h1 style={{fontWeight:600, marginBottom:12}}>People</h1>
      <div style={{display:'grid', gap:10}}>
        {items.map(p => (
          <Link key={p.id} href={`/u/${p.id}`} style={{display:'flex', gap:12, alignItems:'center',
            border:'1px solid #E2E0DA', background:'#fff', padding:10, borderRadius:12}}>
            <img src={p.avatar_url ?? '/avatar.png'} style={{width:44, height:44, borderRadius:999}}/>
            <div>
              <div style={{fontWeight:500}}>{p.full_name ?? 'Friend'}</div>
              <div style={{fontSize:12, color:'#7A756A'}}>@{p.username}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
