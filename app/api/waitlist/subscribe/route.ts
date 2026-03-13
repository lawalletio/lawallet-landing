import { NextResponse } from 'next/server'
import { resolveToPublicKey, addPubkeyToWaitlist } from '@/lib/nostr'
import { submitEmailToTally } from '@/lib/tally'

function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}

export async function POST(request: Request) {
  const { email: contact, source } = await request.json()
  const input = contact?.trim()

  if (!input) {
    return NextResponse.json({ success: false, error: 'Contact is required' }, { status: 400 })
  }

  const isNpub = input.startsWith('npub1')
  const isHex = /^[0-9a-f]{64}$/i.test(input)

  // Clearly a Nostr identifier (npub or hex pubkey)
  if (isNpub || isHex) {
    try {
      const pubkey = await resolveToPublicKey(input)
      const result = await addPubkeyToWaitlist(pubkey)
      return NextResponse.json({ success: true, type: 'nostr', ...result })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid Nostr identifier',
      }, { status: 400 })
    }
  }

  // Has @ — try NIP-05 first, fall back to email
  if (input.includes('@')) {
    try {
      const pubkey = await resolveToPublicKey(input)
      const result = await addPubkeyToWaitlist(pubkey)
      return NextResponse.json({ success: true, type: 'nostr', ...result })
    } catch {
      // NIP-05 failed — if it looks like a valid email, submit to Tally
      if (isEmail(input)) {
        const tallySent = await submitEmailToTally(input)
        console.log('Waitlist (email):', input, source || '', tallySent ? '→ Tally OK' : '→ Tally failed')
        return NextResponse.json({ success: true, type: 'email' })
      }
      return NextResponse.json({
        success: false,
        error: 'Could not resolve NIP-05 identifier',
      }, { status: 400 })
    }
  }

  return NextResponse.json({
    success: false,
    error: 'Provide a valid email, npub, or NIP-05 address',
  }, { status: 400 })
}
