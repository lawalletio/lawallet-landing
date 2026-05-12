import { NextResponse } from 'next/server'
import { resolveIdentity, addPubkeyToWaitlist, signWaitlistNostrDM, getDefaultRelays } from '@/lib/nostr'
import { submitEmailToTally, submitNip05ToTally, submitNpubToTally, submitBothToTally } from '@/lib/tally'
import { sendWaitlistWelcomeEmail } from '@/lib/resend'

function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
}

async function buildNostrPayload(input: string, tallyOp: () => Promise<boolean>) {
  const { pubkey, nip05Relays } = await resolveIdentity(input)

  const [waitlistResult, tallySent, signedEvent] = await Promise.all([
    addPubkeyToWaitlist(pubkey),
    tallyOp(),
    Promise.resolve().then(() => signWaitlistNostrDM(pubkey)),
  ])

  return {
    pubkey,
    nip05Relays,
    waitlistResult,
    tallySent,
    signedEvent,
    bootstrapRelays: getDefaultRelays(),
  }
}

export async function POST(request: Request) {
  const { email: contact, method, source } = await request.json()
  const input = contact?.trim()

  if (!input) {
    return NextResponse.json({ success: false, error: 'Contact is required' }, { status: 400 })
  }

  const isNpub = input.startsWith('npub1')
  const isHex = /^[0-9a-f]{64}$/i.test(input)

  // npub or hex pubkey — always Nostr; signed event returned for client to publish
  if (isNpub || isHex) {
    try {
      const { pubkey, nip05Relays, waitlistResult, tallySent, signedEvent, bootstrapRelays } =
        await buildNostrPayload(input, () => submitNpubToTally(input))
      console.log('Waitlist (npub):', input, tallySent ? '→ Tally OK' : '→ Tally failed', '→ DM signed')
      return NextResponse.json({
        success: true,
        type: 'nostr',
        ...waitlistResult,
        pubkey,
        nip05Relays,
        bootstrapRelays,
        signedEvent,
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid Nostr identifier',
      }, { status: 400 })
    }
  }

  // Has @ — behavior depends on method param
  if (input.includes('@')) {
    if (method === 'email') {
      const [tallySent, emailSent] = await Promise.all([
        submitEmailToTally(input),
        sendWaitlistWelcomeEmail(input),
      ])
      console.log('Waitlist (email):', input, source || '', tallySent ? '→ Tally OK' : '→ Tally failed', emailSent ? '→ Email OK' : '→ Email failed')
      return NextResponse.json({ success: true, type: 'email' })
    }

    if (method === 'nostr') {
      try {
        const { pubkey, nip05Relays, waitlistResult, tallySent, signedEvent, bootstrapRelays } =
          await buildNostrPayload(input, () => submitNip05ToTally(input))
        console.log('Waitlist (nip05):', input, tallySent ? '→ Tally OK' : '→ Tally failed', '→ DM signed')
        return NextResponse.json({
          success: true,
          type: 'nostr',
          ...waitlistResult,
          pubkey,
          nip05Relays,
          bootstrapRelays,
          signedEvent,
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Could not resolve NIP-05',
        }, { status: 400 })
      }
    }

    if (method === 'both') {
      try {
        const { pubkey, nip05Relays, waitlistResult, tallySent, signedEvent, bootstrapRelays } =
          await buildNostrPayload(input, () => submitBothToTally(input, input))
        const emailSent = await sendWaitlistWelcomeEmail(input)
        console.log('Waitlist (both):', input, tallySent ? '→ Tally OK' : '→ Tally failed', emailSent ? '→ Email OK' : '→ Email failed', '→ DM signed')
        return NextResponse.json({
          success: true,
          type: 'both',
          ...waitlistResult,
          pubkey,
          nip05Relays,
          bootstrapRelays,
          signedEvent,
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Could not resolve NIP-05',
        }, { status: 400 })
      }
    }

    // No method specified — auto-detect
    try {
      const { pubkey, nip05Relays, waitlistResult, tallySent, signedEvent, bootstrapRelays } =
        await buildNostrPayload(input, () => submitNip05ToTally(input))
      console.log('Waitlist (nip05):', input, tallySent ? '→ Tally OK' : '→ Tally failed', '→ DM signed')
      return NextResponse.json({
        success: true,
        type: 'nostr',
        ...waitlistResult,
        pubkey,
        nip05Relays,
        bootstrapRelays,
        signedEvent,
      })
    } catch {
      if (isEmail(input)) {
        const [tallySent, emailSent] = await Promise.all([
          submitEmailToTally(input),
          sendWaitlistWelcomeEmail(input),
        ])
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
