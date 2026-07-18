'use client'

// Chapter 14 — Five Wellness Pillars.
// Five floating "worlds": the camera approaches each card in its own
// scroll interval, briefly enters it, then moves to the next.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { pillars } from '@/data/site-content'
import { clamp01, lerp, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'

const ICONS: Record<string, string> = {
  drop: '/assets/icons/drop.png',
  bottle: '/assets/icons/bottle.png',
  muscle: '/assets/icons/muscle.png',
  shield: '/assets/icons/shield.png',
  brain: '/assets/icons/brain.png',
}

export default function WellnessPillars() {
  const trackRef = useRef<HTMLDivElement>(null)
  const worldsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const wrap = worldsRef.current
    if (!track || !wrap) return
    const worlds = Array.from(wrap.querySelectorAll<HTMLElement>('[data-world]'))
    const n = worlds.length

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        worlds.forEach((el, i) => {
          const a = 0.04 + (i / n) * 0.9
          const b = 0.04 + ((i + 1) / n) * 0.9
          const local = clamp01(seg(p, a, b))
          // approach: scale up + focus; exit: drift up and fade
          const enter = clamp01(seg(local, 0, 0.35))
          const exit = clamp01(seg(local, 0.72, 1))
          const scale = lerp(0.82, 1, enter) * lerp(1, 1.12, exit)
          const opacity = enter * (1 - exit)
          const y = lerp(70, 0, enter) - exit * 90
          el.style.opacity = String(opacity)
          el.style.transform = `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`
          el.style.zIndex = String(10 + i)
          el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none'
        })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="pillars" aria-label="Five pillars of wellness">
      <div ref={trackRef} className="relative" style={{ height: `${120 + pillars.items.length * 90}vh` }}>
        <div className="film-viewport overflow-hidden bg-gradient-to-br from-nov-mist via-white to-[#fbeff8]">
          {/* fixed heading */}
          <div className="absolute inset-x-0 top-[9%] px-6 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
              Chapter 14
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
              {pillars.heading}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-nov-ink/70">{pillars.body}</p>
          </div>

          <div ref={worldsRef} className="absolute inset-0">
            {pillars.items.map((it, i) => (
              <article
                key={it.key}
                data-world
                className="absolute left-1/2 top-[58%] w-[86vw] max-w-md"
                style={{ opacity: 0, transform: 'translate(-50%,-50%) scale(0.82)' }}
              >
                <div className="nov-card relative overflow-hidden p-10 text-center">
                  <div
                    aria-hidden
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20"
                    style={{
                      background:
                        i % 2 === 0
                          ? 'radial-gradient(circle, #29C4F0, transparent 70%)'
                          : 'radial-gradient(circle, #F272B6, transparent 70%)',
                    }}
                  />
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-nov-purple/50 bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(ICONS[it.icon])} alt="" aria-hidden className="h-full w-full object-contain" />
                  </div>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-nov-orange">
                    Pillar {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold text-nov-ink">{it.title}</h3>
                  <p className="mt-3 leading-relaxed text-nov-ink/70">{it.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
