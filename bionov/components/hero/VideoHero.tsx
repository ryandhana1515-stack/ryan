'use client'

/**
 * Hero: Ryan's own BIO N:OV cinematic clip, self-hosted, autoplaying in a
 * loop behind the title. Pinned briefly so the film breathes, then scroll
 * moves on to the interactive 3D chapter. Poster fallback for reduced
 * motion.
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, ScrollTrigger, scrollToTarget } from '@/lib/scroll/gsap'
import { clamp01, seg } from '@/components/three/filmMath'
import { heroContent, product } from '@/data/site-content'
import { asset } from '@/lib/assets'

export default function VideoHero() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState<boolean | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    ensureGsap()
    const track = trackRef.current
    const stage = stageRef.current
    const video = videoRef.current
    if (!track || !stage || !video) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void video.play().catch(() => {})
        else video.pause()
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
          const o = 1 - clamp01(seg(p, 0.3, 0.62))
          hero.style.opacity = String(o)
          hero.style.transform = `translateY(${(1 - o) * -30}px)`
          hero.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
        stage.style.opacity = String(1 - clamp01(seg(p, 0.9, 1)))
      },
    })

    return () => {
      st.kill()
      io.disconnect()
      video.pause()
    }
  }, [reduced])

  if (reduced !== false) {
    return (
      <section aria-label="BIO N:OV introduction" className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset('/assets/hero/posters/hero-bionov.jpg')}
          alt={`${product.name} box on a dark stage surrounded by glowing blue energy rings and floating tablets`}
          className="h-screen w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[#060b26]/70 to-transparent">
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
    <section aria-label="BIO N:OV cinematic hero">
      <div ref={trackRef} className="relative" style={{ height: '260vh' }}>
        <div ref={stageRef} className="film-viewport bg-[#060b26]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            loop
            autoPlay
            preload="auto"
            poster={asset('/assets/hero/posters/hero-bionov.jpg')}
            src={asset('/assets/videos/final/hero-bionov.mp4')}
            aria-hidden
          />
          {/* cinematic grade */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(130% 95% at 50% 45%, transparent 55%, rgba(3,7,26,0.55) 100%), linear-gradient(to bottom, rgba(3,7,26,0.4), transparent 20%)',
            }}
          />

          <div ref={heroRef} className="absolute inset-0 z-20 flex items-center">
            <div className="mx-auto grid w-full max-w-7xl items-center px-6 md:grid-cols-2">
              <div className="text-white">
                <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
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
                <p className="mt-6 max-w-md text-lg text-white/85">{heroContent.supporting}</p>
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/80">
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
