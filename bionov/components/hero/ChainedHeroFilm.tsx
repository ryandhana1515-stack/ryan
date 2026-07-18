'use client'

/**
 * Cinematic hero: a chain of Kling first-frame→last-frame clips, each
 * anchored by REAL BIO N:OV photography from the PDF, scrubbed as one
 * continuous film by scroll. Crossfades bridge the clip boundaries; the
 * hero title sits over the opening shot. Falls back to the cover photo
 * for reduced motion.
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, gsap, ScrollTrigger, scrollToTarget } from '@/lib/scroll/gsap'
import { clamp01, seg } from '@/components/three/filmMath'
import { heroContent, product } from '@/data/site-content'
import { asset } from '@/lib/assets'
import cinematic from '@/data/cinematic-assets.json'

interface CineVideo {
  id: string
  remoteUrl?: string
}

const SEGMENTS = [
  { id: 'hero-chain-1', poster: '/assets/product/references/cover-hero.png' },
  { id: 'hero-chain-2', poster: '/assets/product/references/boxes-wood.png' },
  { id: 'hero-chain-3', poster: '/assets/product/references/lifestyle-marble.png' },
  { id: 'hero-chain-4', poster: '/assets/product/references/lifestyle-open-box.png' },
  { id: 'hero-chain-5', poster: '/assets/product/references/blister-flatlay.png' },
]
const XFADE = 0.045 // crossfade width as fraction of total progress

function remoteFor(id: string): string | undefined {
  return (cinematic as { videos: Record<string, CineVideo> }).videos?.[id]?.remoteUrl
}

export default function ChainedHeroFilm() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [reduced, setReduced] = useState<boolean | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    ensureGsap()
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const n = SEGMENTS.length
    const targets = SEGMENTS.map(() => ({ t: 0 }))
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
          gsap.to(targets[i], { t: local, duration: 0.25, ease: 'power2.out', overwrite: true })
          const v = videoRefs.current[i]
          if (!v) continue
          // visible in window, crossfade at both edges (first has no lead-in)
          const fadeIn = i === 0 ? 1 : clamp01(seg(p, a - XFADE, a + XFADE))
          const fadeOut = i === n - 1 ? 1 : 1 - clamp01(seg(p, b - XFADE, b + XFADE))
          const o = fadeIn * fadeOut
          v.style.opacity = String(o)
          v.style.zIndex = String(10 + i)
        }
        // hero overlay fades over the first fifth of segment 1
        const hero = heroRef.current
        if (hero) {
          const o = 1 - clamp01(seg(p, 0.04, 0.12))
          hero.style.opacity = String(o)
          hero.style.transform = `translateY(${(1 - o) * -30}px)`
          hero.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
        // fade the stage into the 3D chapter at the very end
        stage.style.opacity = String(1 - clamp01(seg(p, 0.972, 1)))
      },
    })

    return () => {
      st.kill()
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  // Static fallback (SSR + reduced motion)
  if (reduced !== false) {
    return (
      <section aria-label="BIO N:OV introduction" className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset('/assets/product/references/cover-hero.png')}
          alt={`${product.name} box with silver blister packs on a blue and pink gradient`}
          className="h-screen w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[#123fa8]/60 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-6 text-white">
            <h1 className="font-display text-6xl font-extrabold md:text-8xl">BIO N:OV</h1>
            <p className="mt-4 font-display text-2xl font-semibold md:text-4xl">
              {heroContent.subtitle.join(' ')}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="BIO N:OV cinematic hero film">
      <div ref={trackRef} className="relative" style={{ height: '850vh' }}>
        <div ref={stageRef} className="film-viewport bg-[#3a55b8]">
          {SEGMENTS.map((s, i) => (
            <video
              key={s.id}
              ref={(el) => {
                videoRefs.current[i] = el
              }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: i === 0 ? 1 : 0 }}
              muted
              playsInline
              preload={i < 2 ? 'auto' : 'metadata'}
              poster={asset(s.poster)}
              crossOrigin="anonymous"
              src={remoteFor(s.id)}
              aria-hidden
            />
          ))}

          {/* cinematic grade: vignette + subtle top gradient for nav legibility */}
          <div
            aria-hidden
            className="absolute inset-0 z-30"
            style={{
              background:
                'radial-gradient(130% 95% at 50% 45%, transparent 58%, rgba(8,16,52,0.38) 100%), linear-gradient(to bottom, rgba(8,16,52,0.35), transparent 18%)',
            }}
          />

          {/* hero overlay */}
          <div ref={heroRef} className="absolute inset-0 z-40 flex items-center">
            <div className="mx-auto grid w-full max-w-7xl items-center px-6 md:grid-cols-2">
              <div className="text-white">
                <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                  {product.korean} · Health Functional Food
                </p>
                <h1 className="font-display text-6xl font-extrabold leading-none tracking-tight drop-shadow-md md:text-8xl">
                  BIO&nbsp;N:OV
                </h1>
                <p className="mt-5 font-display text-2xl font-semibold leading-snug drop-shadow md:text-4xl">
                  {heroContent.subtitle[0]}
                  <br />
                  {heroContent.subtitle[1]}
                </p>
                <p className="mt-6 max-w-md text-lg text-white/90">{heroContent.supporting}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {heroContent.buttons.map((b) => (
                    <button
                      key={b.label}
                      onClick={() => scrollToTarget(b.target)}
                      className="rounded-full bg-white/95 px-7 py-3.5 font-display text-sm font-bold text-nov-deep shadow-lg transition hover:bg-white"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/85">
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Scroll — the film follows you</p>
              <div className="mx-auto mt-2 h-9 w-5 rounded-full border-2 border-white/70 p-1">
                <div className="h-2 w-1.5 animate-bounce rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
