import { useEffect, useState } from 'react'
import { useSelection } from '../context/SelectionContext'
import AddToCartButton from './AddToCartButton'

/**
 * Thumb-reach CTA for mobile. Appears once the hero has scrolled away and hides
 * again over the pricing section, where the real cards already carry a button.
 */
export default function StickyMobileBar() {
  const { selected } = useSelection()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const pastHero = window.scrollY > window.innerHeight * 0.85
      const pricing = document.getElementById('pricing')
      const overPricing = pricing
        ? (() => {
            const rect = pricing.getBoundingClientRect()
            return rect.top < window.innerHeight * 0.75 && rect.bottom > 0
          })()
        : false
      setVisible(pastHero && !overPricing)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-900/95 backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[12px] text-white/50">
            {selected.name}, {selected.boxes} {selected.boxes === 1 ? 'box' : 'boxes'}
          </p>
          <p className="font-display text-lg font-bold leading-tight tracking-tight">
            ${selected.price.toFixed(2)}
            <span className="ml-2 text-[13px] font-normal text-white/50 line-through">
              ${selected.compareAt.toFixed(2)}
            </span>
          </p>
        </div>
        <AddToCartButton className="flex-1" label="Add to Cart" />
      </div>
    </div>
  )
}
