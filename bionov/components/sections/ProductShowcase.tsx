'use client'

// Chapter 16 — Product Information: close inspection of the real product
// photography plus confirmed specifications only.
import Reveal from '@/components/scroll/Reveal'
import { productInfo, product, roadmap, ingredients } from '@/data/site-content'
import { asset } from '@/lib/assets'

export default function ProductShowcase() {
  return (
    <section id="product-info" className="relative overflow-hidden bg-white py-28">
      <div aria-hidden className="absolute -right-40 top-24 h-96 w-96 rounded-full bg-nov-cyan/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal effect="clip-up">
          <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
            Chapter 16
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
            {productInfo.heading}
          </h2>
        </Reveal>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <Reveal effect="slide-right">
            <div className="relative">
              <div aria-hidden className="absolute inset-0 scale-90 rounded-full bg-nov-gradient opacity-15 blur-3xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset('/assets/product/references/box-cutout.png')}
                alt="BIO N:OV product box — tall white packaging with a large cyan-to-deep-blue V graphic, Korean lettering and certification seals"
                className="relative mx-auto w-full max-w-sm drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </Reveal>

          <Reveal effect="slide-left">
            <dl className="divide-y divide-nov-mist rounded-3xl border border-nov-mist bg-white shadow-sm">
              {productInfo.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-4 px-6 py-4">
                  <dt className="font-display text-sm font-bold text-nov-blue">{row.label}</dt>
                  <dd className="col-span-2 text-sm leading-relaxed text-nov-ink/80">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-nov-ink/50">
              {product.usage} {product.storage}
            </p>
          </Reveal>
        </div>

        {/* product photography strip */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              src: '/assets/product/references/boxes-wood.png',
              alt: 'Three BIO N:OV boxes displayed on a wooden pedestal against a blue gradient',
            },
            {
              src: '/assets/product/references/blister-flatlay.png',
              alt: 'BIO N:OV box surrounded by silver blister packs holding speckled tablets',
            },
            {
              src: '/assets/product/references/usage-glass.png',
              alt: 'BIO N:OV box beside a glass of water and an opened silver blister pack',
            },
          ].map((im, i) => (
            <Reveal key={im.src} effect="rise" delay={i * 0.1}>
              <div className="overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(im.src)}
                  alt={im.alt}
                  className="h-56 w-full object-cover transition duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TechnologyRoadmap() {
  return (
    <section id="roadmap" className="bg-nov-mist/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal effect="clip-up">
          <h2 className="font-display text-3xl font-extrabold text-nov-ink md:text-5xl">
            {roadmap.heading}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roadmap.generations.map((g, i) => (
            <Reveal key={g.gen} effect="rise" delay={i * 0.12}>
              <div
                className={`h-full rounded-3xl p-8 ${
                  g.highlight
                    ? 'bg-nov-gradient text-white shadow-xl'
                    : 'nov-card'
                }`}
              >
                <p
                  className={`font-display text-xs font-bold uppercase tracking-[0.3em] ${
                    g.highlight ? 'text-white/85' : 'text-nov-orange'
                  }`}
                >
                  {g.gen}
                </p>
                <h3 className={`mt-2 font-display text-xl font-extrabold ${g.highlight ? '' : 'text-nov-ink'}`}>
                  {g.name}
                </h3>
                <ul className={`mt-4 space-y-2 text-sm ${g.highlight ? 'text-white/85' : 'text-nov-ink/70'}`}>
                  {g.notes.map((n) => (
                    <li key={n} className="flex items-start gap-2">
                      <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${g.highlight ? 'bg-white' : 'bg-nov-cyan'}`} />
                      {n}
                    </li>
                  ))}
                </ul>
                {g.highlight && (
                  <p className="mt-5 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-semibold">
                    Exclusive proprietary microbial strain · {product.strain}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturedIngredients() {
  return (
    <section id="ingredients" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal effect="clip-up">
          <h2 className="font-display text-3xl font-extrabold text-nov-ink md:text-5xl">
            {ingredients.heading}
          </h2>
          <p className="mt-3 max-w-2xl text-nov-ink/70">{ingredients.body}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ingredients.items.map((ing, i) => (
            <Reveal key={ing.name} effect="rise" delay={i * 0.1}>
              <div className="nov-card group h-full p-7 text-center transition duration-300 hover:-translate-y-1.5">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-nov-gradient-soft text-2xl">
                  {['🥬', '🧄', '🌱', '🫘'][i]}
                </div>
                <h3 className="font-display text-lg font-bold text-nov-ink">{ing.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-nov-ink/65">{ing.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
