'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

let registered = false
let lenisInstance: Lenis | null = null

export function ensureGsap(): void {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
}

/**
 * Root smooth-scroll hook. Mount once. Wires Lenis into GSAP's ticker so
 * ScrollTrigger positions always agree with the smoothed scroll value.
 */
export function useLenis(): void {
  useEffect(() => {
    ensureGsap()
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    lenisInstance = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])
}

export function scrollToTarget(selector: string): void {
  const el = document.querySelector(selector)
  if (!el) return
  if (lenisInstance) lenisInstance.scrollTo(el as HTMLElement, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export { gsap, ScrollTrigger }
