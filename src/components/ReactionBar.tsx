'use client'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Reaction } from '@/types'

const REACTIONS: { key: Reaction; label: string }[] = [
  { key: 'like', label: '👍' },
  { key: 'heart', label: '❤️' },
  { key: 'lol', label: '😂' },
  { key: 'wow', label: '😮' },
  { key: 'sad', label: '😢' },
]

export default function ReactionBar({
  counts,
  mine,
  onToggle,
}: {
  counts: Partial<Record<Reaction, number>>
  mine: Reaction[]
  onToggle: (r: Reaction, present: boolean) => Promise<void>
}) {
  const [isPending, start] = useTransition()
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {REACTIONS.map(({ key, label }) => {
        const present = mine.includes(key)
        const count = counts[key] ?? 0
        return (
          <Button
            key={key}
            variant={present ? 'default' : 'outline'}
            size="sm"
            className={`rounded-xl ${present ? 'bg-primary text-white' : 'border-cardBorder'}`}
            disabled={isPending}
            onClick={() => start(() => onToggle(key, present))}
            aria-pressed={present}
            aria-label={`${label} ${count > 0 ? count : ''}`}
          >
            <span className="mr-1">{label}</span>
            {count > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full min-w-[1.25rem] justify-center">
                {count}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}
