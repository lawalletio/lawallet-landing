'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Check, Zap, Mail, Globe } from 'lucide-react'

type Status = 'idle' | 'checking' | 'valid-email' | 'valid-nip05' | 'valid-npub' | 'submitting' | 'submitted'

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

  // Reset on open
  React.useEffect(() => {
    if (open) resetState()
  }, [open])

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const isValidNpub = (v: string) => /^npub1[a-z0-9]{58}$/.test(v)

  const handleChange = async (value: string) => {
    setContact(value)
    setStatus('idle')

    const trimmed = value.trim()

    // Check npub instantly (no debounce needed)
    if (isValidNpub(trimmed)) {
      setStatus('valid-npub')
      return
    }

    if (!isValidEmail(trimmed)) return

    const id = ++checkRef.current

    // Debounce 400ms of inactivity
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
      const colors = ['#F5A623', '#FFD580', '#26A69A', '#8B5CF6', '#ffffff']
      const defaults = { zIndex: 99999, colors }
      confetti({ ...defaults, particleCount: 120, spread: 120, origin: { x: 0.3, y: 0.5 } })
      confetti({ ...defaults, particleCount: 120, spread: 120, origin: { x: 0.7, y: 0.5 } })
    })
  }

  const isLoading = status === 'checking' || status === 'submitting'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-lw-dark/95 backdrop-blur-xl border-white/[0.08] text-white max-w-md rounded-2xl overflow-hidden p-0">
        {/* Top gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-lw-gold via-nwc-purple to-lw-teal" />

        <div className="relative px-8 pt-8 pb-8">
          {/* Background glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-nwc-purple/10 blur-[80px] rounded-full pointer-events-none" />

          <DialogHeader className="text-center sm:text-center relative">
            {/* Nostr ostrich */}
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-nwc-purple/20 to-nwc-purple/5 border border-nwc-purple/20 flex items-center justify-center">
              <img src="/logos/lawallet.svg" alt="LaWallet" className="w-10 h-10" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white text-center tracking-tight">
              Be the first to try it out
            </DialogTitle>
            <DialogDescription className="text-white/40 text-center mt-2 text-sm leading-relaxed">
              We&apos;re building something special. Drop your email or Nostr address and get early access.
            </DialogDescription>
          </DialogHeader>

          {status === 'submitted' ? (
            <div className="text-center py-6 mt-4">
              <div className="w-14 h-14 rounded-full bg-lw-teal/10 border border-lw-teal/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-7 w-7 text-lw-teal" />
              </div>
              <p className="text-base font-semibold text-white mb-1">You&apos;re in!</p>
              <p className="text-sm text-white/30">We&apos;ll reach out soon.</p>
            </div>
          ) : status === 'submitting' ? (
            <div className="flex flex-col items-center gap-3 py-10 mt-4 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-lw-gold/30 border-t-lw-gold" />
              <p className="text-white/40 text-xs font-mono">Sending notification...</p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Email, npub or NIP-05..."
                  value={contact}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={isLoading}
                  className="h-13 pl-4 pr-4 rounded-xl bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/20 font-mono text-sm focus:ring-2 focus:ring-nwc-purple/30 focus:border-nwc-purple/30 transition-all duration-300"
                />
                {status === 'checking' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-nwc-purple" />
                  </div>
                )}
              </div>

              {status === 'valid-npub' ? (
                <Button
                  onClick={() => subscribe('nostr')}
                  className="w-full h-12 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-nwc-purple/80 hover:bg-nwc-purple/90 text-white shadow-nwc-purple/10 animate-fade-in"
                >
                  <Globe className="h-4 w-4 mr-1.5" />
                  Notify on Nostr
                </Button>
              ) : status === 'valid-nip05' ? (
                <div className="animate-fade-in">
                  <p className="text-white/40 text-xs font-mono mb-3 text-center">
                    NIP-05 verified — how would you like to be notified?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => subscribe('email')}
                      className="flex-1 h-11 rounded-xl font-semibold text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] transition-all duration-300"
                    >
                      <Mail className="h-4 w-4 mr-1.5" />
                      Notify via email
                    </Button>
                    <Button
                      onClick={() => subscribe('nostr')}
                      className="flex-1 h-11 rounded-xl font-semibold text-sm bg-nwc-purple/20 hover:bg-nwc-purple/30 text-white border border-nwc-purple/20 transition-all duration-300"
                    >
                      <Globe className="h-4 w-4 mr-1.5" />
                      Notify via Nostr
                    </Button>
                  </div>
                  <Button
                    onClick={() => subscribe('both')}
                    className="w-full mt-2 h-11 rounded-xl font-semibold text-sm bg-lw-gold hover:bg-lw-gold/90 text-black shadow-md shadow-lw-gold/20 transition-all duration-300"
                  >
                    <Zap className="h-4 w-4 mr-1.5" />
                    Notify via Both
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => subscribe('email')}
                  disabled={status !== 'valid-email'}
                  className="w-full h-12 rounded-xl font-semibold transition-all duration-300 shadow-lg bg-gradient-to-r from-lw-gold to-lw-gold/90 text-black shadow-lw-gold/10 hover:shadow-lw-gold/20 hover:from-lw-gold hover:to-lw-gold disabled:from-white/[0.06] disabled:to-white/[0.06] disabled:text-white/20 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Count me in
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              )}
              <p className="text-center text-[11px] text-white/15 font-mono">
                Nostr-friendly. We respect your sovereignty.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
