const TALLY_FORM_ID = '68Nb5O'
const TALLY_EMAIL_FIELD_ID = '9875a247-6204-41e4-ba0a-1beb71c245a9'

/**
 * Submit an email to the Tally waitlist form.
 *
 * Tally does not have a public submission API. This uses their internal
 * endpoint. If it stops working, check the network requests on the Tally
 * form page and update the URL/payload format accordingly.
 */
export async function submitEmailToTally(email: string): Promise<boolean> {
  try {
    const res = await fetch(`https://tally.so/api/respond/${TALLY_FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: TALLY_FORM_ID,
        sessionUuid: crypto.randomUUID(),
        respondentUuid: crypto.randomUUID(),
        responses: {
          [TALLY_EMAIL_FIELD_ID]: {
            answer: email,
            type: 'INPUT_EMAIL',
          },
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
