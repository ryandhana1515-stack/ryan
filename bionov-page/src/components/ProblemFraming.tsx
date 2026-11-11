import { useId } from 'react'
import { NO_DECLINE } from '../data/product'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useReveal } from '../hooks/useReveal'
import Reveal from './Reveal'

const W = 640
const H = 300
const PAD = { top: 24, right: 28, bottom: 40, left: 44 }

const AGE_MIN = 10
const AGE_MAX = 70

const xFor = (age: number) =>
  PAD.left + ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * (W - PAD.left - PAD.right)
const yFor = (no: number) => PAD.top + (1 - no / 100) * (H - PAD.top - PAD.bottom)

/**
 * Animated line and area chart of nitric oxide production against age. The stroke
 * draws itself once when the section scrolls into view via a dash-offset transition,
 * and the fill fades in behind it.
 */
export default function ProblemFraming() {
  const gradientId = useId()
  const prefersReduced = usePrefersReducedMotion()
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.25 })

  const points = NO_DECLINE.curve.map((d) => `${xFor(d.age)},${yFor(d.no)}`).join(' ')
  const areaPoints = `${xFor(AGE_MIN)},${yFor(0)} ${points} ${xFor(AGE_MAX)},${yFor(0)}`
  const drawn = inView || prefersReduced

  return (
    <section className="section" id="problem">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">The problem</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="h2 mt-4 max-w-md">{NO_DECLINE.heading}</h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="body-lg mt-6 max-w-md">{NO_DECLINE.body}</p>
            </Reveal>
            <Reveal delay={270}>
              <ul className="mt-8 space-y-3">
                {NO_DECLINE.markers.map((marker) => (
                  <li key={marker.age} className="flex items-baseline gap-4">
                    <span className="w-14 shrink-0 font-display text-sm font-bold text-cyan-glow">
                      Age {marker.age}
                    </span>
                    <span className="text-sm text-white/60">{marker.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div ref={ref}>
            <Reveal delay={120}>
              <div className="card p-4 sm:p-6">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-sm font-bold tracking-tight">
                    Nitric oxide in the body
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                    NO production %
                  </p>
                </div>

                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="mt-4 h-auto w-full"
                  role="img"
                  aria-label="Line chart showing nitric oxide production falling from 100 percent at age 20 to about 15 percent at age 70"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00DCFF" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#00DCFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {[0, 25, 50, 75, 100].map((tick) => (
                    <g key={tick}>
                      <line
                        x1={PAD.left}
                        x2={W - PAD.right}
                        y1={yFor(tick)}
                        y2={yFor(tick)}
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="1"
                      />
                      <text
                        x={PAD.left - 10}
                        y={yFor(tick) + 4}
                        textAnchor="end"
                        className="fill-white/55"
                        fontSize="11"
                      >
                        {tick}
                      </text>
                    </g>
                  ))}

                  {NO_DECLINE.curve.map((d) => (
                    <text
                      key={d.age}
                      x={xFor(d.age)}
                      y={H - 14}
                      textAnchor="middle"
                      className="fill-white/55"
                      fontSize="11"
                    >
                      {d.age}
                    </text>
                  ))}

                  <polygon
                    points={areaPoints}
                    fill={`url(#${gradientId})`}
                    style={{
                      opacity: drawn ? 1 : 0,
                      transition: 'opacity 900ms ease 400ms',
                    }}
                  />

                  <polyline
                    points={points}
                    fill="none"
                    stroke="#00DCFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: drawn ? 0 : 1,
                      transition: prefersReduced
                        ? 'none'
                        : 'stroke-dashoffset 1600ms cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: 'drop-shadow(0 0 8px rgba(0,220,255,0.55))',
                    }}
                  />

                  {NO_DECLINE.markers.map((marker, i) => (
                    <circle
                      key={marker.age}
                      cx={xFor(marker.age)}
                      cy={yFor(NO_DECLINE.curve.find((d) => d.age === marker.age)?.no ?? 0)}
                      r="4.5"
                      fill="#0A1128"
                      stroke="#FF7A3D"
                      strokeWidth="2"
                      style={{
                        opacity: drawn ? 1 : 0,
                        transition: `opacity 400ms ease ${700 + i * 220}ms`,
                      }}
                    />
                  ))}
                </svg>

                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Age
                </p>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <p className="disclaimer mt-3">{NO_DECLINE.source}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
