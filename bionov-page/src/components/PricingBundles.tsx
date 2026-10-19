import boxImage from '../assets/box.webp'
import { PRODUCT_SPEC, TRUST_BULLETS, type Pack } from '../data/product'
import { useSelection } from '../context/SelectionContext'
import AddToCartButton from './AddToCartButton'
import Reveal from './Reveal'
import { IconCheck, IconGift } from './icons'

const money = (n: number) => `$${n.toFixed(2)}`

function PackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: Pack
  selected: boolean
  onSelect: () => void
}) {
  const perBox = pack.price / pack.boxes

  return (
    <label
      className={`relative block cursor-pointer rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
        selected
          ? 'border-cyan-glow/70 bg-cyan-glow/[0.06] shadow-glow-cyan'
          : 'border-white/10 bg-white/[0.02] opacity-70 hover:opacity-100'
      }`}
    >
      <input
        type="radio"
        name="bionov-pack"
        value={pack.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />

      {pack.badge && (
        <span className="absolute -top-3 right-4 rounded-full bg-navy-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/15">
          {pack.badge}
        </span>
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected ? 'border-cyan-glow bg-cyan-glow text-navy-900' : 'border-white/25'
          }`}
        >
          {selected && <IconCheck className="h-3 w-3" strokeWidth={3} />}
        </span>

        <img
          src={boxImage}
          alt=""
          width={427}
          height={540}
          loading="lazy"
          decoding="async"
          className="h-12 w-auto shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] sm:h-14"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-bold tracking-tight">{pack.name}</p>
            <span className="rounded-full bg-cyan-glow/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-glow">
              Sale {pack.discountPct}% off
            </span>
          </div>
          <p className="mt-1 text-[13px] text-white/50">
            {pack.boxes} {pack.boxes === 1 ? 'box' : 'boxes'}, {pack.supplyDays} day supply
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-lg font-bold tracking-tight">{money(pack.price)}</p>
          <p className="text-[13px] text-white/50 line-through">{money(pack.compareAt)}</p>
          <p className="mt-1 text-[11px] text-white/45">{money(perBox)} per box</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-white/[0.08] pt-4">
        {pack.gifts.map((gift) => (
          <li key={gift.name} className="flex items-center gap-2.5 text-[13px]">
            <IconGift
              className={`h-4 w-4 shrink-0 ${selected ? 'text-cyan-glow' : 'text-white/50'}`}
            />
            <span className="flex-1 text-white/70">Free gift: {gift.name}</span>
            <span className="text-white/45 line-through">$0</span>
          </li>
        ))}
      </ul>
    </label>
  )
}

export default function PricingBundles() {
  const { packs, selected, select } = useSelection()
  const savings = selected.compareAt - selected.price

  return (
    <section className="section border-t border-white/[0.06]" id="pricing">
      <div className="shell">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Choose your supply</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="h2 mt-4">Start your NO revolution</h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="body-lg mt-5">
              {PRODUCT_SPEC}. Three tablets a day, one per serving. The longer the supply, the
              lower the per-box price and the more gifts unlock.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="space-y-4">
            {packs.map((pack, i) => (
              <Reveal key={pack.id} delay={i * 90}>
                <PackCard
                  pack={pack}
                  selected={pack.id === selected.id}
                  onSelect={() => select(pack.id)}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay={160}>
            <div className="lg:sticky lg:top-8">
              <div className="card p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Your order
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/60">
                      {selected.name}, {selected.boxes} {selected.boxes === 1 ? 'box' : 'boxes'}
                    </span>
                    <span className="text-white/50 line-through">{money(selected.compareAt)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/60">You save</span>
                    <span className="text-cyan-glow">{money(savings)}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/60">Free gifts</span>
                    <span className="text-white/80">
                      {selected.gifts.length} included
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-white/[0.08] pt-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">You pay</p>
                    <p className="mt-1 font-display text-3xl font-bold tracking-tight">
                      {money(selected.price)}
                    </p>
                  </div>
                  <span className="rounded-full bg-ember/15 px-3 py-1 text-[12px] font-semibold text-ember">
                    Sale {selected.discountPct}% off
                  </span>
                </div>

                <AddToCartButton className="mt-6" label="Add to Cart" />

                <ul className="mt-6 space-y-2.5">
                  {TRUST_BULLETS.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-[13px] text-white/60">
                      <IconCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-cyan-glow"
                        strokeWidth={2.2}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* TODO: confirm final retail pricing before launch. */}
              <p className="disclaimer mt-4">
                Prices shown in USD. Taxes and duties calculated at checkout.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
