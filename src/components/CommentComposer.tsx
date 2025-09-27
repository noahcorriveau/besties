'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

export default function CommentComposer({ postId, authorId, onAdded }:{
  postId: string; authorId: string; onAdded?: () => void
}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(){
    if (!text.trim() || busy) return
    setBusy(true)
    const { error } = await supabase.from('comments')
      .insert({ post_id: postId, author: authorId, content: text })
    if (!error) { setText(''); onAdded?.() }
    setBusy(false)
  }

  return (
    <div style={{display:'flex', gap:8}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment…"
        style={{flex:1, padding:10, border:'1px solid #E2E0DA', borderRadius:12}}/>
      <button onClick={submit} style={{background:'#8B7E6A', color:'#fff', padding:'8px 12px', borderRadius:12}}>
        Send
      </button>
    </div>
  )
}
