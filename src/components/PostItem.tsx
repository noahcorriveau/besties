import { Card, CardContent } from '@/components/ui/card'
import ReactionBar from './ReactionBar'

export default function PostItem({ post, onToggleReaction }: any) {
  const createdAt = new Date(post.created_at).toLocaleString()
  return (
    <Card className="rounded-2xl border border-cardBorder shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Header: avatar + name + timestamp (no overlap) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={post.author.avatar_url ?? '/avatar.png'}
              alt=""
              className="h-10 w-10 rounded-full flex-none"
            />
            <div className="min-w-0">
              <div className="font-medium leading-tight truncate">
                {post.author.full_name}
              </div>
              <div className="text-xs text-textMuted">{createdAt}</div>
            </div>
          </div>
        </div>

        {(post.mood || post.activity) && (
          <div className="text-sm text-textMuted">
            {post.mood ? `Mood: ${post.mood}` : ''} {post.activity ? `• ${post.activity}` : ''}
          </div>
        )}

        <div className="whitespace-pre-wrap text-[17px] leading-6">{post.content}</div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="rounded-xl border border-cardBorder max-h-[520px] w-auto"
          />
        )}

        <ReactionBar
          counts={post.reactions}
          mine={post.myReactions}
          onToggle={(r, p) => onToggleReaction(post.id, r, p)}
        />
      </CardContent>
    </Card>
  )
}
