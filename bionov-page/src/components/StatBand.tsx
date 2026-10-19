import { GLOBAL_STATS, GLOBAL_STATS_SOURCE } from '../data/product'
import { useCountUp } from '../hooks/useCountUp'
import { useReveal } from '../hooks/useReveal'
import Reveal from './Reveal'

type Stat = (typeof GLOBAL_STATS)[number]

function Counter({ stat, active }: { stat: Stat; active: boolean }) {
  const decimals = 'decimals' in stat ? stat.decimals : 0
  const value = useCountUp(stat.value, active, 1700, decimals)

  return (
    <div className="border-t border-white/10 pt-6">
      <p className="font-display text-[clamp(2.6rem,6vw,4.2rem)] font-bold leading-none tracking-[-0.03em] text-white">
        <span className="tabular-nums">{value}</span>
        <span className="text-gradient-cyan">{stat.suffix}</span>
      </p>
      <p className="mt-3 text-sm font-semibold text-white/85">{stat.label}</p>
      <p className="mt-1.5 text-sm text-white/45">{stat.detail}</p>
    </div>
  )
}

/** Three oversized counters that run once when the band scrolls into view. */
export default function StatBand() {
  const { ref, inView } = useReveal<HTMLDivElement>({ threshold: 0.3 })

  return (
    <section className="section">
      <div className="shell">
        <Reveal>
          <h2 className="h2 max-w-xl">The scale of the deficit</h2>
        </Reveal>

        <div ref={ref} className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {GLOBAL_STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 110}>
              <Counter stat={stat} active={inView} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="disclaimer mt-8">{GLOBAL_STATS_SOURCE}</p>
        </Reveal>
      </div>
    </section>
  )
}
