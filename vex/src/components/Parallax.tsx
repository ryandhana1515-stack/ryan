import { useRef, useEffect, type ReactNode } from 'react'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /**
   * Drift factor. Negative values lag behind the scroll (feel "deeper"),
   * positive values lead it. Around -0.15…0.15 reads as subtle.
   */
  speed?: number
}

/**
 * Translates its children vertically as the element passes through the
 * viewport. The outer wrapper is never transformed, so measuring it stays
 * stable (no feedback loop); only the inner layer moves.
 */
export default function Parallax({ children, className = '', speed = -0.12 }: ParallaxProps) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const loop = () => {
      const el = outer.current
      const node = inner.current
      if (el && node) {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        if (rect.bottom > -400 && rect.top < vh + 400) {
          const fromCenter = rect.top + rect.height / 2 - vh / 2
          node.style.transform = `translate3d(0, ${(fromCenter * speed).toFixed(2)}px, 0)`
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  return (
    <div ref={outer} className={className}>
      <div ref={inner} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  )
}
