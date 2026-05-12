'use client'

import React from 'react'
import type { Event as NostrEvent } from 'nostr-tools/pure'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Zap, ArrowRight, Mail, Globe, X, Loader2, Search, Layers, Send } from 'lucide-react'
import { useScrollAnimation } from './hooks'
import {
  fetchNip65Relays,
  dedupeRelays,
  publishToRelays,
  type RelayWithSource,
  type PublishResult,
} from '@/lib/nostr-client'

type Step = 'input' | 'checking' | 'choose' | 'submitting' | 'publishing' | 'success'

type SubStepStatus = 'idle' | 'running' | 'done'

interface PublishingState {
  signing: SubStepStatus
  nip05Discovery: SubStepStatus
  nip65Discovery: SubStepStatus
  dedupe: SubStepStatus
  publishing: SubStepStatus
  nip05Count: number
  nip65Count: number
  uniqueCount: number
  relays: RelayWithSource[]
  results: Map<string, PublishResult>
  okCount: number
  totalSettled: number
}

const initialPublishingState: PublishingState = {
  signing: 'idle',
  nip05Discovery: 'idle',
  nip65Discovery: 'idle',
  dedupe: 'idle',
  publishing: 'idle',
  nip05Count: 0,
  nip65Count: 0,
  uniqueCount: 0,
  relays: [],
  results: new Map(),
  okCount: 0,
  totalSettled: 0,
}

