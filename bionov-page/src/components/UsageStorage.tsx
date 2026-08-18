import { USAGE } from '../data/product'
import Reveal from './Reveal'
import { IconClock, IconSun } from './icons'

export default function UsageStorage() {
  const blocks = [
    { title: 'Usage', icon: IconClock, items: USAGE.usage },
    { title: 'Storage', icon: IconSun, items: USAGE.storage },
  ]

  return (
    <section className="section">
      <div className="shell">
        <div className="grid gap-5 sm:grid-cols-2">
          {blocks.map((block, i) => (
            <Reveal key={block.title} delay={i * 110}>
              <div className="card h-full p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-glow/20 bg-cyan-glow/[0.06] text-cyan-glow">
                  <block.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 h3">{block.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                      <span
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-glow"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
