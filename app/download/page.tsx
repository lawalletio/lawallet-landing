import type { Metadata } from 'next'
import { Download as DownloadIcon } from 'lucide-react'
import { Footer } from '@/components/landing'

export const metadata: Metadata = {
  title: 'Download — LaWallet',
  description:
    'Download the LaWallet Android apps: POS, Card Manager and Card Installer. Latest APK releases straight from GitHub.',
}

const apps = [
  {
    name: 'POS',
    icon: '/apps/pos.png',
    description: 'Point of sale terminal. Charge in sats, print receipts, settle over Lightning.',
    href: 'https://github.com/lawalletio/flutter-pos/releases/latest',
  },
  {
    name: 'Card Manager',
    icon: '/apps/card-manager.png',
    description: 'Manage NFC cards: print, name, top up and revoke them from your phone.',
    href: 'https://github.com/lawalletio/card-manager/releases/latest',
  },
  {
    name: 'Card Installer',
    icon: '/apps/card-installer.png',
    description: 'Write LaWallet credentials onto blank NTAG424 cards over NFC.',
    href: 'https://github.com/lawalletio/card-installer/releases/latest',
  },
]

export default function DownloadPage() {
  return (
    <div className="relative min-h-[100dvh] w-full bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" aria-label="LaWallet home">
            <img src="/logos/lawallet.svg" alt="LaWallet" className="h-6 w-auto opacity-90" />
          </a>
          <a
            href="/"
            className="text-sm text-white/50 hover:text-lw-gold transition-colors duration-300"
          >
            ← Back to home
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Download</h1>
        <p className="mt-3 text-white/60 leading-relaxed">
          Android APKs for the LaWallet apps. Every link points at the latest release on GitHub —
          grab the <span className="font-mono text-white/80">.apk</span> asset from the release page.
        </p>

        <div className="mt-10 grid gap-4">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-lw-gold/40 hover:bg-white/[0.04] transition-colors duration-300"
            >
              <img
                src={app.icon}
                alt=""
                className="h-14 w-14 rounded-xl object-contain shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-semibold">{app.name}</h2>
                <p className="mt-1 text-sm text-white/50 leading-relaxed">{app.description}</p>
              </div>
              <DownloadIcon className="ml-auto h-5 w-5 shrink-0 text-white/30 group-hover:text-lw-gold transition-colors duration-300" />
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs text-white/30 font-mono">
          Sideloading an APK requires enabling installs from unknown sources on your device.
        </p>
      </main>

      <Footer />
    </div>
  )
}
