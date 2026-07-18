'use client'

/**
 * Cinematic autoplay hero: five Kling 3.0 first-frame→last-frame clips,
 * every clip anchored by REAL BIO N:OV photography, playing continuously
 * as one film with crossfades — like a broadcast commercial. Scroll fades
 * the title and releases the pin; the motion itself never depends on
 * scrolling. Playback pauses automatically when the hero leaves the
 * viewport.
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, ScrollTrigger, scrollToTarget } from '@/lib/scroll/gsap'
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
const FADE_S = 0.9 // crossfade duration in seconds

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
    const vids = videoRefs.current
    let active = 0
    let visible = false
    let disposed = false

    const setOpacity = (el: HTMLVideoElement | null, o: number) => {
      if (el) el.style.opacity = String(o)
    }

    // crossfade helper driven by rAF
    const crossfade = (from: number, to: number) => {
      const a = vids[from]
      const b = vids[to]
      if (!b) return
      b.currentTime = 0
      void b.play().catch(() => {})
      const t0 = performance.now()
      const step = (t: number) => {
        if (disposed) return
        const k = clamp01((t - t0) / (FADE_S * 1000))
        setOpacity(b, k)
        setOpacity(a, 1 - k)
        if (k < 1) requestAnimationFrame(step)
        else a?.pause()
      }
      requestAnimationFrame(step)
    }

    const advance = () => {
      if (disposed || !visible) return
      const next = (active + 1) % n
      crossfade(active, next)
      active = next
    }

    // chain playback via 'ended'; near-end fallback timer for safety
    const handlers: Array<() => void> = []
    vids.forEach((v, i) => {
      if (!v) return
      const onEnded = () => {
        if (i === active) advance()
      }
      v.addEventListener('ended', onEnded)
      handlers.push(() => v.removeEventListener('ended', onEnded))
    })

    // start / pause with visibility
    const startIfNeeded = () => {
      const v = vids[active]
      if (v && visible) {
        void v.play().catch(() => {})
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false
        if (visible) startIfNeeded()
        else vids.forEach((v) => v?.pause())
      },
      { threshold: 0.05 },
    )
    io.observe(stage)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        const hero = heroRef.current
        if (hero) {
          const o = 1 - clamp01(seg(p, 0.25, 0.55))
          hero.style.opacity = String(o)
          hero.style.transform = `translateY(${(1 - o) * -30}px)`
          hero.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
        stage.style.opacity = String(1 - clamp01(seg(p, 0.9, 1)))
      },
    })

    return () => {
      disposed = true
      st.kill()
      io.disconnect()
      handlers.forEach((h) => h())
      vids.forEach((v) => v?.pause())
    }
  }, [reduced])

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
      <div ref={trackRef} className="relative" style={{ height: '320vh' }}>
        <div ref={stageRef} className="film-viewport bg-[#3a55b8]">
          {SEGMENTS.map((s, i) => (
            <video
              key={s.id}
              ref={(el) => {
                videoRefs.current[i] = el
              }}
              className="absolute inset-0 h-full w-full object-cover transition-none"
              style={{ opacity: i === 0 ? 1 : 0, zIndex: 10 + i }}
              muted
              playsInline
              autoPlay={i === 0}
              preload={i < 2 ? 'auto' : 'metadata'}
              poster={asset(s.poster)}
              src={remoteFor(s.id)}
              aria-hidden
            />
          ))}

          {/* cinematic grade */}
          <div
            aria-hidden
            className="absolute inset-0 z-30"
            style={{
              background:
                'radial-gradient(130% 95% at 50% 45%, transparent 58%, rgba(8,16,52,0.38) 100%), linear-gradient(to bottom, rgba(8,16,52,0.35), transparent 18%)',
            }}
          />

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
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Scroll to continue</p>
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
