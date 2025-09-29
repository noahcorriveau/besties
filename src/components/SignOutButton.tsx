'use client'
import { supabase } from '@/lib/supabaseBrowser'

export default function SignOutButton() {
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
