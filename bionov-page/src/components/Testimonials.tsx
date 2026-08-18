import { useCallback, useEffect, useRef, useState } from 'react'
import { TESTIMONIALS } from '../data/product'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Reveal from './Reveal'
import { IconCheck, IconStar } from './icons'

const AUTOPLAY_MS = 5200

/**
 * Swipeable card carousel. Scroll-snap does the work on touch, so mobile swipe is
 * native. Autoplay advances the active card and pauses on hover, focus, or when
 * reduced motion is on.
 */
export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement | null>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  const goTo = useCallback((index: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[index] as HTMLElement | undefined
    if (!card) return
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
    setActive(index)
  }, [])

  useEffect(() => {
    if (paused || prefersReduced) return
    const id = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % TESTIMONIALS.length
        const track = trackRef.current
        const card = track?.children[next] as HTMLElement | undefined
        if (track && card) {
          track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
        }
        return next
      })
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, prefersReduced])

  // Keep the dots in sync when the user swipes by hand.
  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    const children = Array.from(track.children) as HTMLElement[]
    const left = track.scrollLeft
    let nearest = 0
    let best = Infinity
    children.forEach((child, i) => {
      const distance = Math.abs(child.offsetLeft - track.offsetLeft - left)
      if (distance < best) {
        best = distance
        nearest = i
      }
    })
    setActive(nearest)
  }

  return (
    <section
      className="section border-t border-white/[0.06] bg-navy-900/40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Reveal>
              <p className="eyebrow">Verified buyers</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="h2 mt-4">What people notice first</h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            {/* TODO: replace with the live aggregate rating from the Shopify reviews app. */}
            <div className="flex items-center gap-3">
              <span className="flex gap-1 text-ember" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className="h-4 w-4" />
                ))}
              </span>
              <span className="text-sm text-white/55">Rated by verified buyers</span>
            </div>
          </Reveal>
        </div>

        <ul
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {TESTIMONIALS.map((review) => (
            <li
              key={review.id}
              className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]"
            >
              <figure className="card flex h-full flex-col p-6">
                <span
                  role="img"
                  aria-label={`${review.rating} out of 5`}
                  className="flex gap-1 text-ember"
                >
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <IconStar key={i} className="h-4 w-4" />
                  ))}
                </span>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-white/75">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.08] pt-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white/85">{review.name}</p>
                    <p className="text-[12px] text-white/55">{review.location}</p>
                  </div>
                  {review.verified && (
                    <span className="flex items-center gap-1.5 rounded-full bg-cyan-glow/12 px-2.5 py-1 text-[11px] font-semibold text-cyan-glow">
                      <IconCheck className="h-3 w-3" strokeWidth={3} />
                      Verified
                    </span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {/* The visible dot is small, but the button keeps a 24px tappable box around it. */}
        <div className="mt-4 flex items-center">
          {TESTIMONIALS.map((review, i) => (
            <button
              key={review.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show review ${i + 1}`}
              aria-current={i === active}
              className="group flex h-6 items-center px-1.5"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? 'w-8 bg-cyan-glow'
                    : 'w-3 bg-white/25 group-hover:bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
