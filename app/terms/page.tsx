import type { Metadata } from 'next'
import { LegalPage, H2, P, UL, LI, A, Strong } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Terms of Service — LaWallet',
  description:
    'Terms of Service for LaWallet websites and services, including the LaWallet gateway and related integrations.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 17, 2026">
      <P>
        These Terms of Service (the “Terms”) govern your access to and use of the LaWallet websites
        and services, including <Strong>lawallet.io</Strong>, <Strong>beta.lawallet.io</Strong>, the
        LaWallet gateway API, and any community or self-hosted LaWallet instances and integrations
        (together, the “Services”). By accessing or using the Services you agree to these Terms. If
        you do not agree, please do not use the Services.
      </P>

      <H2>1. About LaWallet</H2>
      <P>
        LaWallet is an open-source Lightning and Nostr infrastructure project. Its source code is
        published at <A href="https://github.com/lawalletio">github.com/lawalletio</A> under the
        licenses stated in each repository. These Terms cover the hosted websites and services we
        operate; your use of the source code is governed by the applicable open-source license.
      </P>

      <H2>2. Non-custodial service</H2>
      <P>
        LaWallet is non-custodial. We do not take custody of your funds and we do not hold, request,
        or have access to your private keys or recovery phrases. Bitcoin Lightning payments settle
        directly between the payer and the recipient&apos;s wallet or Lightning Address. You are
        solely responsible for safeguarding your keys, devices, and wallet, and for any transactions
        you make.
      </P>

      <H2>3. Beta and availability</H2>
      <P>
        The Services are under active development and are provided on an “as is” and “as available”
        basis. They may be incomplete, change without notice, contain errors, or be unavailable. We
        do not guarantee uninterrupted operation, and we may modify, suspend, or discontinue any
        part of the Services at any time.
      </P>

      <H2>4. Acceptable use</H2>
      <UL>
        <LI>Do not use the Services for unlawful purposes or in violation of applicable laws.</LI>
        <LI>Do not attempt to disrupt, overload, or gain unauthorized access to the Services.</LI>
        <LI>
          Do not use the Services to infringe the rights of others or to transmit malicious code.
        </LI>
      </UL>

      <H2>5. Integrations and your configuration</H2>
      <P>
        When LaWallet is used through an integration (for example, a WooCommerce plugin or other
        third-party software), that integration may route Lightning Address and NIP-05 discovery, or
        request invoices, against the LaWallet gateway endpoint that you configure. You are
        responsible for the endpoints, wallets, and settings you choose, and for verifying that they
        meet your needs before going live.
      </P>

      <H2>6. Third-party services</H2>
      <P>
        The Services interoperate with independent third-party networks and providers, including the
        Bitcoin Lightning Network, Nostr relays, and exchange-rate providers such as{' '}
        <A href="https://yadio.io">Yadio</A>. These third parties operate under their own terms and
        policies, and we are not responsible for their availability, accuracy, or conduct.
      </P>

      <H2>7. No warranty</H2>
      <P>
        To the maximum extent permitted by law, the Services are provided without warranties of any
        kind, whether express or implied, including warranties of merchantability, fitness for a
        particular purpose, and non-infringement.
      </P>

      <H2>8. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, LaWallet and its contributors shall not be liable for
        any indirect, incidental, special, consequential, or exemplary damages, or for any loss of
        funds, profits, data, or goodwill, arising out of or related to your use of the Services.
      </P>

      <H2>9. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. When we do, we will revise the “Last updated”
        date above. Your continued use of the Services after changes take effect constitutes
        acceptance of the updated Terms.
      </P>

      <H2>10. Contact</H2>
      <P>
        Questions about these Terms can be raised via{' '}
        <A href="https://github.com/lawalletio">github.com/lawalletio</A> or{' '}
        <A href="https://x.com/lawalletok">@lawalletok</A> on X.
      </P>
    </LegalPage>
  )
}
