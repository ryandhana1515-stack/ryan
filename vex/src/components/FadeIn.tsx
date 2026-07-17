import { useState, useEffect, type ReactNode, type CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  /** Delay before the fade-in begins, in ms. */
  delay?: number
  /** Transition duration, in ms. */
  duration?: number
  className?: string
  style?: CSSProperties
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = '',
  style,
}: FadeInProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
