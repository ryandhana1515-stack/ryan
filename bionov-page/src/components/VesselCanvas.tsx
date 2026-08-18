import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Variant = 'hero' | 'vessel'

type Props = {
  variant?: Variant
  className?: string
}

type Particle = {
  lane: number
  t: number
  speed: number
  size: number
  warm: boolean
  offset: number
}

const LANE_COUNT = { hero: 7, vessel: 9 } as const
const DENSITY = { hero: 130, vessel: 190 } as const

/** Phones get roughly half the particles: same look, a fraction of the paint cost. */
const densityFor = (variant: Variant) =>
  typeof window !== 'undefined' && window.innerWidth < 640
    ? Math.round(DENSITY[variant] * 0.5)
    : DENSITY[variant]

const SPRITE_PX = 64

/**
 * Bakes one glowing dot into an offscreen canvas so the render loop only ever has
 * to blit it. `halo` fades out to `edge`, with a bright `core` in the middle.
 */
function makeGlowSprite(halo: string, edge: string, core: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas')
  sprite.width = SPRITE_PX
  sprite.height = SPRITE_PX
  const sctx = sprite.getContext('2d')!
  const mid = SPRITE_PX / 2

  const glow = sctx.createRadialGradient(mid, mid, 0, mid, mid, mid)
  glow.addColorStop(0, `rgba(${halo}, 1)`)
  glow.addColorStop(1, `rgba(${edge}, 0)`)
  sctx.fillStyle = glow
  sctx.beginPath()
  sctx.arc(mid, mid, mid, 0, Math.PI * 2)
  sctx.fill()

  sctx.fillStyle = `rgba(${core}, 1)`
  sctx.beginPath()
  sctx.arc(mid, mid, SPRITE_PX * 0.055, 0, Math.PI * 2)
  sctx.fill()

  return sprite
}

/** Runs `fn` once the browser is idle, so canvas setup never delays first paint. */
function whenIdle(fn: () => void): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }
  if (typeof w.requestIdleCallback === 'function') {
    const handle = w.requestIdleCallback(fn, { timeout: 1200 })
    return () => w.cancelIdleCallback?.(handle)
  }
  const timer = window.setTimeout(fn, 240)
  return () => window.clearTimeout(timer)
}

/**
 * The one abstract "vessel flow" system used behind the hero and again, larger and
 * slower, in the full-bleed vessel section. Particles ride sine-wave lanes across
 * the canvas so both sections read as the same continuous visual language rather
 * than two unrelated backgrounds.
 *
 * No external assets, no WebGL. 2D canvas keeps the payload small and the main
 * thread free, and the whole thing idles when scrolled out of view.
 */
export default function VesselCanvas({ variant = 'hero', className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const laneCount = LANE_COUNT[variant]
    const particles: Particle[] = []
    const count = densityFor(variant)

    for (let i = 0; i < count; i += 1) {
      particles.push({
        lane: i % laneCount,
        t: Math.random(),
        speed: 0.00016 + Math.random() * 0.00042,
        size: 0.7 + Math.random() * 2.1,
        warm: Math.random() > 0.86,
        offset: Math.random() * Math.PI * 2,
      })
    }

    let width = 0
    let height = 0
    let dpr = 1
    let frame = 0
    let running = true
    let last = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(rect.width, 1)
      height = Math.max(rect.height, 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /** y position of a lane at horizontal fraction t, in px. */
    const laneY = (lane: number, t: number, time: number) => {
      const base = ((lane + 0.5) / laneCount) * height
      const amplitude = height * (variant === 'hero' ? 0.055 : 0.075)
      const wobble = Math.sin(t * Math.PI * 2.2 + lane * 1.3 + time * 0.00022) * amplitude
      const swell = Math.sin(t * Math.PI) * height * 0.04
      return base + wobble + swell
    }

    const drawLanes = (time: number) => {
      ctx.lineWidth = 1
      for (let lane = 0; lane < laneCount; lane += 1) {
        ctx.beginPath()
        for (let step = 0; step <= 48; step += 1) {
          const t = step / 48
          const x = t * width
          const y = laneY(lane, t, time)
          if (step === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(0, 220, 255, ${variant === 'hero' ? 0.05 : 0.07})`
        ctx.stroke()
      }
    }

    const coolSprite = makeGlowSprite('150, 240, 255', '0, 220, 255', '226, 250, 255')
    const warmSprite = makeGlowSprite('255, 164, 119', '255, 122, 61', '255, 214, 190')

    const render = (now: number) => {
      const delta = Math.min(now - last, 48)
      last = now

      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'lighter'

      drawLanes(now)

      for (const p of particles) {
        if (!prefersReduced) {
          p.t += p.speed * delta
          if (p.t > 1.06) p.t -= 1.12
        }

        const x = p.t * width
        const y = laneY(p.lane, p.t, now) + Math.sin(now * 0.0008 + p.offset) * 3
        // Fade in and out at the canvas edges so particles never pop.
        const edge = Math.min(1, Math.min(p.t, 1 - p.t) * 6)
        const alpha = Math.max(0, edge) * (0.35 + Math.sin(now * 0.001 + p.offset) * 0.18)
        if (alpha <= 0.01) continue

        // One scaled drawImage per particle. Building a gradient per particle per
        // frame instead costs multiple seconds of main-thread time on a slow phone.
        const size = p.size * (variant === 'vessel' ? 1.25 : 1) * 10
        ctx.globalAlpha = Math.min(alpha, 1)
        ctx.drawImage(p.warm ? warmSprite : coolSprite, x - size / 2, y - size / 2, size, size)
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (running && !prefersReduced) frame = requestAnimationFrame(render)
    }

    resize()

    // Wait for an idle moment before the first paint of the field. The hero copy
    // and product shot land first; the ambient flow arrives a beat later.
    const cancelIdle = whenIdle(() => render(performance.now()))

    // Only burn frames while the canvas is actually on screen.
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              const visible = entry.isIntersecting
              if (visible && !running && !prefersReduced) {
                running = true
                last = performance.now()
                frame = requestAnimationFrame(render)
              } else if (!visible) {
                running = false
                cancelAnimationFrame(frame)
              }
            },
            { threshold: 0 },
          )
        : null
    io?.observe(canvas)

    const onResize = () => {
      resize()
      if (prefersReduced) render(performance.now())
    }
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelIdle()
      cancelAnimationFrame(frame)
      io?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [variant, prefersReduced])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
