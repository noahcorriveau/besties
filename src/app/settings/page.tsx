'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseBrowser'

export default function SettingsPage() {
  const [userId, setUserId] = useState<string>('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [file, setFile] = useState<File>()
  const [status, setStatus] = useState('')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/join'; return }
      setUserId(data.user.id)
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle()
      if (p) {
        setFullName(p.full_name ?? '')
        setUsername(p.username ?? '')
        setAvatarUrl(p.avatar_url ?? '')
      }
    })()
  }, [])

  async function save() {
    setStatus('Saving…')

    let newAvatar = avatarUrl
    if (file) {
      const key = `avatars/${crypto.randomUUID()}.${(file.name.split('.').pop()||'jpg').toLowerCase()}`
      const up = await supabase.storage.from('media').upload(key, file, { upsert: true })
      if (up.error) { setStatus(up.error.message); return }
      newAvatar = supabase.storage.from('media').getPublicUrl(key).data.publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username, avatar_url: newAvatar })
      .eq('id', userId)

    if (error) { setStatus(error.message); return }
    setAvatarUrl(newAvatar)
    setStatus('Saved!')
  }

  return (
    <main className="mx-auto max-w-[720px] p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="rounded-2xl border border-cardBorder bg-white p-4 space-y-3">
        <label className="block text-sm">Full name</label>
        <input className="border border-cardBorder rounded-xl p-3 w-full" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your name" />

        <label className="block text-sm">Username</label>
        <input className="border border-cardBorder rounded-xl p-3 w-full" value={username} onChange={e=>setUsername(e.target.value)} placeholder="yourname" />

        <label className="block text-sm">Avatar</label>
        {avatarUrl && <img src={avatarUrl} className="h-16 w-16 rounded-full border border-cardBorder" />}
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} />

        <div className="flex gap-2 pt-2">
          <button className="bg-primary hover:bg-primaryHover text-white rounded-xl px-4 py-2" onClick={save}>Save</button>
          <a href="/feed" className="rounded-xl border border-cardBorder px-4 py-2">Back to feed</a>
        </div>
        <div className="text-sm text-textMuted">{status}</div>
      </div>
    </main>
  )
}
