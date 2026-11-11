import { useCallback, useEffect, useRef, useState } from 'react'
import boxImage from '../assets/box.webp'
import { HERO, PRODUCT_SPEC } from '../data/product'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Reveal from './Reveal'
import VesselCanvas from './VesselCanvas'
import { ICONS, IconArrow, IconStar } from './icons'

/** Small parallax tilt driven by pointer position over the product stage. */
function useTilt(disabled: boolean) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const frame = useRef(0)

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const rect = event.currentTarget.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => setTilt({ x: px, y: py }))
    },
    [disabled],
  )

  const reset = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return { tilt, onPointerMove, reset }
}

export default function Hero() {
  const prefersReduced = usePrefersReducedMotion()
  const { tilt, onPointerMove, reset } = useTilt(prefersReduced)

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-14 sm:pb-20 sm:pt-24 lg:pb-24 lg:pt-32">
      {/* Abstract vessel flow replaces the stock anatomy render from the source banner. */}
      <VesselCanvas variant="hero" className="absolute inset-0 -z-10 h-full w-full opacity-80" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-40" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_70%_25%,rgba(0,220,255,0.16),transparent_70%)] animate-drift"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-b from-transparent to-navy"
        aria-hidden="true"
      />

      <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* Product first on mobile, copy first on desktop. */}
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow">{HERO.eyebrow}</p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="h1 mt-5">
              {HERO.headlineLead}
              <br />
              <span className="text-gradient-cyan">{HERO.headlineAccent}</span>
              <br />
              {HERO.headlineTail}
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="body-lg mt-6 max-w-lg">{HERO.subhead}</p>
          </Reveal>

          <Reveal delay={270}>
            <ul className="mt-8 grid max-w-lg gap-x-6 gap-y-3 sm:grid-cols-2">
              {HERO.benefits.map((benefit) => {
                const Icon = ICONS[benefit.icon]
                return (
                  <li key={benefit.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-glow/25 bg-cyan-glow/[0.07] text-cyan-glow">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-sm text-white/80">{benefit.label}</span>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#pricing" className="btn-primary animate-pulse-glow">
                {HERO.cta}
                <IconArrow className="h-[18px] w-[18px]" />
              </a>
              <a href="#science" className="btn-ghost">
                See the science
              </a>
            </div>
          </Reveal>

          <Reveal delay={430}>
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
              <span
                role="img"
                aria-label="Rated 5 out of 5"
                className="flex items-center gap-1 text-ember"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className="h-[14px] w-[14px]" />
                ))}
              </span>
              <span>{HERO.socialProof}</span>
            </p>
          </Reveal>
        </div>

        {/* Product stage: single focal point, cyan rim-light, parallax tilt. */}
        <div
          className="order-1 lg:order-2"
          onPointerMove={onPointerMove}
          onPointerLeave={reset}
        >
          <div className="relative mx-auto flex max-w-[440px] items-center justify-center">
            <div
              className="absolute h-[300px] w-[300px] rounded-full bg-cyan-glow/20 blur-[90px] sm:h-[380px] sm:w-[380px]"
              aria-hidden="true"
            />
            <div
              className="absolute h-[220px] w-[220px] rounded-full bg-ember/15 blur-[80px] sm:h-[260px] sm:w-[260px]"
              style={{ transform: 'translate(28%, 26%)' }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-6 rounded-full border border-dashed border-cyan-glow/15 animate-spin-slow"
              aria-hidden="true"
            />

            <div
              className={`relative ${prefersReduced ? '' : 'animate-float'}`}
              style={{
                transform: prefersReduced
                  ? undefined
                  : `perspective(900px) rotateY(${tilt.x * 12}deg) rotateX(${-tilt.y * 10}deg)`,
                transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img
                src={boxImage}
                alt={`BIO N:OV box, ${PRODUCT_SPEC}`}
                width={427}
                height={540}
                fetchPriority="high"
                decoding="async"
                className="w-[184px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)] sm:w-[280px]"
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_0_60px_-20px_rgba(0,220,255,0.9)]"
                aria-hidden="true"
              />
            </div>

            <div className="absolute -bottom-2 right-0 sm:-right-2">
              <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full border border-cyan-glow/30 bg-navy-900/85 px-3 text-center backdrop-blur-md sm:h-[124px] sm:w-[124px]">
                <span className="font-display text-[11px] font-bold uppercase leading-tight tracking-wide text-cyan-glow sm:text-xs">
                  {HERO.badge.line1}
                </span>
                <span className="mt-1 text-[9px] uppercase leading-tight tracking-[0.14em] text-white/50 sm:text-[10px]">
                  {HERO.badge.line2}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
