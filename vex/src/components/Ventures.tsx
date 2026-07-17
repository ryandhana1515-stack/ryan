import Reveal from './Reveal'

const VENTURES = [
  { name: 'Halcyon', sector: 'Climate infrastructure', year: '2024' },
  { name: 'Northbeam', sector: 'Applied AI', year: '2023' },
  { name: 'Vireo', sector: 'Health', year: '2023' },
  { name: 'Cadence', sector: 'Fintech', year: '2022' },
  { name: 'Monol', sector: 'Developer tools', year: '2022' },
  { name: 'Aster', sector: 'Consumer', year: '2021' },
]

export default function Ventures() {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
            Selected ventures
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{ letterSpacing: '-0.03em' }}
          >
            Companies we've built and backed.
          </h2>
        </Reveal>

        <div className="mt-14 border-t border-white/10">
          {VENTURES.map((v, i) => (
            <Reveal key={v.name} delay={i * 70}>
              <a
                href="#contact"
                className="group flex items-baseline justify-between gap-4 py-6 border-b border-white/10 transition-colors hover:bg-white/[0.03] -mx-4 px-4 rounded-lg"
              >
                <span className="text-2xl md:text-4xl font-normal tracking-tight group-hover:text-white text-gray-100">
                  {v.name}
                </span>
                <span className="hidden sm:block flex-1 text-sm text-gray-400 pl-6">
                  {v.sector}
                </span>
                <span className="text-sm text-gray-400 tabular-nums">{v.year}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
