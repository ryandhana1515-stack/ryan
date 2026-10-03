import { VESSEL } from '../data/product'
import { useScrollProgress } from '../hooks/useScrollProgress'
import Reveal from './Reveal'
import VesselCanvas from './VesselCanvas'

/**
 * Full-bleed cinematic band. Same particle system as the hero, run larger and
 * slower, so the two sections read as one continuous visual system. The background
 * lags the foreground copy slightly on scroll for depth.
 */
export default function VesselSection() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>()
  const parallax = (progress - 0.5) * 70

  return (
    <section ref={ref} className="relative isolate overflow-hidden py-24 sm:py-32 lg:py-40">
      <div
        className="absolute inset-0 -z-20 scale-110"
        style={{ transform: `translate3d(0, ${parallax}px, 0) scale(1.1)` }}
        aria-hidden="true"
      >
        <VesselCanvas variant="vessel" className="h-full w-full" />
      </div>

      {/* Navy to transparent to navy so the copy stays legible over the flow. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0A1128_0%,rgba(10,17,40,0.55)_38%,rgba(10,17,40,0.7)_62%,#0A1128_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_20%_50%,rgba(10,17,40,0.9),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Blood flow</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="h2 mt-4">{VESSEL.heading}</h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="body-lg mt-6 max-w-xl">{VESSEL.body}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {VESSEL.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={300 + i * 110}>
              <div className="border-l-2 border-cyan-glow/70 pl-5">
                <p
                  className="font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-cyan-glow"
                  style={{ textShadow: '0 0 26px rgba(0,220,255,0.45)' }}
                >
                  {stat.value}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={620}>
          <p className="disclaimer mt-10 max-w-2xl">{VESSEL.source}</p>
        </Reveal>
      </div>
    </section>
  )
}
