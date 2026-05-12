'use client'

import { SimplePool } from 'nostr-tools/pool'
import type { Event as NostrEvent } from 'nostr-tools/pure'

const NIP65_KIND = 10002
const NIP65_TIMEOUT_MS = 4000
const PUBLISH_TIMEOUT_MS = 6000

export type RelaySource = 'nip05' | 'nip65' | 'default'

export interface RelayWithSource {
  url: string
  source: RelaySource
}

export interface PublishResult {
  url: string
  ok: boolean
  error?: string
}

function normalizeRelayUrl(url: string): string | null {
  try {
    const trimmed = url.trim()
    if (!trimmed) return null
    const u = new URL(trimmed)
    if (u.protocol !== 'wss:' && u.protocol !== 'ws:') return null
    const path = u.pathname.replace(/\/+$/, '')
    return `${u.protocol}//${u.host}${path}`
  } catch {
    return null
  }
}

/**
 * Fetch NIP-65 (kind 10002) relay list metadata for the given pubkey from a set of bootstrap relays.
 * Returns relay URLs that are not marked read-only.
 */
export async function fetchNip65Relays(pubkey: string, bootstrapRelays: string[]): Promise<string[]> {
  if (!bootstrapRelays.length) return []
  const pool = new SimplePool()

  try {
    const event = await Promise.race<NostrEvent | null>([
      pool.get(bootstrapRelays, {
        kinds: [NIP65_KIND],
        authors: [pubkey],
      }),
      new Promise<null>(resolve => setTimeout(() => resolve(null), NIP65_TIMEOUT_MS)),
    ])

    if (!event) return []

    const relays: string[] = []
    for (const tag of event.tags) {
      if (tag[0] !== 'r' || !tag[1]) continue
      const marker = tag[2]
      // Honor read/write markers — only "read" relays are unsuitable for our DM
      if (marker === 'read') continue
      relays.push(tag[1])
    }
    return relays
  } catch {
    return []
  } finally {
    try { pool.close(bootstrapRelays) } catch { /* ignore */ }
  }
}

/**
 * Merge multiple relay lists, normalizing and deduplicating. Source priority: nip65 > nip05 > default.
 */
export function dedupeRelays(input: {
  nip05?: string[]
  nip65?: string[]
  defaults?: string[]
}): RelayWithSource[] {
  const seen = new Map<string, RelaySource>()
  const ordered: RelayWithSource[] = []

  const visit = (urls: string[] | undefined, source: RelaySource) => {
    if (!urls) return
    for (const raw of urls) {
      const url = normalizeRelayUrl(raw)
      if (!url) continue
      if (seen.has(url)) continue
      seen.set(url, source)
      ordered.push({ url, source })
    }
  }

  visit(input.nip65, 'nip65')
  visit(input.nip05, 'nip05')
  visit(input.defaults, 'default')

  return ordered
}

/**
 * Publish a signed event to all relays in parallel.
 * Calls `onResult` as each relay settles so the UI can animate per-relay status.
 */
export async function publishToRelays(
  event: NostrEvent,
  relays: string[],
  onResult: (result: PublishResult) => void,
): Promise<PublishResult[]> {
  if (!relays.length) return []
  const pool = new SimplePool()
  const results: PublishResult[] = []

  try {
    const publishes = pool.publish(relays, event)
    await Promise.all(
      publishes.map((promise, i) => {
        const url = relays[i]
        const withTimeout = Promise.race([
          promise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), PUBLISH_TIMEOUT_MS),
          ),
        ])
        return withTimeout.then(
          () => {
            const result: PublishResult = { url, ok: true }
            results.push(result)
            onResult(result)
          },
          (err: unknown) => {
            const result: PublishResult = {
              url,
              ok: false,
              error: err instanceof Error ? err.message : String(err),
            }
            results.push(result)
            onResult(result)
          },
        )
      }),
    )
    return results
  } finally {
    try { pool.close(relays) } catch { /* ignore */ }
  }
}
