import 'dotenv/config'
import { sendWaitlistWelcomeEmail } from '../lib/resend'

const TO_EMAIL = process.argv[2] || 'webmaster@masize.com'

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY is not set in .env')
    process.exit(1)
  }

  console.log(`Sending test email to ${TO_EMAIL}...`)

  const success = await sendWaitlistWelcomeEmail(TO_EMAIL)

  if (!success) {
    console.error('Failed to send email.')
    process.exit(1)
  }

  console.log('Email sent successfully!')
}

main()
