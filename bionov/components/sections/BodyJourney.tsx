'use client'

// Chapter 12 — Human Body Journey.
// A stylised semi-transparent figure; each body system illuminates in its
// scroll window with a short educational description.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { bodyJourney } from '@/data/site-content'
import { clamp01, seg } from '@/components/three/filmMath'

// marker positions on the stylised figure (viewBox 200x420)
const MARKERS: Record<string, [number, number]> = {
  brain: [100, 42],
  lungs: [100, 120],
  heart: [88, 138],
  vessels: [100, 200],
  digest: [100, 250],
  immune: [100, 310],
}

export default function BodyJourney() {
  const trackRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const svg = svgRef.current
    if (!track || !svg) return
    const glows = Array.from(svg.querySelectorAll<SVGCircleElement>('circle[data-glow]'))
    const items = listRef.current
      ? Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-system]'))
      : []
    const n = bodyJourney.systems.length

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        for (let i = 0; i < n; i++) {
          const a = 0.06 + (i / n) * 0.85
          const b = 0.06 + ((i + 1) / n) * 0.85
          const active = clamp01(seg(p, a, a + 0.04)) * (1 - clamp01(seg(p, b, b + 0.03)))
          const g = glows[i]
          if (g) g.style.opacity = String(active * 0.9)
          const item = items[i]
          if (item) {
            item.style.opacity = String(0.3 + active * 0.7)
            item.style.transform = `translateX(${active * 10}px)`
          }
        }
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="body-journey" aria-label="Nitric oxide across the body's systems">
      <div ref={trackRef} className="relative" style={{ height: '340vh' }}>
        <div className="film-viewport bg-gradient-to-b from-[#0f2b66] via-[#123c8c] to-[#0f2b66] text-white">
          <div className="mx-auto grid h-full max-w-6xl items-center gap-8 px-6 md:grid-cols-2">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-cyan">
                Chapter 12
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">
                {bodyJourney.heading}
              </h2>
              <p className="mt-4 max-w-md text-white/75">{bodyJourney.body}</p>

              <div ref={listRef} className="mt-8 space-y-3.5">
                {bodyJourney.systems.map((s) => (
                  <div key={s.key} data-system className="flex items-start gap-3 transition-all duration-300" style={{ opacity: 0.3 }}>
                    <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-nov-cyan shadow-[0_0_12px_#29C4F0]" />
                    <div>
                      <h3 className="font-display font-bold">{s.title}</h3>
                      <p className="text-sm text-white/70">{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 200 420"
              className="mx-auto block h-[70vh] w-auto max-w-full"
              role="img"
              aria-label="Stylised human figure with glowing markers on the brain, lungs, heart, circulation, digestive and immune systems"
            >
              <defs>
                <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#5fd6ff" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#29C4F0" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#29C4F0" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* stylised translucent body silhouette */}
              <g fill="rgba(126,199,247,0.13)" stroke="rgba(126,199,247,0.5)" strokeWidth="1.6">
                <circle cx="100" cy="42" r="26" />
                <path d="M 74 78 C 70 92 66 100 56 108 C 46 116 42 130 44 146 L 52 210 C 54 224 60 232 60 246 L 58 330 C 58 348 64 362 66 380 L 72 412 L 88 412 L 92 340 L 100 300 L 108 340 L 112 412 L 128 412 L 134 380 C 136 362 142 348 142 330 L 140 246 C 140 232 146 224 148 210 L 156 146 C 158 130 154 116 144 108 C 134 100 130 92 126 78 Z" />
              </g>
              {/* faint vessel lines */}
              <g stroke="rgba(242,114,182,0.35)" strokeWidth="1" fill="none">
                <path d="M 100 90 C 92 140 108 170 100 220 C 94 260 106 300 100 340" />
                <path d="M 88 120 C 80 160 84 200 78 240" />
                <path d="M 112 120 C 120 160 116 200 122 240" />
              </g>

              {bodyJourney.systems.map((s) => {
                const [x, y] = MARKERS[s.key]
                return (
                  <circle key={s.key} data-glow cx={x} cy={y} r="26" fill="url(#glow)" style={{ opacity: 0 }} />
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
