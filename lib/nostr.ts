import { readFileSync } from 'fs'
import { join } from 'path'
import { getPublicKey, finalizeEvent } from 'nostr-tools/pure'
import * as nip04 from 'nostr-tools/nip04'
import * as nip19 from 'nostr-tools/nip19'
import * as nip44 from 'nostr-tools/nip44'
import { SimplePool } from 'nostr-tools/pool'
import WebSocket from 'ws'

// Polyfill WebSocket for Node.js (needed by nostr-tools SimplePool)
if (typeof globalThis.WebSocket === 'undefined') {
  // @ts-expect-error ws types differ slightly from native WebSocket
  globalThis.WebSocket = WebSocket
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net',
  'wss://nostr.wine',
  'wss://purplepag.es',
]

const WAITLIST_EVENT_KIND = 30078
const WAITLIST_D_TAG = 'lawallet-waitlist'

function getRelays(): string[] {
  const envRelays = process.env.RELAY_URLS
  if (envRelays) return envRelays.split(',').map(r => r.trim())
  return DEFAULT_RELAYS
}

function getSecretKey(): Uint8Array {
  const key = process.env.PRIVATE_KEY
  if (!key) throw new Error('PRIVATE_KEY is not set')

  if (key.startsWith('nsec1')) {
    const { type, data } = nip19.decode(key)
    if (type !== 'nsec') throw new Error('Invalid nsec key')
    return data
  }

  return hexToBytes(key)
}

function getOurPubkey(): string {
  return getPublicKey(getSecretKey())
}

function getConvKey(): Uint8Array {
  return nip44.v2.utils.getConversationKey(getSecretKey(), getOurPubkey())
}

/**
 * Resolve an npub, NIP-05 identifier, or hex pubkey to a hex public key.
 */
export async function resolveToPublicKey(input: string): Promise<string> {
  input = input.trim()

  // npub1...
  if (input.startsWith('npub1')) {
    const { type, data } = nip19.decode(input)
    if (type !== 'npub') throw new Error('Invalid npub')
    return data
  }

  // NIP-05: user@domain
  if (input.includes('@')) {
    const [name, domain] = input.split('@')
    if (!name || !domain) throw new Error('Invalid NIP-05 format')

    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) throw new Error('NIP-05 resolution failed')

    const json = await res.json()
    const pubkey = json?.names?.[name]
    if (!pubkey) throw new Error(`NIP-05: "${name}" not found at ${domain}`)
    return pubkey
  }

  // Raw 64-char hex pubkey
  if (/^[0-9a-f]{64}$/i.test(input)) return input.toLowerCase()

  throw new Error('Provide an npub, NIP-05, or hex pubkey')
}

/**
 * Fetch the current encrypted waitlist from relays and decrypt it.
 */
async function fetchCurrentList(pool: SimplePool, relays: string[]): Promise<string[]> {
  const event = await pool.get(relays, {
    kinds: [WAITLIST_EVENT_KIND],
    authors: [getOurPubkey()],
    '#d': [WAITLIST_D_TAG],
  })

  if (!event?.content) return []

  try {
    const json = nip44.v2.decrypt(event.content, getConvKey())
    const list = JSON.parse(json)
    return Array.isArray(list) ? list : []
  } catch {
    console.error('Failed to decrypt waitlist event')
    return []
  }
}

/**
 * Add a pubkey to the encrypted waitlist event and publish it.
 * Returns whether the pubkey was added and the total count.
 */
export async function addPubkeyToWaitlist(pubkey: string): Promise<{ added: boolean; total: number }> {
  const relays = getRelays()
  const pool = new SimplePool()

  try {
    const list = await fetchCurrentList(pool, relays)

    if (list.includes(pubkey)) {
      return { added: false, total: list.length }
    }

    const updated = [...list, pubkey]
    const encrypted = nip44.v2.encrypt(JSON.stringify(updated), getConvKey())

    const event = finalizeEvent({
      kind: WAITLIST_EVENT_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['d', WAITLIST_D_TAG]],
      content: encrypted,
    }, getSecretKey())

    await Promise.any(pool.publish(relays, event))

    return { added: true, total: updated.length }
  } finally {
    pool.close(relays)
  }
}

const WAITLIST_DM_MESSAGE = readFileSync(
  join(process.cwd(), 'templates', 'nostr-welcome.txt'),
  'utf-8',
)

/**
 * Send a NIP-04 encrypted DM to a pubkey with the waitlist welcome message.
 */
export async function sendWaitlistNostrDM(recipientPubkey: string): Promise<boolean> {
  const relays = getRelays()
  const pool = new SimplePool()

  try {
    const sk = getSecretKey()
    const content = nip04.encrypt(sk, recipientPubkey, WAITLIST_DM_MESSAGE)

    const event = finalizeEvent({
      kind: 4,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', recipientPubkey]],
      content,
    }, sk)

    await Promise.any(pool.publish(relays, event))
    return true
  } catch (error) {
    console.warn('Nostr DM failed:', error instanceof Error ? error.message : error)
    return false
  } finally {
    pool.close(relays)
  }
}
