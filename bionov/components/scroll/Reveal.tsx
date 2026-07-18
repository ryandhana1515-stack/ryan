'use client'

/** Small scroll-reveal helper (varied effects, GSAP-driven). */
import { useEffect, useRef } from 'react'
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/scroll/gsap'

type Effect = 'rise' | 'fade' | 'clip-up' | 'scale' | 'slide-left' | 'slide-right'

export default function Reveal({
  children,
  effect = 'rise',
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  effect?: Effect
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    ensureGsap()
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const from: gsap.TweenVars = { opacity: 0 }
    const to: gsap.TweenVars = {
      opacity: 1,
      duration: 0.9,
      delay,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    }
    if (effect === 'rise') {
      from.y = 44
      to.y = 0
    } else if (effect === 'scale') {
      from.scale = 0.92
      to.scale = 1
    } else if (effect === 'clip-up') {
      from.clipPath = 'inset(0 0 100% 0)'
      to.clipPath = 'inset(0 0 0% 0)'
    } else if (effect === 'slide-left') {
      from.x = 60
      to.x = 0
    } else if (effect === 'slide-right') {
      from.x = -60
      to.x = 0
    }
    const tween = gsap.fromTo(el, from, to)
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [effect, delay])

  return (
    // @ts-expect-error dynamic tag ref typing
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
