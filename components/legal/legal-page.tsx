import type React from 'react'
import { Footer } from '@/components/landing'

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold text-white mt-12 mb-4">{children}</h2>
)

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-white/60 leading-relaxed mb-4">{children}</p>
)

export const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 text-white/60 mb-4">{children}</ul>
)

export const LI = ({ children }: { children: React.ReactNode }) => (
  <li className="leading-relaxed">{children}</li>
)

export const Strong = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-white/90 font-semibold">{children}</strong>
)

export const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-lw-gold underline underline-offset-4 hover:text-lw-gold/80 transition-colors duration-300"
  >
    {children}
  </a>
)

export const LegalPage = ({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) => (
  <div className="relative min-h-[100dvh] w-full bg-black text-white">
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" aria-label="LaWallet home">
          <img
            src="/logos/lawallet.svg"
            alt="LaWallet"
            className="h-6 w-auto opacity-90"
          />
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
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm text-white/40 font-mono">Last updated: {updated}</p>
      <div className="mt-10">{children}</div>
    </main>

    <Footer />
  </div>
)
