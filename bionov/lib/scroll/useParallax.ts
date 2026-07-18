'use client'

// Parallax helper: elements inside a section translate vertically at
// different speeds while the section crosses the viewport.
//
//   const ref = useParallaxGroup()
//   <section ref={ref}>
//     <div data-parallax="0.3">slow layer</div>
//     <div data-parallax="-0.5">counter-moving layer</div>
//   </section>
//
// speed s: element moves s * sectionScrollDistance (positive = lags behind,
// negative = moves ahead). Disabled for prefers-reduced-motion.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'

export function useParallaxGroup<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    ensureGsap()
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-parallax]'),
    ).map((el) => ({ el, speed: parseFloat(el.dataset.parallax || '0.3') }))
    if (layers.length === 0) return

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        // progress 0..1 while section crosses viewport; center at 0
        const centered = (self.progress - 0.5) * 2
        for (const { el, speed } of layers) {
          el.style.transform = `translate3d(0, ${(-centered * speed * 100).toFixed(2)}px, 0)`
          el.style.willChange = 'transform'
        }
      },
    })
    return () => st.kill()
  }, [])

  return ref
}
