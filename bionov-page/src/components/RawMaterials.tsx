import { RAW_MATERIALS } from '../data/product'
import Reveal from './Reveal'
import { IconCheck } from './icons'

/**
 * Radial arrangement from the source deck, rebuilt as four clean cards orbiting a
 * centre badge with connecting hairlines. Falls back to a plain stack on mobile.
 */
export default function RawMaterials() {
  return (
    <section className="section border-t border-white/[0.06] bg-navy-900/40">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Premium raw materials</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">A masterpiece from top-notch science</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              Four whole foods, fermented rather than extracted, so the actives arrive intact.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-14">
          {/* Connecting lines, desktop only. */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            aria-hidden="true"
          >
            <div className="absolute left-1/2 top-1/2 h-px w-[46%] -translate-x-full -translate-y-1/2 bg-gradient-to-l from-cyan-glow/35 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-px w-[46%] -translate-y-1/2 bg-gradient-to-r from-cyan-glow/35 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[42%] w-px -translate-x-1/2 -translate-y-full bg-gradient-to-t from-cyan-glow/35 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[42%] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-glow/35 to-transparent" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8">
            <div className="space-y-5">
              {RAW_MATERIALS.slice(0, 2).map((material, i) => (
                <MaterialCard key={material.name} material={material} delay={i * 110} />
              ))}
            </div>

            <Reveal delay={140} className="order-first lg:order-none">
              <div className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-full border border-cyan-glow/35 bg-[radial-gradient(circle_at_50%_40%,rgba(0,220,255,0.20),rgba(10,17,40,0.9))] text-center shadow-glow-cyan sm:h-48 sm:w-48">
                <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  BIO <span className="text-gradient-cyan">N:OV</span>
                </span>
                <span className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Fermented core
                </span>
              </div>
            </Reveal>

            <div className="space-y-5">
              {RAW_MATERIALS.slice(2).map((material, i) => (
                <MaterialCard key={material.name} material={material} delay={220 + i * 110} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MaterialCard({
  material,
  delay,
}: {
  material: (typeof RAW_MATERIALS)[number]
  delay: number
}) {
  return (
    <Reveal delay={delay}>
      <div className="card h-full p-6 transition-colors duration-300 hover:border-cyan-glow/30">
        <h3 className="font-display text-lg font-bold tracking-tight">{material.name}</h3>
        <ul className="mt-4 space-y-2.5">
          {material.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow" strokeWidth={2.2} />
              <span className="text-sm leading-relaxed text-white/60">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}
