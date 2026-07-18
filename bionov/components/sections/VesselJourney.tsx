'use client'

// Chapter 13 — Blood-Vessel Experience.
// A clean, non-graphic 2D-canvas vessel: the camera travels through it,
// and as scroll advances the pathway relaxes wider and flow smooths.
import { useEffect, useRef } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { vessel } from '@/data/site-content'
import { clamp01, lerp, prand, seg } from '@/components/three/filmMath'

interface FlowDot {
  z: number
  angle: number
  radial: number
  speed: number
}

export default function VesselJourney() {
  const trackRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
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

    const dots: FlowDot[] = Array.from({ length: 130 }, (_, i) => ({
      z: prand(i * 3 + 1),
      angle: prand(i * 5 + 2) * Math.PI * 2,
      radial: 0.25 + prand(i * 7 + 3) * 0.6,
      speed: 0.4 + prand(i * 11 + 4) * 0.8,
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
      const p = reduced ? 0.7 : progressRef.current
      const relax = clamp01(seg(p, 0.2, 0.8)) // vessel widens + flow smooths
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // vessel rings receding into depth (tunnel illusion)
      const rings = 14
      for (let i = rings; i >= 1; i--) {
        const depth = i / rings
        const wobble = Math.sin(t * 0.001 + i * 1.2) * (1 - relax) * 6
        const baseR = Math.min(w, h) * (0.14 + relax * 0.1)
        const r = baseR + depth * Math.min(w, h) * 0.42 + wobble
        const alpha = 0.05 + (1 - depth) * 0.13
        ctx.strokeStyle = `rgba(235, 120, 150, ${alpha})`
        ctx.lineWidth = 10 + (1 - depth) * 16
        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r * 0.82, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // wall tint — soft, medical, non-graphic
      const wall = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.1, cx, cy, Math.min(w, h) * 0.6)
      wall.addColorStop(0, 'rgba(255, 245, 248, 0)')
      wall.addColorStop(1, 'rgba(244, 170, 190, 0.16)')
      ctx.fillStyle = wall
      ctx.fillRect(0, 0, w, h)

      // flow particles travelling toward the viewer
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        const speedNow = d.speed * lerp(0.35, 1.0, relax)
        d.z -= 0.0022 * speedNow * (reduced ? 0 : 1)
        if (d.z <= 0.02) d.z = 1
        const jitter = (1 - relax) * Math.sin(t * 0.004 + i) * 0.08
        const rr = (d.radial + jitter) * Math.min(w, h) * (0.13 + relax * 0.09)
        const scale = 1 / d.z
        const x = cx + Math.cos(d.angle) * rr * scale * 0.6
        const y = cy + Math.sin(d.angle) * rr * scale * 0.5
        const size = clamp01(1 - d.z) * 5 + 1
        const alpha = clamp01(1.15 - d.z) * 0.8
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        grad.addColorStop(0.5, `rgba(126, 199, 247, ${alpha * 0.7})`)
        grad.addColorStop(1, 'rgba(126, 199, 247, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, size * 2, 0, Math.PI * 2)
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
        progressRef.current = self.progress
        const cap = captionRef.current
        if (cap) {
          const o = clamp01(seg(self.progress, 0.08, 0.2))
          cap.style.opacity = String(o)
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
    <section id="vessel" aria-label="Nitric oxide and normal blood-vessel function">
      <div ref={trackRef} className="relative" style={{ height: '280vh' }}>
        <div className="film-viewport bg-gradient-to-b from-white via-[#fdf2f6] to-white">
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
          <div ref={captionRef} className="absolute inset-x-0 top-[10%] px-6 text-center" style={{ opacity: 0 }}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-pink">
              Chapter 13
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold text-nov-ink md:text-5xl">
              {vessel.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-nov-ink/70">{vessel.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
