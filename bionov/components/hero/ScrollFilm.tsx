'use client'

/**
 * Chapters 1–7 + dissolve: the pinned product film.
 * A tall scroll track pins a full-viewport stage; ScrollTrigger writes
 * progress into a ref consumed by the 3D scene and the HTML overlays.
 */
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ensureGsap, gsap, ScrollTrigger, scrollToTarget } from '@/lib/scroll/gsap'
import { heroContent, product } from '@/data/site-content'
import { CH, seg, clamp01 } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'

const FilmCanvas = dynamic(() => import('@/components/three/FilmScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-nov-cyan border-t-transparent" aria-hidden />
    </div>
  ),
})

interface OverlayWindow {
  id: string
  a: number
  b: number
  fade?: number
}

// visibility windows for each HTML overlay
const WINDOWS: OverlayWindow[] = [
  { id: 'ov-hero', a: 0, b: CH.arrival[1], fade: 0.03 },
  { id: 'ov-rotation', a: CH.rotation[0] + 0.02, b: CH.rotation[1], fade: 0.03 },
  { id: 'ov-levitation', a: CH.levitation[0] + 0.02, b: CH.levitation[1], fade: 0.03 },
  { id: 'ov-opening', a: CH.opening[0] + 0.02, b: CH.opening[1], fade: 0.03 },
  { id: 'ov-release', a: CH.release[0] + 0.02, b: CH.release[1], fade: 0.03 },
  { id: 'ov-inside', a: CH.field[0] + 0.02, b: CH.field[1], fade: 0.04 },
  { id: 'ov-macro', a: CH.macro[0] + 0.03, b: CH.dissolve[0] + 0.04, fade: 0.04 },
]

function windowOpacity(p: number, w: OverlayWindow): number {
  const f = w.fade ?? 0.03
  return clamp01(seg(p, w.a, w.a + f)) * (1 - clamp01(seg(p, w.b - f, w.b)))
}

export default function ScrollFilm() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [reduced, setReduced] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (!mounted || reduced) return
    ensureGsap()
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const overlays = WINDOWS.map((w) => ({
      w,
      el: stage.querySelector<HTMLElement>(`#${w.id}`),
    }))

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
        for (const { w, el } of overlays) {
          if (!el) continue
          const o = windowOpacity(self.progress, w)
          el.style.opacity = String(o)
          el.style.transform = `translateY(${(1 - o) * 24}px)`
          el.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
        }
        // fade the whole stage into the next section at the very end
        const out = 1 - clamp01(seg(self.progress, 0.965, 1))
        stage.style.opacity = String(out)
      },
    })
    return () => {
      st.kill()
    }
  }, [mounted, reduced])

  // Reduced-motion / SSR fallback: static hero
  if (!mounted || reduced) {
    return (
      <section aria-label="BIO N:OV introduction" className="relative flex min-h-screen items-center justify-center bg-nov-gradient-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2">
          <div>
            <h1 className="font-display text-6xl font-extrabold tracking-tight gradient-text md:text-7xl">
              {heroContent.title}
            </h1>
            <p className="mt-4 font-display text-2xl font-semibold text-nov-ink md:text-3xl">
              {heroContent.subtitle.join(' ')}
            </p>
            <p className="mt-6 max-w-md text-lg text-nov-ink/70">{heroContent.supporting}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset('/assets/product/references/box-cutout.png')}
            alt={`${product.name} product box — white packaging with a large cyan and blue V graphic`}
            className="mx-auto w-full max-w-sm"
          />
        </div>
      </section>
    )
  }

  return (
    <section aria-label="BIO N:OV cinematic product journey">
      {/* tall scroll track: total film length */}
      <div ref={trackRef} style={{ height: '1500vh' }} className="relative">
        <div ref={stageRef} className="film-viewport">
          {/* gradient environment behind the transparent canvas */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(118deg, #35c7f2 0%, #2f7de2 30%, #7f7ce8 62%, #f077b4 100%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 65% at 50% 100%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)',
            }}
          />

          <FilmCanvas progressRef={progressRef} mode="film" className="!absolute inset-0" />

          {/* ——— Chapter 1: hero overlay */}
          <div id="ov-hero" className="absolute inset-0 flex items-center" style={{ opacity: 1 }}>
            <div className="mx-auto grid w-full max-w-7xl items-center px-6 md:grid-cols-2">
              <div className="text-white">
                <p className="mb-3 font-display text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                  {product.korean} · Health Functional Food
                </p>
                <h1 className="font-display text-6xl font-extrabold leading-none tracking-tight drop-shadow-sm md:text-8xl">
                  BIO&nbsp;N:OV
                </h1>
                <p className="mt-5 font-display text-2xl font-semibold leading-snug md:text-4xl">
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
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/85">
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Scroll to explore</p>
              <div className="mx-auto mt-2 h-9 w-5 rounded-full border-2 border-white/70 p-1">
                <div className="h-2 w-1.5 animate-bounce rounded-full bg-white/90" />
              </div>
            </div>
          </div>

          {/* ——— Chapter 2 */}
          <ChapterCaption id="ov-rotation" kicker="Chapter 02" title="Every angle considered.">
            The original packaging — a clean white box carrying the signature cyan-to-deep-blue V.
          </ChapterCaption>

          {/* ——— Chapter 3 */}
          <ChapterCaption id="ov-levitation" kicker="Chapter 03" title="Elevated by science.">
            Premium fermentation technology, developed with an exclusive microbial strain.
          </ChapterCaption>

          {/* ——— Chapter 4 */}
          <ChapterCaption id="ov-opening" kicker="Chapter 04" title="Open the box.">
            Two silver blister packs. Sixty tablets. {product.spec}.
          </ChapterCaption>

          {/* ——— Chapter 5 */}
          <ChapterCaption id="ov-release" kicker="Chapter 05" title="A closer look.">
            Naturally speckled, compressed herbal tablets — matte, botanical, precise.
          </ChapterCaption>

          {/* ——— Chapter 6 */}
          <div id="ov-inside" className="pointer-events-none absolute inset-x-0 top-[12%] text-center text-white" style={{ opacity: 0 }}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-white/75">Inside BIO N:OV</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold md:text-6xl">
              Inside BIO&nbsp;N:OV
            </h2>
            <p className="mx-auto mt-4 max-w-xl px-6 text-base text-white/85 md:text-lg">
              An exploration of its fermentation-based formulation and featured ingredients.
            </p>
          </div>

          {/* ——— Chapter 7 */}
          <ChapterCaption id="ov-macro" kicker="Chapter 07" title="Botanical, down to the grain.">
            Fermented garlic and lettuce extracts, compressed into every tablet.
          </ChapterCaption>
        </div>
      </div>
    </section>
  )
}

function ChapterCaption({
  id,
  kicker,
  title,
  children,
}: {
  id: string
  kicker: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      className="pointer-events-none absolute inset-x-0 bottom-[10%] px-6 text-center text-white"
      style={{ opacity: 0 }}
    >
      <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-white/70">{kicker}</p>
      <h2 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-extrabold md:text-5xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-base">{children}</p>
    </div>
  )
}
