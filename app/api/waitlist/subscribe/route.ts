import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
  }

  // TODO: integrate with your email/waitlist service
  console.log('Waitlist subscription:', email)

  return NextResponse.json({ success: true })
}
