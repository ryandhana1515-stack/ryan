'use client'

// Chapter 15 — Research and Science.
// Sticky sequence: one researcher becomes prominent at a time, previous
// cards recede into the background. Uses only researchers from the PDF.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { researchers } from '@/data/researchers'
import { researchNote } from '@/data/site-content'
import { clamp01, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'

export default function ResearchTeam() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const wrap = cardsRef.current
    if (!track || !wrap) return
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>('[data-researcher]'))
    const n = cards.length

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        cards.forEach((el, i) => {
          const a = 0.04 + (i / n) * 0.9
          const b = 0.04 + ((i + 1) / n) * 0.9
          const enter = clamp01(seg(p, a, a + (b - a) * 0.3))
          const recede = clamp01(seg(p, b, b + (1 / n) * 0.55))
          el.style.opacity = String(enter * (1 - recede * 0.75))
          const scale = (0.86 + enter * 0.14) * (1 - recede * 0.1)
          const y = (1 - enter) * 90 - recede * 46
          el.style.transform = `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`
          el.style.zIndex = String(10 + i)
          el.style.filter = recede > 0.02 ? `blur(${recede * 4}px)` : 'none'
        })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="research" aria-label="Research and development team">
      <div ref={trackRef} className="relative" style={{ height: `${100 + researchers.length * 70}vh` }}>
        <div className="film-viewport overflow-hidden bg-gradient-to-b from-[#0f2b66] via-[#16408f] to-[#0f2b66] text-white">
          <div className="absolute inset-x-0 top-[8%] px-6 text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-cyan">
              Chapter 15
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-6xl">
              Masterpiece from Top-Notch Science
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              The BIO N:OV research and development board.
            </p>
          </div>

          <div ref={cardsRef} className="absolute inset-0">
            {researchers.map((r) => (
              <article
                key={r.name}
                data-researcher
                className="absolute left-1/2 top-[60%] w-[88vw] max-w-lg"
                style={{ opacity: 0, transform: 'translate(-50%,-50%) scale(0.86)' }}
              >
                <div className="flex items-center gap-6 rounded-3xl bg-white/95 p-7 text-nov-ink shadow-2xl backdrop-blur">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(`/assets/researchers/${r.photo}`)}
                    alt={`Portrait of ${r.name}`}
                    className={`h-28 w-28 flex-shrink-0 rounded-full object-cover object-top ring-4 ${
                      r.lead ? 'ring-nov-orange' : 'ring-nov-cyan/60'
                    }`}
                    loading="lazy"
                  />
                  <div>
                    {r.lead && (
                      <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-nov-orange">
                        R&D Leading Person
                      </p>
                    )}
                    <h3 className="font-display text-xl font-extrabold">{r.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-nov-blue">{r.role}</p>
                    <p className="text-sm text-nov-ink/70">{r.institution}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-nov-ink/60">{r.field}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="absolute bottom-5 left-1/2 w-full max-w-2xl -translate-x-1/2 px-6 text-center text-[11px] text-white/50">
            {researchNote}
          </p>
        </div>
      </div>
    </section>
  )
}
