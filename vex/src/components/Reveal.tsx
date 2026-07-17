import { useRef, useEffect, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Delay before the reveal begins, in ms. */
  delay?: number
  /** Initial vertical offset, in px. */
  y?: number
  /** Transition duration, in ms. */
  duration?: number
}

/** Fades + slides its children up the first time they scroll into view. */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 30,
  duration = 900,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.2,0.6,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.2,0.6,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
