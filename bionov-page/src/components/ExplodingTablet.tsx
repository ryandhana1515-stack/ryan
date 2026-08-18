import { useMemo } from 'react'
import { TABLET } from '../data/product'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Reveal from './Reveal'

const PARTICLE_COUNT = 28

type Particle = {
  angle: number
  distance: number
  size: number
  warm: boolean
  delay: number
}

/** Deterministic pseudo-random so the burst is identical on every render. */
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

/** Maps a value from one range onto 0 to 1. */
const range = (value: number, from: number, to: number) => clamp01((value - from) / (to - from))

/**
 * Scroll-scrubbed particle assembly. At progress 0 the particles sit in a radial
 * burst. Through 0.6 they converge on the centre, shrinking and fading. From 0.55
 * the tablet fades and scales up while the centre seed dot fades out.
 */
export default function ExplodingTablet() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>()
  const prefersReduced = usePrefersReducedMotion()

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (i / PARTICLE_COUNT) * Math.PI * 2 + seeded(i, 1) * 0.4,
        distance: 110 + seeded(i, 2) * 110,
        size: 4 + seeded(i, 3) * 7,
        warm: seeded(i, 4) > 0.7,
        delay: seeded(i, 5) * 0.18,
      })),
    [],
  )

  const converge = range(progress, 0, 0.6)
  const tabletIn = range(progress, 0.55, 1)
  const ringSpin = progress * 220

  return (
    <section ref={ref} className="section border-t border-white/[0.06] bg-navy-900/40">
      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">The formula</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4 max-w-md">{TABLET.heading}</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-6 max-w-md">{TABLET.body}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:max-w-md">
            {TABLET.chips.map((chip, i) => (
              <Reveal key={chip.label} delay={270 + i * 80}>
                <div className="card px-5 py-4">
                  <p className="font-display text-2xl font-bold leading-none tracking-tight text-cyan-glow">
                    {chip.value}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {chip.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center">
          <div
            className="absolute h-3/4 w-3/4 rounded-full bg-cyan-glow/10 blur-[80px]"
            aria-hidden="true"
          />

          {/* Energy-gathering ring: speeds up as the assembly completes. */}
          <div
            className="absolute h-[62%] w-[62%] rounded-full border border-dashed border-cyan-glow/25"
            style={{
              transform: prefersReduced ? undefined : `rotate(${ringSpin}deg)`,
              opacity: 0.3 + converge * 0.6,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute h-[82%] w-[82%] rounded-full border border-dashed border-white/[0.07]"
            style={{
              transform: prefersReduced ? undefined : `rotate(${-ringSpin * 0.6}deg)`,
            }}
            aria-hidden="true"
          />

          {particles.map((p, i) => {
            const t = clamp01((converge - p.delay) / (1 - p.delay))
            const eased = 1 - Math.pow(1 - t, 3)
            const distance = p.distance * (1 - eased)
            const x = Math.cos(p.angle) * distance
            const y = Math.sin(p.angle) * distance
            const scale = 1 - eased * 0.75
            const opacity = (1 - eased * 0.85) * (1 - tabletIn * 0.9)

            return (
              <span
                key={i}
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                  opacity,
                  background: p.warm ? '#FFA477' : '#7FEDFF',
                  boxShadow: p.warm
                    ? '0 0 14px 2px rgba(255,122,61,0.6)'
                    : '0 0 14px 2px rgba(0,220,255,0.6)',
                }}
              />
            )
          })}

          {/* Seed dot at the centre, handed off to the tablet. */}
          <span
            aria-hidden="true"
            className="absolute h-3 w-3 rounded-full bg-white"
            style={{
              opacity: (1 - tabletIn) * converge,
              boxShadow: '0 0 26px 8px rgba(0,220,255,0.75)',
            }}
          />

          <div
            className="relative"
            style={{
              opacity: tabletIn,
              transform: `scale(${0.6 + tabletIn * 0.4})`,
              filter: `drop-shadow(0 18px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 ${
                14 + tabletIn * 34
              }px rgba(0,220,255,${0.15 + tabletIn * 0.45}))`,
            }}
          >
            <TabletMark />
          </div>
        </div>
      </div>
    </section>
  )
}

/** The BIO N:OV tablet, drawn inline so there is no image request. */
function TabletMark() {
  return (
    <svg
      width="220"
      height="132"
      viewBox="0 0 220 132"
      className="h-auto w-[180px] sm:w-[220px]"
      role="img"
      aria-label="A single BIO N:OV tablet"
    >
      <defs>
        <linearGradient id="tabletBody" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#EAF6FB" />
          <stop offset="100%" stopColor="#B9CEDC" />
        </linearGradient>
        <linearGradient id="tabletSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="208" height="120" rx="60" fill="url(#tabletBody)" />
      <rect
        x="6"
        y="6"
        width="208"
        height="120"
        rx="60"
        fill="none"
        stroke="rgba(0,220,255,0.55)"
        strokeWidth="1.5"
      />
      <rect x="18" y="16" width="150" height="52" rx="26" fill="url(#tabletSheen)" />
      <path d="M110 22v88" stroke="rgba(10,17,40,0.14)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M62 50h16l10 30 10-30h16"
        fill="none"
        stroke="#1E6F92"
        strokeWidth="0"
        opacity="0"
      />
      <text
        x="62"
        y="76"
        textAnchor="middle"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontSize="30"
        fontWeight="700"
        fill="#16608A"
      >
        V
      </text>
      <text
        x="152"
        y="74"
        textAnchor="middle"
        fontFamily="'Space Grotesk', system-ui, sans-serif"
        fontSize="13"
        fontWeight="700"
        letterSpacing="1"
        fill="#7E97A8"
      >
        N:OV
      </text>
    </svg>
  )
}
