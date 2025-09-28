// src/app/feed/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseBrowser'
import ReactionBar from '../../components/ReactionBar'
import CommentComposer from '../../components/CommentComposer'
import CommentList from '../../components/CommentList'
import { uploadPostImage } from '../../lib/images'

// Data shapes
type Profile = { id: string; full_name?: string | null; avatar_url?: string | null }
type Post = { id: string; author: string; content: string; image_url?: string | null; created_at: string }
type HydratedPost = Post & { authorProfile?: Profile }
type ReactionCountRow = { post_id: string }
type CommentCountRow = { post_id: string }

export default function Feed() {
  const [userId, setUserId] = useState<string>('')
  const [me, setMe] = useState<Profile | null>(null)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [posts, setPosts] = useState<HydratedPost[]>([])
  const [counts, setCounts] = useState<Record<string, { reactions: number; comments: number }>>({})

  // Initial auth + invite-token + profile check + load posts
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        window.location.href = '/join'
        return
      }
      setUserId(data.user.id)

      // If we arrived from the magic link with ?token=..., mark invite as used once
      const sp = new URLSearchParams(window.location.search)
      const token = sp.get('token')
      if (token) {
        await fetch('/api/mark-invite-used', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token, user_id: data.user.id }),
        })
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
      }

      // Ensure profile exists; if not, go to onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!profile) {
        window.location.href = '/onboarding'
        return
      }
      setMe(profile)

      await loadPosts()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPosts() {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, author, content, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(30)

    const authorIds = Array.from(new Set((posts ?? []).map((p) => p.author)))
    const { data: authors } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', authorIds)

    const map = new Map((authors ?? []).map((a) => [a.id, a]))
    const hydrated: HydratedPost[] = (posts ?? []).map((p) => ({ ...p, authorProfile: map.get(p.author) }))
    setPosts(hydrated)
    await loadCounts(hydrated.map((p) => p.id))
  }

  // Pull simple counts (client-side aggregate)
  async function loadCounts(ids: string[]) {
    if (ids.length === 0) return
    const { data: r } = await supabase.from('reactions').select('post_id').in('post_id', ids)
    const { data: c } = await supabase.from('comments').select('post_id').in('post_id', ids)

    const map: Record<string, { reactions: number; comments: number }> = {}
    ids.forEach((id) => (map[id] = { reactions: 0, comments: 0 }))
    ;(r ?? []).forEach((x: ReactionCountRow) => {
      if (map[x.post_id]) map[x.post_id].reactions++
    })
    ;(c ?? []).forEach((x: CommentCountRow) => {
      if (map[x.post_id]) map[x.post_id].comments++
    })
    setCounts(map)
  }

  async function createPost() {
    if (!content.trim() && !imageFile) return
    let image_url: string | undefined = undefined
    if (imageFile) {
      image_url = await uploadPostImage(imageFile, userId)
    }
    const { error } = await supabase.from('posts').insert({ author: userId, content, image_url })
    if (!error) {
      setContent('')
      setImageFile(null)
      await loadPosts()
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/join'
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>besties</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/people" style={{ border: '1px solid #E2E0DA', borderRadius: 10, padding: '6px 10px' }}>
            People
          </Link>
          <button onClick={signOut} style={{ border: '1px solid #E2E0DA', borderRadius: 10, padding: '6px 10px' }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Composer */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E0DA',
          borderRadius: 16,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <Image
            src={me?.avatar_url ?? '/avatar.png'}
            alt="Your avatar"
            width={40}
            height={40}
            style={{ borderRadius: 999 }}
          />
          <div style={{ fontWeight: 500 }}>{me?.full_name ?? 'You'}</div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something calm and cozy…"
          style={{ width: '100%', minHeight: 80, padding: 10, border: '1px solid #E2E0DA', borderRadius: 12 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 8 }}>
          <label
            style={{
              border: '1px solid #E2E0DA',
              borderRadius: 10,
              padding: '6px 10px',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Attach photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>

          <button
            onClick={createPost}
            style={{ background: '#8B7E6A', color: '#fff', padding: '8px 12px', borderRadius: 12 }}
          >
            Post
          </button>
        </div>

        {imageFile && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#7A756A' }}>Selected: {imageFile.name}</div>
        )}
      </div>

      {/* Feed */}
      <div style={{ display: 'grid', gap: 12 }}>
        {posts.map((p) => (
          <div
            key={p.id}
            style={{ background: '#fff', border: '1px solid #E2E0DA', borderRadius: 16, padding: 12 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <Image
                src={p.authorProfile?.avatar_url ?? '/avatar.png'}
                alt={`${p.authorProfile?.full_name ?? 'Friend'} avatar`}
                width={32}
                height={32}
                style={{ borderRadius: 999 }}
              />
              <div>
                <div style={{ fontWeight: 500 }}>{p.authorProfile?.full_name ?? 'Friend'}</div>
                <div style={{ fontSize: 12, color: '#7A756A' }}>
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ whiteSpace: 'pre-wrap', fontSize: 17, lineHeight: 1.5, marginBottom: 8 }}>{p.content}</div>

            {p.image_url && (
              <Image
                src={p.image_url}
                alt="Post image"
                width={1200}
                height={800}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 12,
                  border: '1px solid #E2E0DA',
                  marginBottom: 8,
                }}
              />
            )}

            {/* Reactions row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <ReactionBar
                postId={p.id}
                meId={userId}
                onChanged={async () => {
                  await loadCounts([p.id])
                }}
              />
              <div style={{ fontSize: 12, color: '#7A756A' }}>
                {(counts[p.id]?.reactions ?? 0).toString()} reactions · {(counts[p.id]?.comments ?? 0).toString()} comments
              </div>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 10 }}>
              <CommentList postId={p.id} />
              <div style={{ marginTop: 8 }}>
                <CommentComposer
                  postId={p.id}
                  authorId={userId}
                  onAdded={async () => {
                    await loadCounts([p.id])
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
