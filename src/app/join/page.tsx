import { Suspense } from 'react'
import JoinClient from './JoinClient'

// prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function JoinPage() {
  return (
    <Suspense fallback={<main style={{maxWidth:720, margin:'0 auto', padding:24}}>Loading…</main>}>
      <JoinClient />
    </Suspense>
  )
}
