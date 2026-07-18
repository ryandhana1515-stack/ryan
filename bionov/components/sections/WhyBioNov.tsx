'use client'

// Chapter 8 — Why BIO N:OV
import Reveal from '@/components/scroll/Reveal'
import { whyBioNov } from '@/data/site-content'
import { asset } from '@/lib/assets'
import { useParallaxGroup } from '@/lib/scroll/useParallax'

export default function WhyBioNov() {
  const ref = useParallaxGroup<HTMLElement>()
  return (
    <section ref={ref} id="why-bionov" className="relative overflow-hidden bg-white py-28">
      {/* soft gradient orbs echoing the PDF layout language — parallax layers */}
      <div aria-hidden data-parallax="0.9" className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-nov-cyan/10 blur-2xl" />
      <div aria-hidden data-parallax="-0.7" className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-nov-pink/10 blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal effect="clip-up">
          <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
            Chapter 08
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
            {whyBioNov.heading}
          </h2>
        </Reveal>
        <Reveal effect="rise" delay={0.1}>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-nov-ink/75">
            {whyBioNov.body}
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {whyBioNov.points.map((pt, i) => (
            <Reveal key={pt.title} effect="rise" delay={i * 0.12}>
              <div className="nov-card h-full p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-nov-gradient text-lg font-extrabold text-white">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-display text-xl font-bold text-nov-ink">{pt.title}</h3>
                <p className="mt-3 leading-relaxed text-nov-ink/70">{pt.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal effect="scale" delay={0.15}>
          <div className="mt-16 overflow-hidden rounded-3xl">
            {/* parallax inside a masked frame: image drifts slower than the page */}
            <div data-parallax="0.45" className="-my-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset('/assets/product/references/lifestyle-marble.png')}
                alt="BIO N:OV box and silver blister pack on a marble surface beside fresh garlic and lettuce"
                className="h-auto w-full scale-110"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
