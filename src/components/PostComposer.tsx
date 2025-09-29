'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const moods = ['Chill', 'Hyped', 'Cozy', 'Busy', 'Tired', 'Focused']
const activities = ['Working', 'Studying', 'Gaming', 'With Family', 'Out & About', 'Binging']

export default function PostComposer({
  onPost,
}: {
  onPost: (p: { content: string; mood?: string; activity?: string; file?: File }) => Promise<void>
}) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>()
  const [activity, setActivity] = useState<string>()
  const [file, setFile] = useState<File>()

  return (
    <Card className="rounded-2xl border border-cardBorder shadow-sm">
      <CardContent className="p-4 space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something calm and cozy…"
          className="min-h-[90px] bg-white"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-cardBorder">
                  {mood ?? 'Mood'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {moods.map((m) => (
                  <DropdownMenuItem key={m} onClick={() => setMood(m)}>
                    {m}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl border-cardBorder">
                  {activity ?? 'Activity'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {activities.map((a) => (
                  <DropdownMenuItem key={a} onClick={() => setActivity(a)}>
                    {a}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Attach photo — styled label over hidden input */}
            <label className="inline-flex items-center rounded-xl border border-cardBorder px-3 py-2 cursor-pointer hover:bg-white/60">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
              Attach photo
            </label>
          </div>

          <Button
            className="rounded-xl bg-primary hover:bg-primaryHover text-white"
            disabled={!content.trim()}
            onClick={async () => {
              await onPost({ content, mood, activity, file })
              setContent('')
              setMood(undefined)
              setActivity(undefined)
              setFile(undefined)
            }}
          >
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
