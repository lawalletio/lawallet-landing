'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Check, Zap, Mail, Globe } from 'lucide-react'

type Status =
  | 'idle'
  | 'checking'
  | 'valid-email'
  | 'valid-nip05'
  | 'valid-npub'
  | 'submitting'
  | 'submitted'

export const DemoModal = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  demoType: 'admin' | 'wallet'
}) => {
  const [contact, setContact] = React.useState('')
  const [status, setStatus] = React.useState<Status>('idle')
  const checkRef = React.useRef(0)

  const resetState = () => {
    setContact('')
    setStatus('idle')
    checkRef.current++
  }

  const handleClose = (value: boolean) => {
    onOpenChange(value)
    if (!value) {
      setTimeout(resetState, 300)
    }
  }

  React.useEffect(() => {
    if (open) resetState()
  }, [open])

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const isValidNpub = (v: string) => /^npub1[a-z0-9]{58}$/.test(v)

  const handleChange = async (value: string) => {
    setContact(value)
    setStatus('idle')

    const trimmed = value.trim()

    if (isValidNpub(trimmed)) {
      setStatus('valid-npub')
      return
    }

    if (!isValidEmail(trimmed)) return

    const id = ++checkRef.current

    await new Promise(r => setTimeout(r, 400))
    if (checkRef.current !== id) return

    setStatus('checking')

    try {
      const res = await fetch('/api/waitlist/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: trimmed }),
      })
      if (checkRef.current !== id) return
      const data = await res.json()
      setStatus(data.hasNip05 ? 'valid-nip05' : 'valid-email')
    } catch {
      if (checkRef.current !== id) return
      setStatus('valid-email')
    }
  }

  const subscribe = async (method: 'email' | 'nostr' | 'both') => {
    setStatus('submitting')
    try {
      await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact, method, source: 'demo' }),
      })
    } catch {
      // silent fail
    }
    setStatus('submitted')
    import('canvas-confetti').then(({ default: confetti }) => {
      const colors = ['#0EA5E9', '#00836d', '#00a085', '#8B5CF6', '#ffffff']
      const defaults = { zIndex: 99999, colors }
      confetti({
        ...defaults,
        particleCount: 140,
        spread: 130,
        origin: { x: 0.3, y: 0.5 },
      })
      confetti({
        ...defaults,
        particleCount: 140,
        spread: 130,
        origin: { x: 0.7, y: 0.5 },
      })
    })
  }

  const isLoading = status === 'checking' || status === 'submitting'
  const isValid =
    status === 'valid-email' ||
    status === 'valid-nip05' ||
    status === 'valid-npub'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-lw-dark/90 backdrop-blur-2xl border-white/[0.08] text-white max-w-md rounded-3xl overflow-hidden p-0 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        {/* Full-width header band */}
        <div className="relative w-full overflow-hidden border-b border-white/[0.06]">
          {/* Background gradient and glows */}
          <div className="absolute inset-0 bg-gradient-to-b from-lw-dark via-lw-dark/95 to-lw-dark/80" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[140%] h-64 bg-lightning_blue/[0.22] blur-[120px] rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 w-72 h-48 bg-guita/[0.18] blur-[100px] rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 w-72 h-48 bg-nwc-purple/[0.12] blur-[100px] rounded-full" />

          {/* Faint grid pattern */}
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-50" />

          {/* Top animated accent line */}
          <div className="absolute top-0 inset-x-0 h-[2px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lightning_blue/70 to-transparent" />
            <div
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              style={{ animation: 'shimmer 3.5s ease-in-out infinite' }}
            />
          </div>

          {/* Centered logo + Early access */}
          <div className="relative flex flex-col items-center justify-center py-10 px-8">
            <img
              src="/logos/lawallet.svg"
              alt="LaWallet"
              className="h-12 w-auto mb-5 relative"
              style={{
                filter:
                  'drop-shadow(0 0 24px rgba(14,165,233,0.35)) drop-shadow(0 0 48px rgba(0,131,109,0.2))',
              }}
            />
            <div className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.22em] border border-lightning_blue/40 bg-lw-dark/80 text-lightning_blue/90 whitespace-nowrap backdrop-blur-sm">
              Early access
            </div>
          </div>
        </div>

        <div className="relative px-8 pt-7 pb-8">
          <DialogHeader className="!text-center sm:!text-center relative items-center">
            {status === 'submitting' || status === 'submitted' ? (
              <>
                <DialogTitle className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-[#0EA5E9] via-[#00a085] to-[#00836d] bg-clip-text text-transparent">
                    Be the first one
                  </span>{' '}
                  <span className="text-white">to try it.</span>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Confirmation of waitlist signup.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle className="text-2xl sm:text-[28px] font-bold tracking-tight leading-tight whitespace-nowrap">
                  <span className="bg-gradient-to-r from-[#0EA5E9] via-[#00a085] to-[#00836d] bg-clip-text text-transparent">
                    Free to try
                  </span>{' '}
                  <span className="text-white">it out.</span>
                </DialogTitle>
                <DialogDescription className="text-white/45 text-sm leading-relaxed mt-3 max-w-sm mx-auto">
                  E-mail or Nostr address
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {status === 'submitted' ? (
            <div className="text-center py-6 mt-6 animate-fade-in relative">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-guita/25 to-guita/5 border border-guita/40 flex items-center justify-center">
                  <Check className="h-8 w-8 text-guita" strokeWidth={2.5} />
                </div>
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl border border-guita/50"
                  style={{ animation: 'pulse-glow 1.8s ease-out infinite' }}
                />
              </div>
              <p className="text-lg font-semibold text-white">You&apos;re in</p>
              <p className="text-sm text-white/40 font-mono mt-1 tracking-wide">
                We&apos;ll be in touch soon
              </p>
            </div>
          ) : status === 'submitting' ? (
            <div className="flex flex-col items-center gap-4 py-10 mt-4 animate-fade-in">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-lightning_blue/15 border-t-lightning_blue" />
                <div
                  className="absolute inset-1.5 animate-spin rounded-full border-2 border-transparent border-r-guita"
                  style={{ animationDuration: '1.4s', animationDirection: 'reverse' }}
                />
              </div>
              <p className="text-white/45 text-[11px] font-mono tracking-[0.2em] uppercase">
                Broadcasting…
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-7 relative">
              {/* Input — centered, no glow */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Email, npub or NIP-05…"
                  value={contact}
                  onChange={e => handleChange(e.target.value)}
                  disabled={isLoading}
                  className="h-14 px-12 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 font-mono text-sm text-center focus:ring-0 focus:border-lightning_blue/50 focus:bg-white/[0.06] transition-colors duration-300"
                />
                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
                  {status === 'checking' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/15 border-t-lightning_blue" />
                  )}
                  {isValid && (
                    <div
                      className="w-6 h-6 rounded-full bg-guita/20 border border-guita/40 flex items-center justify-center animate-fade-in"
                      aria-label="Valid"
                    >
                      <Check className="w-3.5 h-3.5 text-guita" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              {status === 'valid-npub' ? (
                <Button
                  onClick={() => subscribe('nostr')}
                  className="w-full h-12 rounded-xl font-semibold transition-all duration-300 bg-nwc-purple hover:bg-nwc-purple/90 text-white shadow-lg shadow-nwc-purple/20 hover:shadow-nwc-purple/30 animate-fade-in"
                >
                  <Globe className="h-4 w-4 mr-1.5" />
                  Notify me on Nostr
                </Button>
              ) : status === 'valid-nip05' ? (
                <div className="animate-fade-in space-y-2">
                  <p className="text-white/45 text-[11px] font-mono mb-2 text-center tracking-wide">
                    NIP-05 verified · pick a channel
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => subscribe('email')}
                      className="h-11 rounded-xl font-semibold text-sm bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/[0.08] transition-all duration-300"
                    >
                      <Mail className="h-4 w-4 mr-1.5" />
                      Email
                    </Button>
                    <Button
                      onClick={() => subscribe('nostr')}
                      className="h-11 rounded-xl font-semibold text-sm bg-nwc-purple/20 hover:bg-nwc-purple/30 text-white border border-nwc-purple/30 transition-all duration-300"
                    >
                      <Globe className="h-4 w-4 mr-1.5" />
                      Nostr
                    </Button>
                  </div>
                  <Button
                    onClick={() => subscribe('both')}
                    className="group relative w-full h-12 rounded-xl font-semibold text-sm bg-lw-gold hover:bg-lw-gold text-black shadow-lg shadow-lw-gold/25 hover:shadow-lw-gold/40 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 inline-flex items-center">
                      <Zap className="h-4 w-4 mr-1.5 fill-current" />
                      Notify via both
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => subscribe('email')}
                  disabled={status !== 'valid-email'}
                  className="group relative w-full h-12 rounded-xl font-semibold transition-all duration-300 bg-lw-gold text-black shadow-lg shadow-lw-gold/20 hover:shadow-lw-gold/35 disabled:bg-white/[0.06] disabled:text-white/25 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center">
                    Count me in
                    <Zap className="ml-2 h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent group-disabled:hidden"
                  />
                </Button>
              )}

              <p className="text-center text-[10px] text-white/25 font-mono uppercase tracking-[0.2em] pt-2">
                Open source forever · No spam
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
