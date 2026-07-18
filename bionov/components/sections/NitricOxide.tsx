'use client'

// Chapter 10 — Why Nitric Oxide Matters.
// The NO molecule expands into an animated pathway network; each node
// lights up as its scroll window passes. Educational wording only.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { nitricOxide } from '@/data/site-content'
import { clamp01, seg } from '@/components/three/filmMath'

export default function NitricOxide() {
  const trackRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const svg = svgRef.current
    if (!track || !svg) return

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('path[data-draw]'))
    paths.forEach((p) => {
      const len = p.getTotalLength()
      p.style.strokeDasharray = String(len)
      p.style.strokeDashoffset = String(len)
    })
    const nodes = Array.from(svg.querySelectorAll<SVGGElement>('g[data-node]'))
    const cards = cardsRef.current
      ? Array.from(cardsRef.current.querySelectorAll<HTMLElement>('[data-card]'))
      : []

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        // draw pathways over 0.05–0.55
        paths.forEach((path, i) => {
          const len = Number(path.style.strokeDasharray)
          const local = clamp01(seg(p, 0.05 + i * 0.055, 0.3 + i * 0.055))
          path.style.strokeDashoffset = String(len * (1 - local))
        })
        // nodes pop over their own windows
        nodes.forEach((n, i) => {
          const local = clamp01(seg(p, 0.18 + i * 0.09, 0.28 + i * 0.09))
          n.style.opacity = String(local)
          n.style.transform = `scale(${0.6 + local * 0.4})`
          n.style.transformOrigin = 'center'
          n.style.transformBox = 'fill-box'
        })
        cards.forEach((c, i) => {
          const local = clamp01(seg(p, 0.3 + i * 0.09, 0.42 + i * 0.09))
          c.style.opacity = String(local)
          c.style.transform = `translateY(${(1 - local) * 30}px)`
        })
      },
    })
    return () => st.kill()
  }, [])

  // network geometry: central NO molecule + 5 orbit nodes
  const cx = 400
  const cy = 260
  const nodePos = [
    [150, 90],
    [650, 100],
    [110, 400],
    [690, 390],
    [400, 480],
  ]

  return (
    <section id="nitric-oxide" aria-label="Why nitric oxide matters">
      <div ref={trackRef} className="relative" style={{ height: '300vh' }}>
        <div className="film-viewport overflow-hidden bg-gradient-to-br from-nov-mist via-white to-[#fbeff8]">
          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
            <div className="text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
                Chapter 10
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
                {nitricOxide.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-nov-ink/70">{nitricOxide.body}</p>
            </div>

            <div className="relative mt-6">
              <svg
                ref={svgRef}
                viewBox="0 0 800 560"
                className="mx-auto block h-auto w-full max-w-3xl"
                role="img"
                aria-label="Diagram of nitric-oxide signalling pathways connecting circulation, cellular communication, vitality, immune function and cognition"
              >
                <defs>
                  <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#29C4F0" />
                    <stop offset="60%" stopColor="#8B7BE8" />
                    <stop offset="100%" stopColor="#F272B6" />
                  </linearGradient>
                </defs>

                {nodePos.map(([x, y], i) => (
                  <path
                    key={i}
                    data-draw
                    d={`M ${cx} ${cy} Q ${(cx + x) / 2 + (i % 2 === 0 ? -60 : 60)} ${(cy + y) / 2}, ${x} ${y}`}
                    fill="none"
                    stroke="url(#pathGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ))}

                {/* central NO molecule */}
                <g>
                  <circle cx={cx - 22} cy={cy} r="34" fill="#1B6FD8" opacity="0.92" />
                  <circle cx={cx + 26} cy={cy} r="28" fill="#F5822A" opacity="0.92" />
                  <text x={cx - 22} y={cy + 7} textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff">
                    N
                  </text>
                  <text x={cx + 26} y={cy + 7} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
                    O
                  </text>
                </g>

                {nodePos.map(([x, y], i) => (
                  <g key={`n${i}`} data-node style={{ opacity: 0 }}>
                    <circle cx={x} cy={y} r="14" fill="#fff" stroke="#29C4F0" strokeWidth="3" />
                    <circle cx={x} cy={y} r="5" fill="#1B6FD8" />
                  </g>
                ))}
              </svg>
            </div>

            <div ref={cardsRef} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
              {nitricOxide.areas.map((a) => (
                <div key={a.title} data-card className="nov-card p-4 text-center" style={{ opacity: 0 }}>
                  <h3 className="font-display text-sm font-bold text-nov-ink">{a.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-nov-ink/65">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
