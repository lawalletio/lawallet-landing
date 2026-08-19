import type { Metadata } from 'next'
import { LegalPage, Section, H3, P, UL, LI, A, Strong } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Terms & Privacy — LaWallet',
  description:
    'Terms of Service and Privacy Policy for LaWallet websites and services, including the LaWallet gateway and related integrations.',
}

export default function LegalPageRoute() {
  return (
    <LegalPage title="Terms & Privacy" updated="June 17, 2026">
      <Section id="terms" title="Terms of Service">
      <P>
        These Terms of Service (the “Terms”) govern your access to and use of the LaWallet websites
        and services, including <Strong>lawallet.io</Strong>, <Strong>beta.lawallet.io</Strong>, the
        LaWallet gateway API, and any community or self-hosted LaWallet instances and integrations
        (together, the “Services”). By accessing or using the Services you agree to these Terms. If
        you do not agree, please do not use the Services.
      </P>

      <H3>1. About LaWallet</H3>
      <P>
        LaWallet is an open-source Lightning and Nostr infrastructure project. Its source code is
        published at <A href="https://github.com/lawalletio">github.com/lawalletio</A> under the
        licenses stated in each repository. These Terms cover the hosted websites and services we
        operate; your use of the source code is governed by the applicable open-source license.
      </P>

      <H3>2. Non-custodial service</H3>
      <P>
        LaWallet is non-custodial. We do not take custody of your funds and we do not hold, request,
        or have access to your private keys or recovery phrases. Bitcoin Lightning payments settle
        directly between the payer and the recipient&apos;s wallet or Lightning Address. You are
        solely responsible for safeguarding your keys, devices, and wallet, and for any transactions
        you make.
      </P>

      <H3>3. Beta and availability</H3>
      <P>
        The Services are under active development and are provided on an “as is” and “as available”
        basis. They may be incomplete, change without notice, contain errors, or be unavailable. We
        do not guarantee uninterrupted operation, and we may modify, suspend, or discontinue any
        part of the Services at any time.
      </P>

      <H3>4. Acceptable use</H3>
      <UL>
        <LI>Do not use the Services for unlawful purposes or in violation of applicable laws.</LI>
        <LI>Do not attempt to disrupt, overload, or gain unauthorized access to the Services.</LI>
        <LI>
          Do not use the Services to infringe the rights of others or to transmit malicious code.
        </LI>
      </UL>

      <H3>5. Integrations and your configuration</H3>
      <P>
        When LaWallet is used through an integration (for example, a WooCommerce plugin or other
        third-party software), that integration may route Lightning Address and NIP-05 discovery, or
        request invoices, against the LaWallet gateway endpoint that you configure. You are
        responsible for the endpoints, wallets, and settings you choose, and for verifying that they
        meet your needs before going live.
      </P>

      <H3>6. Third-party services</H3>
      <P>
        The Services interoperate with independent third-party networks and providers, including the
        Bitcoin Lightning Network, Nostr relays, and exchange-rate providers such as{' '}
        <A href="https://yadio.io">Yadio</A>. These third parties operate under their own terms and
        policies, and we are not responsible for their availability, accuracy, or conduct.
      </P>

      <H3>7. No warranty</H3>
      <P>
        To the maximum extent permitted by law, the Services are provided without warranties of any
        kind, whether express or implied, including warranties of merchantability, fitness for a
        particular purpose, and non-infringement.
      </P>

      <H3>8. Limitation of liability</H3>
      <P>
        To the maximum extent permitted by law, LaWallet and its contributors shall not be liable for
        any indirect, incidental, special, consequential, or exemplary damages, or for any loss of
        funds, profits, data, or goodwill, arising out of or related to your use of the Services.
      </P>

      <H3>9. Changes to these Terms</H3>
      <P>
        We may update these Terms from time to time. When we do, we will revise the “Last updated”
        date above. Your continued use of the Services after changes take effect constitutes
        acceptance of the updated Terms.
      </P>

      <H3>10. Contact</H3>
      <P>
        Questions about these Terms can be raised via{' '}
        <A href="https://github.com/lawalletio">github.com/lawalletio</A> or{' '}
        <A href="https://x.com/lawalletok">@lawalletok</A> on X.
      </P>
    
      </Section>

      <Section id="privacy" title="Privacy Policy">
      <P>
        This Privacy Policy explains how LaWallet handles information in connection with the LaWallet
        websites and services, including <Strong>lawallet.io</Strong>,{' '}
        <Strong>beta.lawallet.io</Strong>, and the LaWallet gateway API (together, the “Services”).
        LaWallet is an open-source, non-custodial project, and we aim to collect as little personal
        data as possible.
      </P>

      <H3>1. We never hold your keys or funds</H3>
      <P>
        LaWallet is non-custodial. We do not collect, store, or have access to your private keys,
        recovery phrases, or funds. Bitcoin Lightning payments settle directly between the payer and
        the recipient&apos;s wallet.
      </P>

      <H3>2. Information we collect</H3>
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

      <H3>3. How we use information</H3>
      <UL>
        <LI>To operate, maintain, and improve the Services.</LI>
        <LI>To respond to waitlist sign-ups and send you the information you requested.</LI>
        <LI>To protect the security and integrity of the Services.</LI>
      </UL>

      <H3>4. Third-party services</H3>
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

      <H3>5. Cookies</H3>
      <P>
        Our analytics tools may set cookies or similar technologies. You can block or delete cookies
        through your browser settings; doing so will not prevent you from using the core Services.
      </P>

      <H3>6. Data retention</H3>
      <P>
        We retain waitlist contact information until you ask us to delete it or until it is no longer
        needed for its purpose. Server logs and analytics data are retained for a limited period in
        line with our providers&apos; defaults.
      </P>

      <H3>7. Your choices</H3>
      <P>
        You can ask us to access or delete the waitlist contact information you provided by contacting
        us through the channels below. Because LaWallet is non-custodial, we cannot access or alter
        any on-chain, Lightning, or Nostr data, which lives on public networks outside our control.
      </P>

      <H3>8. Children</H3>
      <P>The Services are not directed to children, and we do not knowingly collect data from them.</P>

      <H3>9. Changes to this Policy</H3>
      <P>
        We may update this Privacy Policy from time to time. When we do, we will revise the “Last
        updated” date above.
      </P>

      <H3>10. Contact</H3>
      <P>
        For privacy questions or requests, reach us via{' '}
        <A href="https://github.com/lawalletio">github.com/lawalletio</A> or{' '}
        <A href="https://x.com/lawalletok">@lawalletok</A> on X.
      </P>
    
      </Section>
    </LegalPage>
  )
}
