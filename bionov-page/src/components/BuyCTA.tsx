import boxImage from '../assets/box.webp'
import { TRUST_BULLETS } from '../data/product'
import { useSelection } from '../context/SelectionContext'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import AddToCartButton from './AddToCartButton'
import Reveal from './Reveal'
import { IconCheck } from './icons'

export default function BuyCTA() {
  const { selected } = useSelection()
  const prefersReduced = usePrefersReducedMotion()

  return (
    <section className="pb-24 pt-4 sm:pb-32">
      <div className="shell">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(150deg,#101A3A,#060B1B)] p-8 sm:p-12">
            <div
              className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-ember/25 blur-[110px]"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-glow/20 blur-[110px]"
              aria-hidden="true"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="eyebrow">Ready when you are</p>
                <h2 className="h2 mt-4 max-w-lg">
                  Start your <span className="text-gradient-ember">NO revolution</span> today
                </h2>

                <ul className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
                  {TRUST_BULLETS.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-white/70">
                      <IconCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow"
                        strokeWidth={2.2}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <AddToCartButton
                    shape="pill"
                    pulse
                    label={`Buy ${selected.name}`}
                    className="shrink-0"
                  />
                  <div>
                    <p className="font-display text-2xl font-bold tracking-tight">
                      ${selected.price.toFixed(2)}
                    </p>
                    <p className="text-[13px] text-white/55 line-through">
                      ${selected.compareAt.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div
                  className="absolute h-56 w-56 rounded-full bg-cyan-glow/20 blur-[70px]"
                  aria-hidden="true"
                />
                <img
                  src={boxImage}
                  alt="BIO N:OV box"
                  width={427}
                  height={540}
                  loading="lazy"
                  decoding="async"
                  className={`relative w-[190px] drop-shadow-[0_26px_50px_rgba(0,0,0,0.6)] sm:w-[230px] ${
                    prefersReduced ? '' : 'animate-float'
                  }`}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
