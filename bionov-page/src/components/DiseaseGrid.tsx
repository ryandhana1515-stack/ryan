import { DISEASE_SYSTEMS } from '../data/product'
import Reveal from './Reveal'
import { ICONS } from './icons'

export default function DiseaseGrid() {
  return (
    <section className="section border-t border-white/[0.06] bg-navy-900/40">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Why it matters</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">
              <span className="text-gradient-cyan">99.9%</span> of human diseases are NO-related
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              Nitric oxide is the signalling molecule every system leans on. When it runs short,
              the shortfall shows up almost everywhere in the body at once.
            </p>
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DISEASE_SYSTEMS.map((system, i) => {
            const Icon = ICONS[system.id]
            return (
              <Reveal as="li" key={system.id} delay={i * 90}>
                <div className="card group h-full p-6 transition-colors duration-300 hover:border-cyan-glow/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-glow/20 bg-cyan-glow/[0.06] text-cyan-glow transition-colors duration-300 group-hover:bg-cyan-glow/[0.12]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
                    {system.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{system.conditions}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>

        <Reveal delay={200}>
          <p className="disclaimer mt-8">Source: Dr. Ferid Murad, Magical Nitric Oxide.</p>
        </Reveal>
      </div>
    </section>
  )
}
