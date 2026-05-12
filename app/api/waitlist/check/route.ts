import { NextResponse } from 'next/server'
import { resolveIdentity } from '@/lib/nostr'

export async function POST(request: Request) {
  const { contact } = await request.json()
  const input = contact?.trim()

  if (!input) {
    return NextResponse.json({ hasNip05: false })
  }

  // npub or raw hex — Nostr identity, no NIP-05 lookup needed
  if (input.startsWith('npub1') || /^[0-9a-f]{64}$/i.test(input)) {
    try {
      const { pubkey } = await resolveIdentity(input)
      return NextResponse.json({ hasNip05: false, isNostr: true, pubkey, nip05Relays: [] })
    } catch {
      return NextResponse.json({ hasNip05: false })
    }
  }

  // Has @ — try NIP-05 resolution
  if (input.includes('@')) {
    try {
      const { pubkey, nip05Relays } = await resolveIdentity(input)
      return NextResponse.json({ hasNip05: true, pubkey, nip05Relays })
    } catch {
      return NextResponse.json({ hasNip05: false })
    }
  }

  return NextResponse.json({ hasNip05: false })
}
