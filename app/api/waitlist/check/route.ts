import { NextResponse } from 'next/server'
import { resolveToPublicKey } from '@/lib/nostr'

export async function POST(request: Request) {
  const { contact } = await request.json()
  const input = contact?.trim()

  if (!input) {
    return NextResponse.json({ hasNip05: false })
  }

  // npub is always Nostr, no need to check
  if (input.startsWith('npub1') || /^[0-9a-f]{64}$/i.test(input)) {
    return NextResponse.json({ hasNip05: false, isNostr: true })
  }

  // Has @ — try NIP-05 resolution
  if (input.includes('@')) {
    try {
      await resolveToPublicKey(input)
      return NextResponse.json({ hasNip05: true })
    } catch {
      return NextResponse.json({ hasNip05: false })
    }
  }

  return NextResponse.json({ hasNip05: false })
}