export const WaitlistSection = () => {
  const { ref, isVisible } = useScrollAnimation()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [contact, setContact] = React.useState('')
  const [step, setStep] = React.useState<Step>('input')
  const [error, setError] = React.useState('')
  const [hasNip05, setHasNip05] = React.useState(false)
  const [pubState, setPubState] = React.useState<PublishingState>(initialPublishingState)

  const updatePub = React.useCallback((patch: Partial<PublishingState>) => {
    setPubState(prev => ({ ...prev, ...patch }))
  }, [])

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
        await subscribe('nostr')
        return
      }

      if (data.hasNip05) {
        setHasNip05(true)
        setStep('choose')
        return
      }

      await subscribe('email')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('input')
    }
  }

  const subscribe = async (method: 'email' | 'nostr' | 'both') => {
    setStep('submitting')
    setPubState(initialPublishingState)
    try {
      const res = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact, method }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Subscription failed. Please try again.')
        setStep(hasNip05 ? 'choose' : 'input')
        return
      }

      const isNostrFlow = data.type === 'nostr' || data.type === 'both'
      if (isNostrFlow && data.signedEvent && data.pubkey) {
        await runNostrPublishing({
          event: data.signedEvent,
          pubkey: data.pubkey,
          nip05Relays: Array.isArray(data.nip05Relays) ? data.nip05Relays : [],
          bootstrapRelays: Array.isArray(data.bootstrapRelays) ? data.bootstrapRelays : [],
        })
      }

      setStep('success')
      setContact('')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep(hasNip05 ? 'choose' : 'input')
    }
  }

  const runNostrPublishing = async ({
    event,
    pubkey,
    nip05Relays,
    bootstrapRelays,
  }: {
    event: NostrEvent
    pubkey: string
    nip05Relays: string[]
    bootstrapRelays: string[]
  }) => {
    setStep('publishing')
    setPubState({
      ...initialPublishingState,
      signing: 'done',
      nip05Discovery: 'running',
      nip65Discovery: 'running',
      nip05Count: nip05Relays.length,
    })

    // Resolve NIP-05 relays "instantly" (already have them) on a tiny delay so the user sees motion.
    const nip05Promise = (async () => {
      await new Promise(r => setTimeout(r, 250))
      updatePub({ nip05Discovery: 'done', nip05Count: nip05Relays.length })
      return nip05Relays
    })()

    const nip65Promise = (async () => {
      const relays = await fetchNip65Relays(pubkey, bootstrapRelays)
      updatePub({ nip65Discovery: 'done', nip65Count: relays.length })
      return relays
    })()

    const [nip05, nip65] = await Promise.all([nip05Promise, nip65Promise])

    updatePub({ dedupe: 'running' })
    await new Promise(r => setTimeout(r, 200))
    const merged = dedupeRelays({ nip65, nip05, defaults: bootstrapRelays })
    setPubState(prev => ({
      ...prev,
      dedupe: 'done',
      uniqueCount: merged.length,
      relays: merged,
      publishing: 'running',
      results: new Map(),
      okCount: 0,
      totalSettled: 0,
    }))

    if (!merged.length) {
      updatePub({ publishing: 'done' })
      return
    }

    await publishToRelays(
      event,
      merged.map(r => r.url),
      (result) => {
        setPubState(prev => {
          const results = new Map(prev.results)
          results.set(result.url, result)
          return {
            ...prev,
            results,
            okCount: prev.okCount + (result.ok ? 1 : 0),
            totalSettled: prev.totalSettled + 1,
          }
        })
      },
    )

    updatePub({ publishing: 'done' })
    // Brief pause so the user sees final state before transition
    await new Promise(r => setTimeout(r, 600))
  }

  React.useEffect(() => {
    if (step === 'success' && canvasRef.current) {
      const canvas = canvasRef.current
      const timer = setTimeout(() => {
        import('canvas-confetti').then(({ default: confettiModule }) => {
          const fire = confettiModule.create(canvas, { resize: true })
          fire({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F5A623', '#FFD580', '#26A69A', '#8B5CF6', '#ffffff'],
          })
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [step])

  const resetForm = () => {
    setStep('input')
    setError('')
    setContact('')
    setHasNip05(false)
    setPubState(initialPublishingState)
  }

  if (step === 'success') {
    return (
      <section id="waitlist-section" className="relative py-20 sm:py-28">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-50 h-full w-full"
        />
        <div ref={ref} className="relative z-10 max-w-md mx-auto px-4 text-center">
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

  const isLoading = step === 'checking' || step === 'submitting' || step === 'publishing'

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
                      <span>
                        {step === 'checking' ? 'Checking' : step === 'publishing' ? 'Broadcasting' : 'Joining'}
                      </span>
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

          {step === 'submitting' && (
            <div className="mt-4 flex flex-col items-center gap-3 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-lw-gold/30 border-t-lw-gold" />
              <p className="text-white/40 text-xs font-mono">Signing notification...</p>
            </div>
          )}

          {step === 'publishing' && (
            <PublishingProgress state={pubState} />
          )}

          {error && (
            <p className="mt-3 text-lw-coral text-xs font-mono animate-fade-in">{error}</p>
          )}
        </div>
      </div>
    </section>
  )
}

interface PublishingProgressProps {
  state: PublishingState
}

const PublishingProgress: React.FC<PublishingProgressProps> = ({ state }) => {
  const broadcastTotal = state.relays.length

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm animate-fade-in text-left">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-nwc-purple animate-pulse" />
        <p className="text-xs font-mono text-white/60 uppercase tracking-wider">
          Broadcasting via Nostr
        </p>
      </div>

      <div className="space-y-2.5">
        <StepRow
          icon={<Zap className="h-3.5 w-3.5" />}
          status={state.signing}
          label="Signed NIP-04 message"
          detail={state.signing === 'done' ? 'event signed by relay' : 'preparing'}
        />
        <div className="grid grid-cols-2 gap-2">
          <StepRow
            compact
            icon={<Search className="h-3.5 w-3.5" />}
            status={state.nip05Discovery}
            label="NIP-05 relays"
            detail={
              state.nip05Discovery === 'done'
                ? `${state.nip05Count} found`
                : 'looking up'
            }
          />
          <StepRow
            compact
            icon={<Globe className="h-3.5 w-3.5" />}
            status={state.nip65Discovery}
            label="NIP-65 list"
            detail={
              state.nip65Discovery === 'done'
                ? `${state.nip65Count} found`
                : 'querying relays'
            }
          />
        </div>
        <StepRow
          icon={<Layers className="h-3.5 w-3.5" />}
          status={state.dedupe}
          label="Deduplicating relays"
          detail={state.dedupe === 'done' ? `${state.uniqueCount} unique` : 'merging lists'}
        />
        <StepRow
          icon={<Send className="h-3.5 w-3.5" />}
          status={state.publishing}
          label="Publishing notification"
          detail={
            broadcastTotal === 0 && state.publishing !== 'idle'
              ? 'no relays available'
              : state.publishing === 'done'
                ? `delivered to ${state.okCount}/${broadcastTotal}`
                : `${state.totalSettled}/${broadcastTotal} settled`
          }
        />
      </div>

      {state.relays.length > 0 && state.publishing !== 'idle' && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-2xs font-mono text-white/30 uppercase tracking-wider mb-2">
            Relays
          </p>
          <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {state.relays.map(({ url, source }) => {
              const result = state.results.get(url)
              return (
                <li
                  key={url}
                  className="flex items-center justify-between gap-2 text-xs font-mono"
                >
                  <span className="flex items-center gap-2 truncate">
                    <RelayStatusDot result={result} />
                    <span className="text-white/70 truncate">
                      {url.replace(/^wss?:\/\//, '')}
                    </span>
                    <span
                      className={`text-2xs px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        source === 'nip65'
                          ? 'bg-nwc-purple/20 text-nwc-purple'
                          : source === 'nip05'
                            ? 'bg-lw-teal/20 text-lw-teal'
                            : 'bg-white/[0.06] text-white/40'
                      }`}
                    >
                      {source}
                    </span>
                  </span>
                  <span className="text-white/30 shrink-0">
                    {result
                      ? result.ok
                        ? 'ok'
                        : (result.error || 'failed').slice(0, 18)
                      : '...'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

interface StepRowProps {
  icon: React.ReactNode
  status: SubStepStatus
  label: string
  detail: string
  compact?: boolean
}

const StepRow: React.FC<StepRowProps> = ({ icon, status, label, detail, compact }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border transition-colors duration-300 ${
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
      } ${
        status === 'done'
          ? 'border-lw-teal/20 bg-lw-teal/5'
          : status === 'running'
            ? 'border-nwc-purple/30 bg-nwc-purple/5'
            : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          status === 'done'
            ? 'bg-lw-teal/20 text-lw-teal'
            : status === 'running'
              ? 'bg-nwc-purple/20 text-nwc-purple'
              : 'bg-white/[0.06] text-white/40'
        }`}
      >
        {status === 'running' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : status === 'done' ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          icon
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white/80 truncate">{label}</p>
        <p className="text-2xs font-mono text-white/40 truncate">{detail}</p>
      </div>
    </div>
  )
}

const RelayStatusDot: React.FC<{ result?: PublishResult }> = ({ result }) => {
  if (!result) {
    return <Loader2 className="h-3 w-3 animate-spin text-nwc-purple/70 shrink-0" />
  }
  if (result.ok) {
    return <Check className="h-3 w-3 text-lw-teal shrink-0" />
  }
  return <X className="h-3 w-3 text-lw-coral shrink-0" />
}
