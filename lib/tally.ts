const TALLY_FORM_ID = '68Nb5O'
const TALLY_EMAIL_FIELD_ID = 'a1f2d4cd-1031-4217-90bb-bfdd5094309b'

export async function submitEmailToTally(email: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.tally.so/forms/${TALLY_FORM_ID}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionUuid: crypto.randomUUID(),
        respondentUuid: crypto.randomUUID(),
        responses: {
          [TALLY_EMAIL_FIELD_ID]: email,
        },
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
