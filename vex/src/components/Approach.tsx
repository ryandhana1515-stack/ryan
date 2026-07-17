import Reveal from './Reveal'

const STEPS = [
  {
    n: '01',
    title: 'Conviction',
    body: 'We start from a thesis, not a deck. If we believe, we commit — early and completely.',
  },
  {
    n: '02',
    title: 'Craft',
    body: 'Product and company are built in parallel. We ship, learn, and refine until it resonates.',
  },
  {
    n: '03',
    title: 'Compounding',
    body: 'We stay for the long arc. The best outcomes come from patience, not the quick exit.',
  },
]

export default function Approach() {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
          <div>
            <Reveal>
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
                How we work
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="mt-6 text-3xl md:text-4xl lg:text-5xl font-normal leading-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                A method built for the long game.
              </h2>
            </Reveal>
          </div>

          <div className="flex flex-col">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="flex gap-6 md:gap-10 py-8 border-b border-white/10">
                  <span className="text-sm text-gray-400 pt-1 w-10 shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-xl md:text-2xl font-medium">{s.title}</h3>
                    <p className="mt-3 text-gray-300 leading-relaxed max-w-xl">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
