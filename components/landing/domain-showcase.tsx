'use client'

import React from 'react'
import { Zap } from 'lucide-react'

const USERNAMES = [
  'tip',
  'bot',
  'friend',
  'pos',
  'vault',
  'gift',
  'paywall',
  'donate',
]

const DOMAINS = [
  'walletofsatoshi.com',
  'getalby.com',
  'lawallet.ar',
  'strike.me',
  'primal.net',
  'blink.sv',
  'stacker.news',
  'coinos.io',
  'ln.tips',
  'bitrefill.me',
]

const TICK_MS = 1900
const ANIM_MS = 460
// Spring with a gentle settle — smooth body, soft landing.
const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const SMOOTH = 'cubic-bezier(0.4, 0, 0.2, 1)'

interface RollerProps {
  items: string[]
  startDelay?: number
  className?: string
}

function Roller({ items, startDelay = 0, className = '' }: RollerProps) {
  // Monotonic step counter — wraps via snap-back to allow seamless cycling.
  const [step, setStep] = React.useState(0)
  const [snapping, setSnapping] = React.useState(false)
  // When growing to a wider word we snap width up instantly so the incoming
  // text isn't horizontally clipped during the slide.
  const [skipWidthTransition, setSkipWidthTransition] = React.useState(false)
  const prevWidthRef = React.useRef<number | undefined>(undefined)

  // Measure each item's pixel width so width animation is exact.
  // A small padding compensates for sub-pixel rounding and font kerning.
  const WIDTH_PADDING = 2
  const itemRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = React.useState<number[]>([])

  React.useLayoutEffect(() => {
    const measure = () => {
      const measured = itemRefs.current.map(el => {
        const w = el?.getBoundingClientRect().width ?? 0
        return Math.ceil(w) + WIDTH_PADDING
      })
      setWidths(measured)
    }
    measure()
    // Re-measure after webfonts load — fallback metrics can underestimate.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {})
    }
  }, [items])

  // Drive the step counter on an interval after the start delay.
  React.useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => setStep(s => s + 1), TICK_MS)
    }, startDelay)
    return () => {
      clearTimeout(startTimeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [startDelay])

  // When we land on the duplicate first item (step === items.length), snap the
  // translate back to 0 with no transition, so the next tick animates forward.
  React.useEffect(() => {
    if (step !== items.length) return
    const t = setTimeout(() => {
      setSnapping(true)
      setStep(0)
      // Re-enable transitions on the next paint.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSnapping(false))
      })
    }, ANIM_MS + 40)
    return () => clearTimeout(t)
  }, [step, items.length])

  const visibleIndex = step === items.length ? 0 : step % items.length
  const targetWidth = widths[visibleIndex]

  // If the new width is wider than the previous, snap up instantly so the
  // incoming text has room. Shrinks transition smoothly with the slide.
  React.useLayoutEffect(() => {
    if (targetWidth === undefined) return
    const prev = prevWidthRef.current
    if (prev !== undefined && targetWidth > prev) {
      setSkipWidthTransition(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipWidthTransition(false))
      })
    }
    prevWidthRef.current = targetWidth
  }, [targetWidth])

  return (
    <span
      className={`relative inline-flex align-baseline overflow-hidden ${className}`}
      style={{
        width: targetWidth ? `${targetWidth}px` : 'auto',
        height: '1.25em',
        lineHeight: '1.25em',
        verticalAlign: 'baseline',
        transition:
          snapping || skipWidthTransition
            ? 'none'
            : `width ${ANIM_MS}ms ${SPRING}`,
      }}
    >
      {/* Hidden measurement layer — each item rendered with the inherited
          typography so getBoundingClientRect returns the true width. */}
      <span
        aria-hidden
        className="absolute top-0 left-0 invisible pointer-events-none"
        style={{ whiteSpace: 'nowrap' }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            ref={el => {
              itemRefs.current[i] = el
            }}
            className="absolute whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </span>

      {/* Sliding stack: items + first duplicated for a seamless wrap. */}
      <span
        className="flex flex-col"
        style={{
          transform: `translateY(${-step * 1.25}em)`,
          transition: snapping ? 'none' : `transform ${ANIM_MS}ms ${SPRING}`,
          willChange: 'transform',
        }}
      >
        {[...items, items[0]].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap shrink-0 flex items-center"
            style={{ height: '1.25em', lineHeight: '1.25em' }}
          >
            {item}
          </span>
        ))}
      </span>
    </span>
  )
}

export const DomainShowcase = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <div
      className={`mt-10 transition-all duration-1000 delay-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionTimingFunction: SMOOTH }}
    >
      <div className="relative inline-flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm shadow-lg shadow-black/20">
        {/* Soft inner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(14,165,233,0.07), transparent 70%)',
          }}
        />
        <div className="relative inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-7 py-3.5 sm:py-4">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-lightning_blue/60 shrink-0" />
          <span className="font-mono text-base sm:text-lg md:text-xl lg:text-2xl text-white/50 inline-flex items-baseline tracking-tight leading-none">
            <Roller items={USERNAMES} className="text-lw-gold font-semibold" />
            <span className="text-white/25 mx-0.5">@</span>
            <Roller
              items={DOMAINS}
              startDelay={ANIM_MS + 80}
              className="text-lw-teal font-medium"
            />
          </span>
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-lightning_blue/60 shrink-0" />
        </div>
      </div>
    </div>
  )
}
