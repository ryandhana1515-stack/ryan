import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * 0 to 1 scrub value for a section, measured from "section top enters the bottom
 * of the viewport" to "section centre reaches the viewport centre".
 * Used by the exploding-tablet assembly and the vessel parallax.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(prefersReduced ? 1 : 0)

  useEffect(() => {
    if (prefersReduced) {
      setProgress(1)
      return
    }

    const el = ref.current
    if (!el) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // Start when the top edge hits the bottom of the viewport, finish when the
      // element's centre reaches the viewport centre.
      const total = vh + rect.height / 2
      const travelled = vh - rect.top
      const next = Math.min(Math.max(travelled / total, 0), 1)
      setProgress(next)
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
  }, [prefersReduced])

  return { ref, progress }
}
