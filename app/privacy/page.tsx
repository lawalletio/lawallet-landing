import type { Metadata } from 'next'
import { LegalPage, H2, P, UL, LI, A, Strong } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy — LaWallet',
  description:
    'How LaWallet handles data across its websites and services. LaWallet is non-custodial and collects as little personal data as possible.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 17, 2026">
      <P>
        This Privacy Policy explains how LaWallet handles information in connection with the LaWallet
        websites and services, including <Strong>lawallet.io</Strong>,{' '}
        <Strong>beta.lawallet.io</Strong>, and the LaWallet gateway API (together, the “Services”).
        LaWallet is an open-source, non-custodial project, and we aim to collect as little personal
        data as possible.
      </P>

      <H2>1. We never hold your keys or funds</H2>
      <P>
        LaWallet is non-custodial. We do not collect, store, or have access to your private keys,
        recovery phrases, or funds. Bitcoin Lightning payments settle directly between the payer and
        the recipient&apos;s wallet.
      </P>

      <H2>2. Information we collect</H2>
      <UL>
        <LI>
          <Strong>Waitlist sign-ups.</Strong> If you join our waitlist, we collect the contact you
          provide — an email address, a Nostr public key (npub), or a NIP-05 identifier — so we can
          notify you about LaWallet. This is processed through{' '}
          <A href="https://tally.so">Tally</A> (form handling) and{' '}
          <A href="https://resend.com">Resend</A> (welcome email).
        </LI>
        <LI>
          <Strong>Technical data.</Strong> Like most websites, our hosting provider records standard
          server logs (such as IP address, browser type, and timestamps) for security, reliability,
          and abuse prevention.
        </LI>
        <LI>
          <Strong>Analytics.</Strong> We use Google Tag Manager and Google Analytics to understand
          aggregate, anonymized usage of our website.
        </LI>
        <LI>
          <Strong>Public network data.</Strong> Lightning and Nostr are public protocols. Data such
          as Lightning Addresses, invoices, and Nostr events is inherently public and is not private
          information held by us.
        </LI>
      </UL>

      <H2>3. How we use information</H2>
      <UL>
        <LI>To operate, maintain, and improve the Services.</LI>
        <LI>To respond to waitlist sign-ups and send you the information you requested.</LI>
        <LI>To protect the security and integrity of the Services.</LI>
      </UL>

      <H2>4. Third-party services</H2>
      <P>
        We rely on the following third parties, each of which processes data under its own privacy
        policy:
      </P>
      <UL>
        <LI>
          <A href="https://vercel.com/legal/privacy-policy">Vercel</A> — website hosting and logs.
        </LI>
        <LI>
          <A href="https://policies.google.com/privacy">Google</A> — Tag Manager and Analytics.
        </LI>
        <LI>
          <A href="https://tally.so/help/privacy-policy">Tally</A> — waitlist form submissions.
        </LI>
        <LI>
          <A href="https://resend.com/legal/privacy-policy">Resend</A> — transactional email.
        </LI>
        <LI>
          <A href="https://yadio.io">Yadio</A> — Bitcoin exchange-rate data used by some
          integrations (only a currency code is sent; no personal data).
        </LI>
        <LI>
          The Bitcoin Lightning Network and Nostr relays, which are operated independently by third
          parties.
        </LI>
      </UL>

      <H2>5. Cookies</H2>
      <P>
        Our analytics tools may set cookies or similar technologies. You can block or delete cookies
        through your browser settings; doing so will not prevent you from using the core Services.
      </P>

      <H2>6. Data retention</H2>
      <P>
        We retain waitlist contact information until you ask us to delete it or until it is no longer
        needed for its purpose. Server logs and analytics data are retained for a limited period in
        line with our providers&apos; defaults.
      </P>

      <H2>7. Your choices</H2>
      <P>
        You can ask us to access or delete the waitlist contact information you provided by contacting
        us through the channels below. Because LaWallet is non-custodial, we cannot access or alter
        any on-chain, Lightning, or Nostr data, which lives on public networks outside our control.
      </P>

      <H2>8. Children</H2>
      <P>The Services are not directed to children, and we do not knowingly collect data from them.</P>

      <H2>9. Changes to this Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. When we do, we will revise the “Last
        updated” date above.
      </P>

      <H2>10. Contact</H2>
      <P>
        For privacy questions or requests, reach us via{' '}
        <A href="https://github.com/lawalletio">github.com/lawalletio</A> or{' '}
        <A href="https://x.com/lawalletok">@lawalletok</A> on X.
      </P>
    </LegalPage>
  )
}
