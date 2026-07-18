'use client'

// Chapter 9 — Microbial Fermentation Technology.
// A pinned 2D-canvas fermentation chamber: bubbles rise, particles drift,
// and scroll drives chamber rotation + a particle convergence into "NO".
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { fermentation, product } from '@/data/site-content'
import { clamp01, prand, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'

interface Bubble {
  x: number
  r: number
  speed: number
  phase: number
}

export default function Fermentation() {
  const trackRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    ensureGsap()
    const track = trackRef.current
    const canvas = canvasRef.current
    if (!track || !canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const bubbles: Bubble[] = Array.from({ length: 46 }, (_, i) => ({
      x: prand(i * 2 + 1),
      r: 3 + prand(i * 3 + 2) * 14,
      speed: 0.25 + prand(i * 5 + 3) * 0.8,
      phase: prand(i * 7 + 4) * 1000,
    }))

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t: number) => {
      const p = progressRef.current
      ctx.clearRect(0, 0, w, h)

      // chamber — rotating ellipse rings
      const cx = w / 2
      const cy = h / 2
      const rot = p * Math.PI * 1.2
      ctx.save()
      ctx.translate(cx, cy)
      for (let ring = 0; ring < 3; ring++) {
        ctx.save()
        ctx.rotate(rot * (ring % 2 === 0 ? 1 : -0.7) + ring)
        ctx.strokeStyle = `rgba(43,125,226,${0.16 - ring * 0.04})`
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.ellipse(0, 0, Math.min(w, h) * (0.32 + ring * 0.075), Math.min(w, h) * (0.2 + ring * 0.05), 0.4, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      // rising fermentation bubbles
      const converge = clamp01(seg(p, 0.55, 0.95))
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]
        const yt = (((t * 0.00004 * b.speed + b.phase) % 1) + 1) % 1
        let bx = b.x * w
        let by = h - yt * h * 1.1
        // converge into "NO" area
        if (converge > 0) {
          const side = i % 2 === 0 ? -1 : 1
          const tx = cx + side * Math.min(w, h) * 0.09
          const ty = cy
          bx = bx + (tx - bx) * converge
          by = by + (ty - by) * converge
        }
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r)
        grad.addColorStop(0, 'rgba(255,255,255,0.85)')
        grad.addColorStop(0.6, 'rgba(126,199,247,0.35)')
        grad.addColorStop(1, 'rgba(139,123,232,0.05)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(bx, by, b.r * (1 - converge * 0.55), 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = reduced ? 0.3 : self.progress
        const cap = captionRef.current
        if (cap) {
          const o = clamp01(seg(self.progress, 0.06, 0.16)) * (1 - clamp01(seg(self.progress, 0.5, 0.6)))
          cap.style.opacity = String(o)
        }
        const no = noRef.current
        if (no) {
          const o = clamp01(seg(self.progress, 0.62, 0.8))
          no.style.opacity = String(o)
          no.style.transform = `translate(-50%,-50%) scale(${0.7 + o * 0.3})`
        }
      },
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      st.kill()
    }
  }, [])

  return (
    <section id="fermentation" aria-label="Microbial fermentation technology">
      <div ref={trackRef} className="relative" style={{ height: '320vh' }}>
        <div className="film-viewport bg-gradient-to-b from-white via-nov-mist to-white">
          {/* fal.ai-generated fermentation world backdrop (soft, behind the canvas) */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-[0.32]"
            style={{
              backgroundImage: `url(${asset('/assets/diagrams/fermentation-world.png')})`,
              maskImage: 'radial-gradient(120% 90% at 50% 50%, black 40%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(120% 90% at 50% 50%, black 40%, transparent 100%)',
            }}
          />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

          <div ref={captionRef} className="absolute inset-x-0 top-[12%] px-6 text-center" style={{ opacity: 0 }}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
              Chapter 09
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
              {fermentation.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-nov-ink/70">{fermentation.sub}</p>
          </div>

          {/* the NO molecule the particles form */}
          <div
            ref={noRef}
            className="absolute left-1/2 top-1/2 text-center"
            style={{ opacity: 0, transform: 'translate(-50%,-50%)' }}
          >
            <div className="font-display text-8xl font-extrabold tracking-tight md:text-9xl">
              <span className="text-nov-blue">N</span>
              <span className="text-nov-orange">O</span>
            </div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-nov-ink/60">
              Nitric Oxide
            </p>
          </div>

          <div className="absolute bottom-[8%] left-1/2 w-full max-w-2xl -translate-x-1/2 px-6 text-center">
            <p className="text-sm leading-relaxed text-nov-ink/60">
              {fermentation.body} Exclusive proprietary strain{' '}
              <span className="font-semibold text-nov-blue">{product.strain}</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
