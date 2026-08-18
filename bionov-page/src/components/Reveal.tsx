import type { ElementType, ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

type Props = {
  children: ReactNode
  /** Stagger offset in ms. Pass index * 90 for lists. */
  delay?: number
  className?: string
  as?: ElementType
}

/**
 * The page-wide "woosh" reveal. Starts translated down and transparent, settles
 * into place on an ease-out-back-ish curve once ~80% into the viewport.
 * Reduced-motion users get the final state immediately (handled in index.css).
 */
export default function Reveal({ children, delay = 0, className = '', as }: Props) {
  const { ref, inView } = useReveal<HTMLDivElement>()
  const Tag = (as ?? 'div') as ElementType

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
