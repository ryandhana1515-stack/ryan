import Reveal from './Reveal'

const PILLARS = [
  {
    n: '01',
    title: 'Investing',
    body: 'Early conviction capital for founders solving problems that matter. We write the first check and keep showing up.',
  },
  {
    n: '02',
    title: 'Building',
    body: 'We co-found and build ventures in-house — pairing operators, engineers, designers, and capital under one roof.',
  },
  {
    n: '03',
    title: 'Advisory',
    body: 'Hands-on guidance through scale: strategy, hiring, go-to-market, and the decisions that compound over a decade.',
  },
]

export default function Pillars() {
  return (
    <section id="work" className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="text-sm uppercase tracking-[0.2em] text-gray-400">
            What we do
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2
            className="mt-6 text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{ letterSpacing: '-0.03em' }}
          >
            Three ways we partner.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="liquid-glass rounded-2xl p-8 h-full flex flex-col">
                <span className="text-sm text-gray-400">{p.n}</span>
                <h3 className="mt-6 text-2xl font-medium">{p.title}</h3>
                <p className="mt-4 text-gray-300 leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
