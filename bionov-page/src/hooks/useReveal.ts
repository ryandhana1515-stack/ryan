import { useEffect, useRef, useState } from 'react'

type Options = {
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number
  /** Extra bottom inset so elements trigger at roughly 80% into the viewport. */
  rootMargin?: string
  /** Reveal only the first time. Everything on this page is once-only by design. */
  once?: boolean
}

/**
 * Intersection-observer reveal. Returns a ref to attach and a boolean for the
 * "in view" state. Elements never re-animate on scroll-up, which keeps long-page
 * scrolling smooth.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -12% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return { ref, inView }
}
