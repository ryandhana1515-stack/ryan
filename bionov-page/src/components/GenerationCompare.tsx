import { GENERATIONS } from '../data/product'
import Reveal from './Reveal'
import { IconCheck, IconCross } from './icons'

export default function GenerationCompare() {
  return (
    <section className="section border-t border-white/[0.06]">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Tech roadmap</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">Three generations of NO supplements</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              The first two generations asked your body to do the conversion work. The third does
              it for you, through microbial fermentation.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {GENERATIONS.map((gen, i) => (
            <Reveal key={gen.gen} delay={i * 110} className="h-full">
              <article
                className={`flex h-full flex-col rounded-2xl border p-7 transition-colors duration-300 ${
                  gen.highlight
                    ? 'border-cyan-glow/45 bg-[linear-gradient(160deg,rgba(0,220,255,0.10),rgba(10,17,40,0.4))] shadow-glow-cyan lg:-mt-4 lg:mb-4'
                    : 'border-white/8 bg-white/[0.02] opacity-70'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                    gen.highlight ? 'text-cyan-glow' : 'text-white/55'
                  }`}
                >
                  {gen.gen}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold leading-tight tracking-tight">
                  {gen.name}
                </h3>

                <ul className="mt-6 space-y-3.5">
                  {gen.points.map((point) => (
                    <li key={point.text} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          point.ok
                            ? 'bg-cyan-glow/15 text-cyan-glow'
                            : 'bg-white/[0.06] text-white/55'
                        }`}
                      >
                        {point.ok ? (
                          <IconCheck className="h-3 w-3" strokeWidth={2.6} />
                        ) : (
                          <IconCross className="h-3 w-3" strokeWidth={2.6} />
                        )}
                      </span>
                      <span
                        className={`text-sm leading-relaxed ${
                          point.ok ? 'text-white/80' : 'text-white/50'
                        }`}
                      >
                        {point.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {gen.highlight && (
                  <p className="mt-auto pt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-ember">
                    Exclusive @ Bzzworld
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
