'use client'
import React from 'react'
import type { Reaction } from '@/lib/reactions'

type ReactionBarProps = {
  postId: string
  meId: string
  counts: Partial<Record<Reaction, number>>
  mine: Reaction[]
  onToggle: (r: Reaction, present: boolean) => Promise<void>
  onChanged: () => Promise<void>
}

export default function ReactionBar({
  postId,
  meId,
  counts,
  mine,
  onToggle,
  onChanged,
}: ReactionBarProps) {
  // example render — adjust icons as you like
  const reactions: Reaction[] = ['like', 'lol', 'wow', 'sad', 'heart']

  return (
    <div className="flex gap-2">
      {reactions.map((r) => {
        const count = counts[r] || 0
        const active = mine.includes(r)
        return (
          <button
            key={r}
            onClick={async () => {
              await onToggle(r, active)
              await onChanged()
            }}
            className={`rounded-full px-2 py-1 ${active ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            {r} {count > 0 && count}
          </button>
        )
      })}
    </div>
  )
}
