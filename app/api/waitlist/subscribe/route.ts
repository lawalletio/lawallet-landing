import { NextResponse } from 'next/server'
import { resolveToPublicKey, addPubkeyToWaitlist } from '@/lib/nostr'
import { submitEmailToTally, submitNip05ToTally, submitNpubToTally, submitBothToTally } from '@/lib/tally'
import { sendWaitlistWelcomeEmail } from '@/lib/resend'

function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}

export async function POST(request: Request) {
  const { email: contact, method, source } = await request.json()
  const input = contact?.trim()

  if (!input) {
    return NextResponse.json({ success: false, error: 'Contact is required' }, { status: 400 })
  }

  const isNpub = input.startsWith('npub1')
  const isHex = /^[0-9a-f]{64}$/i.test(input)

  // npub or hex pubkey — always Nostr + submit npub to Tally
  if (isNpub || isHex) {
    try {
      const pubkey = await resolveToPublicKey(input)
      const result = await addPubkeyToWaitlist(pubkey)
      const tallySent = await submitNpubToTally(input)
      console.log('Waitlist (npub):', input, tallySent ? '→ Tally OK' : '→ Tally failed')
      return NextResponse.json({ success: true, type: 'nostr', ...result })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid Nostr identifier',
      }, { status: 400 })
    }
  }

  // Has @ — behavior depends on method param
  if (input.includes('@')) {
    // method: 'email' — submit as email to Tally
    if (method === 'email') {
      const tallySent = await submitEmailToTally(input)
      const emailSent = await sendWaitlistWelcomeEmail(input)
      console.log('Waitlist (email):', input, source || '', tallySent ? '→ Tally OK' : '→ Tally failed', emailSent ? '→ Email OK' : '→ Email failed')
      return NextResponse.json({ success: true, type: 'email' })
    }

    // method: 'nostr' — resolve NIP-05, add to encrypted list, submit NIP-05 to Tally
    if (method === 'nostr') {
      try {
        const pubkey = await resolveToPublicKey(input)
        const result = await addPubkeyToWaitlist(pubkey)
        const tallySent = await submitNip05ToTally(input)
        console.log('Waitlist (nip05):', input, tallySent ? '→ Tally OK' : '→ Tally failed')
        return NextResponse.json({ success: true, type: 'nostr', ...result })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Could not resolve NIP-05',
        }, { status: 400 })
      }
    }

    // method: 'both' — single Tally submission with both fields + nostr list
    if (method === 'both') {
      try {
        const pubkey = await resolveToPublicKey(input)
        const result = await addPubkeyToWaitlist(pubkey)
        const tallySent = await submitBothToTally(input, input)
        const emailSent = await sendWaitlistWelcomeEmail(input)
        console.log('Waitlist (both):', input, tallySent ? '→ Tally OK' : '→ Tally failed', emailSent ? '→ Email OK' : '→ Email failed')
        return NextResponse.json({ success: true, type: 'both', ...result })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Could not resolve NIP-05',
        }, { status: 400 })
      }
    }

    // No method specified — auto-detect (legacy behavior)
    try {
      const pubkey = await resolveToPublicKey(input)
      const result = await addPubkeyToWaitlist(pubkey)
      const tallySent = await submitNip05ToTally(input)
      console.log('Waitlist (nip05):', input, tallySent ? '→ Tally OK' : '→ Tally failed')
      return NextResponse.json({ success: true, type: 'nostr', ...result })
    } catch {
      if (isEmail(input)) {
        const tallySent = await submitEmailToTally(input)
        const emailSent = await sendWaitlistWelcomeEmail(input)
        console.log('Waitlist (email):', input, source || '', tallySent ? '→ Tally OK' : '→ Tally failed', emailSent ? '→ Email OK' : '→ Email failed')
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
