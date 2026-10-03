import { FIVE_WAYS, LAB_DISCLAIMER } from '../data/product'
import { useReveal } from '../hooks/useReveal'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Reveal from './Reveal'

/**
 * Simple telomere diagram for the Aging block: a normal strand shortening against
 * one preserved by telomerase activation. Draws once on scroll into view.
 */
function TelomereDiagram() {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.4 })
  const prefersReduced = usePrefersReducedMotion()
  const shown = inView || prefersReduced

  const rows = [
    { label: 'Normal', width: 34, color: 'rgba(255,255,255,0.28)', delay: 0 },
    { label: 'With BIO N:OV', width: 88, color: '#00DCFF', delay: 260 },
  ]

  return (
    <div ref={ref} className="card mt-6 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
        Telomere length over time
      </p>
      <div className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-white/65">{row.label}</span>
              <span className="text-white/50">{row.width}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full"
                style={{
                  width: shown ? `${row.width}%` : '0%',
                  background: row.color,
                  boxShadow: row.color === '#00DCFF' ? '0 0 18px rgba(0,220,255,0.6)' : 'none',
                  transition: prefersReduced
                    ? 'none'
                    : `width 1100ms cubic-bezier(0.16, 1, 0.3, 1) ${row.delay}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-white/45">
        Cells stop dividing once telomeres reach a critical length. BIO N:OV activates telomerase
        through the NO it generates, slowing that shortening.
      </p>
    </div>
  )
}

export default function FiveWays() {
  return (
    <section className="section" id="benefits">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Proven results</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">Five ways it optimizes your body</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              Blood pressure, blood sugar, vigor, aging and skin. Each one measured, each one
              sourced.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 space-y-5">
          {FIVE_WAYS.map((way, i) => (
            <Reveal key={way.id} delay={i * 70}>
              <article className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-sm font-bold tracking-[0.1em] text-cyan-glow/70">
                      {way.index}
                    </span>
                    <h3 className="h3">{way.title}</h3>
                  </div>
                  <p className="mt-4 font-display text-lg font-medium leading-snug text-white/90">
                    {way.lead}
                  </p>
                  <p className="body mt-3">{way.body}</p>
                </div>

                <div>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {way.metrics.map((metric) => (
                      <li
                        key={metric.label}
                        className="rounded-xl border border-white/[0.08] bg-navy-900/50 px-5 py-4"
                      >
                        <p className="font-display text-2xl font-bold leading-none tracking-tight text-cyan-glow">
                          {metric.value}
                        </p>
                        <p className="mt-2 text-[12px] leading-snug text-white/50">
                          {metric.label}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {way.id === 'aging' && <TelomereDiagram />}

                  <p className="disclaimer mt-5">{way.source}</p>
                  {way.hasLabData && <p className="disclaimer mt-2 italic">{LAB_DISCLAIMER}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
