import { CERTIFICATIONS } from '../data/product'
import Reveal from './Reveal'
import { ICONS } from './icons'

/**
 * One slim horizontal row replaces the source banner's right-hand wall of
 * certification logos. Monoline icons, single row, generous spacing.
 */
export default function TrustBar() {
  return (
    <section className="border-y border-white/[0.07] bg-white/[0.02]">
      <div className="shell py-6">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {CERTIFICATIONS.map((cert, i) => {
            const Icon = ICONS[cert.id]
            return (
              <Reveal as="li" key={cert.id} delay={i * 80}>
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 shrink-0 text-cyan-glow/80" />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold tracking-tight">{cert.label}</p>
                    <p className="truncate text-[11px] text-white/55">{cert.detail}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
