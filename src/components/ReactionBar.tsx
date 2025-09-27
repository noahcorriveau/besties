'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

const choices = [
  { key: 'like',  label: '👍' },
  { key: 'lol',   label: '😄' },
  { key: 'heart', label: '❤️' },
  { key: 'wow',   label: '😮' },
  { key: 'sad',   label: '😢' },
] as const
type ChoiceKey = typeof choices[number]['key']

export default function ReactionBar({ postId, meId, onChanged }:{
  postId: string; meId: string; onChanged?: () => void
}) {
  const [busy, setBusy] = useState(false)

  async function react(reaction: ChoiceKey) {
    if (busy) return
    setBusy(true)
    const { data: existing } = await supabase
      .from('reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', meId)
      .eq('reaction', reaction)
      .maybeSingle()

    if (existing) {
      await supabase.from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', meId)
        .eq('reaction', reaction)
    } else {
      await supabase.from('reactions')
        .insert({ post_id: postId, user_id: meId, reaction })
    }
    setBusy(false)
    onChanged?.()
  }

  return (
    <div style={{display:'flex', gap:8}}>
      {choices.map(c => (
        <button key={c.key} onClick={()=>react(c.key as ChoiceKey)}
          style={{border:'1px solid #E2E0DA', borderRadius:10, padding:'6px 10px', background:'#fff'}}>
          {c.label}
        </button>
      ))}
    </div>
  )
}
