const TALLY_FORM_ID = '68Nb5O'
const TALLY_EMAIL_FIELD_ID = 'a1f2d4cd-1031-4217-90bb-bfdd5094309b'
const TALLY_NIP05_FIELD_ID = '549f1a0a-b33f-4a81-902e-56894166f183'
const TALLY_NPUB_FIELD_ID = 'e30d1f8e-cbd6-4832-91d6-c4318668dd00'

async function submitToTally(responses: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(`https://api.tally.so/forms/${TALLY_FORM_ID}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionUuid: crypto.randomUUID(),
        respondentUuid: crypto.randomUUID(),
        responses,
        isCompleted: true,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) return true

    console.warn(`Tally submission returned ${res.status}: ${await res.text()}`)
    return false
  } catch (error) {
    console.warn('Tally submission failed:', error instanceof Error ? error.message : error)
    return false
  }
}

export async function submitEmailToTally(email: string): Promise<boolean> {
  return submitToTally({ [TALLY_EMAIL_FIELD_ID]: email })
}

export async function submitNip05ToTally(nip05: string): Promise<boolean> {
  return submitToTally({ [TALLY_NIP05_FIELD_ID]: nip05 })
}

export async function submitNpubToTally(npub: string): Promise<boolean> {
  return submitToTally({ [TALLY_NPUB_FIELD_ID]: npub })
}

export async function submitBothToTally(email: string, nip05: string): Promise<boolean> {
  return submitToTally({
    [TALLY_EMAIL_FIELD_ID]: email,
    [TALLY_NIP05_FIELD_ID]: nip05,
  })
}
