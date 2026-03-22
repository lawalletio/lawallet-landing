'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Zap, ArrowRight, Mail, Globe } from 'lucide-react'
import { useScrollAnimation } from './hooks'

type Step = 'input' | 'checking' | 'choose' | 'submitting' | 'success'

export const WaitlistSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  const [contact, setContact] = React.useState('')
  const [step, setStep] = React.useState<Step>('input')
  const [error, setError] = React.useState('')
  const [hasNip05, setHasNip05] = React.useState(false)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError('')

    if (!contact.trim()) {
      setError('Enter an email, npub, or NIP-05 address')
      return
    }

    setStep('checking')

    try {
      const res = await fetch('/api/waitlist/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact }),
      })
      const data = await res.json()

      if (data.isNostr) {
        // npub or hex — subscribe directly via nostr
        await subscribe('nostr')
        return
      }

      if (data.hasNip05) {
        setHasNip05(true)
        setStep('choose')
        return
      }

      // No NIP-05 — subscribe as email directly
      await subscribe('email')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('input')
    }
  }

  const subscribe = async (method: 'email' | 'nostr' | 'both') => {
    setStep('submitting')
    try {
      const res = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact, method }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('success')
        setContact('')
      } else {
        setError(data.error || 'Subscription failed. Please try again.')
        setStep(hasNip05 ? 'choose' : 'input')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStep(hasNip05 ? 'choose' : 'input')
    }
  }

  const resetForm = () => {
    setStep('input')
    setError('')
    setContact('')
    setHasNip05(false)
  }

  if (step === 'success') {
    return (
      <section id="waitlist-section" className="py-20 sm:py-28">
        <div ref={ref} className="max-w-md mx-auto px-4 text-center">
          <div
            className={`rounded-2xl border border-lw-teal/20 bg-lw-teal/5 p-8 backdrop-blur-sm transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="w-14 h-14 bg-lw-teal rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re in!</h2>
            <p className="text-white/40 mb-6 text-sm">
              We&apos;ll notify you when LaWallet NWC is ready for your community.
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              size="sm"
              className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white bg-transparent"
            >
              Add another
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const isLoading = step === 'checking' || step === 'submitting'

  return (
    <section id="waitlist-section" className="py-20 sm:py-28">
      <div ref={ref} className="max-w-2xl mx-auto px-4 text-center">
        <Zap
          className={`h-8 w-8 text-lw-gold/40 mx-auto mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        />
        <h2
          className={`text-3xl sm:text-5xl font-bold text-white tracking-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Give your community
          <br />
          <span className="text-gradient-gold">Lightning addresses</span>
        </h2>
        <p
          className={`mt-4 text-white/30 max-w-md mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Get early access. Be the first to deploy Lightning + Nostr for your community or company.
        </p>
        <div
          className={`mt-8 max-w-md mx-auto transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Input
                type="text"
                placeholder="email, npub or NIP-05..."
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value)
                  if (step === 'choose') {
                    setStep('input')
                    setHasNip05(false)
                  }
                }}
                disabled={isLoading}
                className={`h-14 pl-5 pr-32 rounded-full bg-white/[0.04] border-white/[0.08] focus:ring-2 focus:ring-lw-gold/30 focus:border-lw-gold/30 text-white placeholder:text-white/20 font-mono text-sm transition-all duration-300 ${
                  error ? 'border-lw-coral/40 focus:ring-lw-coral/30' : ''
                } ${isLoading ? 'opacity-50' : ''}`}
                aria-label="Email, npub or NIP-05 for waitlist"
              />
              {step !== 'choose' && (
                <Button
                  type="submit"
                  disabled={isLoading || !contact}
                  className="absolute top-1.5 right-1.5 h-11 rounded-full px-6 bg-lw-gold hover:bg-lw-gold/90 text-black font-semibold transition-all duration-300 shadow-md shadow-lw-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-black border-t-transparent" />
                      <span>{step === 'checking' ? 'Checking' : 'Joining'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      Join <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* NIP-05 detected — show notification choice */}
          {step === 'choose' && (
            <div className="mt-4 animate-fade-in">
              <p className="text-white/40 text-xs font-mono mb-3">
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
          )}

          {error && (
            <p className="mt-3 text-lw-coral text-xs font-mono animate-fade-in">{error}</p>
          )}
        </div>
      </div>
    </section>
  )
}
