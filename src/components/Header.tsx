'use client'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabaseBrowser'
import { fetchNotifications, markAllRead } from '@/lib/notifications'

function SignOutButton() {
  return (
    <button
      className="rounded-xl border border-cardBorder px-3 py-1.5"
      onClick={async () => {
        await supabase.auth.signOut()
        window.location.href = '/join'
      }}
    >
      Sign out
    </button>
  )
}

export default function Header({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])

  const unreadCount = useMemo(() => items.filter((i) => !i.read_at).length, [items])

  useEffect(() => {
    ;(async () => {
      const data = await fetchNotifications()
      setItems(data || [])
    })()

    const channel = supabase
      .channel('notif-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient=eq.${userId}` },
        (payload) => {
          setItems((prev) => [payload.new as any, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function openAndMark() {
    setOpen(true)
    const unreadIds = items.filter((i) => !i.read_at).map((i) => i.id)
    if (unreadIds.length) {
      await markAllRead(unreadIds)
      setItems(items.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() })))
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-[720px] px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">besties</div>
        <div className="flex items-center gap-2">
          <a href="/people" className="rounded-xl border border-cardBorder px-3 py-1.5">
            People
          </a>
          <a href="/admin/invite" className="rounded-xl border border-cardBorder px-3 py-1.5">
            Invite
          </a>
          <a href="/settings" className="rounded-xl border border-cardBorder px-3 py-1.5">
            Settings
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button onClick={openAndMark} variant="outline" className="relative rounded-xl">
                <span>🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[11px] bg-primary text-white rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[360px]">
              <SheetHeader>
                <SheetTitle>Activity</SheetTitle>
              </SheetHeader>
              <Separator className="my-3" />
              <ScrollArea className="h-[85vh] pr-4">
                <div className="space-y-3">
                  {items.length === 0 && <div className="text-textMuted">You’re all caught up.</div>}
                  {items.map((n) => (
                    <div key={n.id} className="flex items-center gap-3">
                      <img src={n.actor?.avatar_url ?? '/avatar.png'} className="h-8 w-8 rounded-full" />
                      <div className="text-sm">
                        <div>
                          <b>{n.actor?.full_name || 'Someone'}</b>{' '}
                          {n.kind === 'react'
                            ? 'reacted to'
                            : n.kind === 'comment'
                            ? 'commented on'
                            : 'mentioned you in'}{' '}
                          a post
                        </div>
                        <div className="text-xs text-textMuted">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
