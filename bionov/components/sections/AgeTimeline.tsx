'use client'

// Chapter 11 — Nitric Oxide and Age.
// The graph line draws itself as the user scrolls between age stages.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { ageTimeline } from '@/data/site-content'
import { clamp01, seg } from '@/components/three/filmMath'

const W = 800
const H = 380
const PAD = 70

export default function AgeTimeline() {
  const trackRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const stagesRef = useRef<HTMLDivElement>(null)

  const pts = ageTimeline.stages.map((s, i) => [
    PAD + (i / (ageTimeline.stages.length - 1)) * (W - PAD * 2),
    H - PAD - (s.level / 100) * (H - PAD * 2),
  ])
  const lineD = pts
    .map((p, i) =>
      i === 0
        ? `M ${p[0]} ${p[1]}`
        : `C ${pts[i - 1][0] + 60} ${pts[i - 1][1]}, ${p[0] - 60} ${p[1]}, ${p[0]} ${p[1]}`,
    )
    .join(' ')

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const line = lineRef.current
    if (!track || !line) return
    const len = line.getTotalLength()
    line.style.strokeDasharray = String(len)
    line.style.strokeDashoffset = String(len)

    const dots = Array.from(
      track.querySelectorAll<SVGCircleElement>('circle[data-dot]'),
    )
    const labels = Array.from(
      track.querySelectorAll<SVGGElement>('g[data-agelabel]'),
    )
    const stages = stagesRef.current
      ? Array.from(stagesRef.current.querySelectorAll<HTMLElement>('[data-stage]'))
      : []

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        const draw = clamp01(seg(p, 0.08, 0.75))
        line.style.strokeDashoffset = String(len * (1 - draw))
        dots.forEach((d, i) => {
          const local = clamp01(seg(p, 0.1 + i * 0.14, 0.16 + i * 0.14))
          d.style.opacity = String(local)
        })
        labels.forEach((l, i) => {
          const local = clamp01(seg(p, 0.1 + i * 0.14, 0.17 + i * 0.14))
          l.style.opacity = String(local)
        })
        stages.forEach((s, i) => {
          const start = 0.1 + i * 0.14
          const end = 0.1 + (i + 1) * 0.14
          const active = p >= start && p < end + 0.02
          s.style.opacity = active ? '1' : '0.35'
          s.style.transform = active ? 'scale(1.02)' : 'scale(1)'
        })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="age-timeline" aria-label="Nitric oxide and age">
      <div ref={trackRef} className="relative" style={{ height: '280vh' }}>
        <div className="film-viewport bg-white">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
            <div className="text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
                Chapter 11
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
                {ageTimeline.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-nov-ink/70">{ageTimeline.body}</p>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto mt-6 block h-auto w-full max-w-3xl"
              role="img"
              aria-label="Line chart showing that natural nitric-oxide production may gradually decline across the decades from the 20s to 60 plus"
            >
              <defs>
                <linearGradient id="ageGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#29C4F0" />
                  <stop offset="55%" stopColor="#1B6FD8" />
                  <stop offset="100%" stopColor="#F272B6" />
                </linearGradient>
              </defs>
              {/* axes */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD + 20} y2={H - PAD} stroke="#d8e4f4" strokeWidth="2" />
              <line x1={PAD} y1={PAD - 20} x2={PAD} y2={H - PAD} stroke="#d8e4f4" strokeWidth="2" />
              <path ref={lineRef} d={lineD} fill="none" stroke="url(#ageGrad)" strokeWidth="5" strokeLinecap="round" />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle data-dot cx={p[0]} cy={p[1]} r="9" fill="#fff" stroke="#1B6FD8" strokeWidth="4" style={{ opacity: 0 }} />
                  <g data-agelabel style={{ opacity: 0 }}>
                    <text x={p[0]} y={H - PAD + 30} textAnchor="middle" fontSize="17" fontWeight="700" fill="#12275A">
                      {ageTimeline.stages[i].age}
                    </text>
                  </g>
                </g>
              ))}
            </svg>

            <div ref={stagesRef} className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-5">
              {ageTimeline.stages.map((s) => (
                <div
                  key={s.age}
                  data-stage
                  className="rounded-2xl border border-nov-mist bg-white p-4 text-center shadow-sm transition-all duration-300"
                  style={{ opacity: 0.35 }}
                >
                  <p className="font-display text-lg font-extrabold text-nov-blue">{s.age}</p>
                  <p className="mt-1 text-xs leading-relaxed text-nov-ink/65">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
