import { SCIENCE_TEAM } from '../data/product'
import Reveal from './Reveal'

/**
 * Photo cards for the R&D team. Portraits are not supplied yet, so each card shows
 * a monogram plate.
 * TODO: swap the monogram for real headshots once Bzzworld provides them.
 */
function Monogram({ name }: { name: string }) {
  const initials = name
    .replace(/^(Ph\.D\.|Prof\.|Dr\.|Ass\.)\s*/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[radial-gradient(circle_at_35%_25%,rgba(0,220,255,0.20),rgba(10,17,40,0.9))] font-display text-lg font-bold tracking-tight text-white/85"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export default function ScienceTeam() {
  const { lead, board, members } = SCIENCE_TEAM

  return (
    <section className="section" id="science">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Research and development</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">Built by eight Korean university professors</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              Cardiovascular health, neuro-rehabilitation, metabolism, regenerative medicine. The
              team behind BIO N:OV spans six Korean medical schools.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {[lead, board].map((person, i) => (
            <Reveal key={person.name} delay={i * 110}>
              <article className="card h-full border-cyan-glow/20 bg-[linear-gradient(150deg,rgba(0,220,255,0.07),transparent)] p-6">
                <div className="flex items-start gap-4">
                  <Monogram name={person.name} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-glow">
                      {person.role}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold tracking-tight">
                      {person.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">{person.focus}</p>
                    <p className="mt-1 text-[13px] text-white/55">{person.affiliation}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((person, i) => (
            <Reveal key={person.name} delay={i * 80}>
              <article className="card h-full p-6">
                <Monogram name={person.name} />
                <h3 className="mt-4 font-display text-base font-bold tracking-tight">
                  {person.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{person.focus}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                  {person.affiliation}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
