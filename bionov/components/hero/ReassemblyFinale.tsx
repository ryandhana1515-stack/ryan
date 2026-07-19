'use client'

/**
 * Chapters 17–18: the product reassembles and settles, then the original
 * gradient and hero wording return to close the loop with the opening frame.
 */
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ensureGsap, ScrollTrigger, scrollToTarget } from '@/lib/scroll/gsap'
import { heroContent } from '@/data/site-content'
import { clamp01, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'

const FilmCanvas = dynamic(() => import('@/components/three/FilmScene'), { ssr: false })

export default function ReassemblyFinale() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [mounted, setMounted] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setMounted(true)
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!mounted || reduced) return
    ensureGsap()
    const track = trackRef.current
    if (!track) return
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
        if (ctaRef.current) {
          const o = clamp01(seg(self.progress, 0.8, 0.95))
          ctaRef.current.style.opacity = String(o)
          ctaRef.current.style.transform = `translateY(${(1 - o) * 26}px)`
          ctaRef.current.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
      },
    })
    return () => st.kill()
  }, [mounted, reduced])

  if (!mounted || reduced) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center bg-nov-gradient text-center text-white">
        <div className="px-6 py-24">
          <h2 className="font-display text-5xl font-extrabold md:text-7xl">BIO N:OV</h2>
          <p className="mt-4 font-display text-2xl font-semibold">
            {heroContent.subtitle.join(' ')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="BIO N:OV product reassembly and closing">
      <div ref={trackRef} style={{ height: '600vh' }} className="relative">
        <div ref={stageRef} className="film-viewport">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(95% 75% at 50% 32%, #1b3a8f 0%, #0c1740 48%, #060b26 100%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(75% 42% at 50% 100%, rgba(47,208,255,0.22) 0%, rgba(47,208,255,0) 60%)',
            }}
          />
          <FilmCanvas progressRef={progressRef} mode="reassembly" className="!absolute inset-0" />

          {/* Chapter 17 caption */}
          <div className="pointer-events-none absolute inset-x-0 top-[10%] text-center text-white">
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-white/70">
              Chapter 17 · Reassembly
            </p>
          </div>

          {/* Chapter 18: closing CTA */}
          <div
            ref={ctaRef}
            className="absolute inset-0 flex items-center justify-center text-center text-white"
            style={{ opacity: 0 }}
          >
            <div className="px-6">
              <h2 className="font-display text-6xl font-extrabold tracking-tight md:text-8xl">
                BIO&nbsp;N:OV
              </h2>
              <p className="mt-5 font-display text-2xl font-semibold md:text-4xl">
                {heroContent.subtitle[0]}
                <br />
                {heroContent.subtitle[1]}
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-4">
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
              <p className="mt-10 text-xs text-white/70">
                Exclusive @ Bzzworld ·{' '}
                <span className="align-middle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset('/assets/product/clean/box-front.png')}
                    alt=""
                    aria-hidden
                    className="inline h-6 w-auto rounded-sm opacity-80"
                  />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
