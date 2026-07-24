'use client'

/**
 * Scroll-morph: two Kling 3.0 first→last frame clips, scrubbed by scroll,
 * playing as one continuous transformation — the box dissolves into the
 * fermentation world, which reforms into the NO molecule network.
 * Editorial captions slide alongside, in the style of premium 3D
 * portfolio sites. Reverses perfectly when scrolling back up.
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { clamp01, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'
import cinematic from '@/data/cinematic-assets.json'

interface CineVideo {
  id: string
  remoteUrl?: string
}

function remoteFor(id: string): string | undefined {
  return (cinematic as { videos: Record<string, CineVideo> }).videos?.[id]?.remoteUrl
}

const SEGS = [
  {
    id: 'morph-box-to-ferment',
    poster: '/assets/product/references/cover-hero.png',
    kicker: 'Inside BIO N:OV',
    title: 'From the box\nto biology.',
    body: 'Scroll — the product dissolves into the fermentation world it came from.',
  },
  {
    id: 'morph-ferment-to-molecule',
    poster: '/assets/diagrams/fermentation-world.png',
    kicker: 'The Science',
    title: 'Fermentation\nbecomes signal.',
    body: 'Fermented garlic and lettuce, designed to support the body’s own nitric-oxide pathways.',
  },
]
const XFADE = 0.06

export default function ScrollMorph() {
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const capRefs = useRef<(HTMLDivElement | null)[]>([])
  const [reduced, setReduced] = useState<boolean | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    ensureGsap()
    const track = trackRef.current
    if (!track) return

    const n = SEGS.length
    const targets = SEGS.map(() => ({ t: 0 }))
    let raf = 0
    const tick = () => {
      for (let i = 0; i < n; i++) {
        const v = videoRefs.current[i]
        if (!v) continue
        const d = v.duration
        if (d && Number.isFinite(d)) {
          const want = targets[i].t * Math.max(0, d - 0.05)
          if (Math.abs(v.currentTime - want) > 0.02) v.currentTime = want
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        for (let i = 0; i < n; i++) {
          const a = i / n
          const b = (i + 1) / n
          const local = clamp01(seg(p, a, b))
          gsap.to(targets[i], { t: local, duration: 0.22, ease: 'power2.out', overwrite: true })
          const v = videoRefs.current[i]
          if (v) {
            const fadeIn = i === 0 ? 1 : clamp01(seg(p, a - XFADE, a + XFADE))
            const fadeOut = i === n - 1 ? 1 : 1 - clamp01(seg(p, b - XFADE, b + XFADE))
            v.style.opacity = String(fadeIn * fadeOut)
            v.style.zIndex = String(10 + i)
          }
          const cap = capRefs.current[i]
          if (cap) {
            const o =
              clamp01(seg(local, 0.08, 0.25)) * (1 - clamp01(seg(local, 0.8, 0.97)))
            cap.style.opacity = String(o)
            cap.style.transform = `translateY(${(1 - o) * 34}px)`
          }
        }
      },
    })

    return () => {
      st.kill()
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  if (reduced !== false) {
    return (
      <section className="relative bg-nov-mist py-20 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-nov-blue">
          Inside BIO N:OV
        </p>
        <h2 className="mt-3 font-display text-4xl font-extrabold text-nov-ink md:text-6xl">
          From the box to biology.
        </h2>
      </section>
    )
  }

  return (
    <section aria-label="BIO N:OV scroll transformation">
      <div ref={trackRef} className="relative" style={{ height: '480vh' }}>
        <div className="film-viewport bg-[#eaf3fc]">
          {SEGS.map((s, i) => (
            <video
              key={s.id}
              ref={(el) => {
                videoRefs.current[i] = el
              }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: i === 0 ? 1 : 0 }}
              muted
              playsInline
              preload="auto"
              poster={asset(s.poster)}
              src={remoteFor(s.id)}
              aria-hidden
            />
          ))}

          {/* soft edge grade so the editorial text stays readable */}
          <div
            aria-hidden
            className="absolute inset-0 z-20"
            style={{
              background:
                'linear-gradient(to right, rgba(10,20,60,0.42) 0%, rgba(10,20,60,0.08) 38%, transparent 55%)',
            }}
          />

          {/* editorial captions, one per segment */}
          {SEGS.map((s, i) => (
            <div
              key={`cap-${s.id}`}
              ref={(el) => {
                capRefs.current[i] = el
              }}
              className="absolute inset-y-0 left-0 z-30 flex w-full max-w-xl items-center px-8 md:px-14"
              style={{ opacity: 0 }}
            >
              <div className="text-white drop-shadow-md">
                <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-white/80">
                  {s.kicker}
                </p>
                <h2 className="mt-3 whitespace-pre-line font-display text-4xl font-extrabold leading-[1.05] md:text-6xl">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-sm text-base text-white/90 md:text-lg">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
