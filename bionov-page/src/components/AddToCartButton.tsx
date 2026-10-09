import { useEffect, useRef, useState } from 'react'
import { useSelection } from '../context/SelectionContext'
import { IconArrow, IconCheck } from './icons'

type Props = {
  label?: string
  className?: string
  /** `full` is the wide pricing/sticky button, `pill` is the rounded CTA treatment. */
  shape?: 'full' | 'pill'
  pulse?: boolean
}

const SUCCESS_MS = 1200

/**
 * The single add-to-cart control used by the pricing section, the sticky mobile bar
 * and the final CTA band. It renders a real `<form data-shopify-buy>` so the Liquid
 * wrapper can take it over: point the action at /cart/add, keep the hidden `id`
 * input, and remove the preventDefault below.
 *
 * TODO (Shopify wiring): replace variantId values in data/product.ts with the real
 * variant ids, set the form action, and drop `event.preventDefault()`.
 */
export default function AddToCartButton({
  label = 'Add to Cart',
  className = '',
  shape = 'full',
  pulse = false,
}: Props) {
  const { selected } = useSelection()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Placeholder behaviour until the Shopify Buy form is wired up.
    event.preventDefault()
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), SUCCESS_MS)
  }

  const base =
    shape === 'full'
      ? 'w-full rounded-xl px-6 py-4'
      : 'rounded-full px-8 py-4'

  return (
    <form data-shopify-buy onSubmit={onSubmit} className={className}>
      <input type="hidden" name="id" value={selected.variantId} />
      <input type="hidden" name="quantity" value={1} />
      <button
        type="submit"
        aria-live="polite"
        className={`${base} group relative inline-flex items-center justify-center gap-2 overflow-hidden
          font-display text-[15px] font-bold tracking-tight transition-colors duration-300
          ${
            added
              ? 'bg-cyan-glow text-navy-900'
              : 'bg-ember text-navy-900 hover:bg-ember-soft'
          }
          ${pulse && !added ? 'animate-pulse-glow' : ''}`}
      >
        {/* Both layers stay mounted for the crossfade, so the inactive one is
            hidden from assistive tech to avoid announcing two labels at once. */}
        <span
          aria-hidden={added}
          className={`flex items-center gap-2 transition-all duration-200 ${
            added ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          {label}
          <IconArrow className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
        </span>
        <span
          aria-hidden={!added}
          className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-200 ${
            added ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
        >
          <IconCheck className="h-[18px] w-[18px]" strokeWidth={2.4} />
          Added
        </span>
      </button>
    </form>
  )
}
