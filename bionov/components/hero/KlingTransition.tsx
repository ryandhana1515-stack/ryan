'use client'

/**
 * A pinned cinematic interlude: a Kling clip whose first frame is real
 * BIO N:OV photography, autoplaying in a loop while visible. Scroll fades
 * the caption; playback pauses off-screen. Poster fallback for reduced
 * motion.
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, ScrollTrigger } from '@/lib/scroll/gsap'
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

export default function KlingTransition({
  clipId,
  poster,
  kicker,
  title,
  body,
  heightVh = 200,
}: {
  clipId: string
  poster: string
  kicker: string
  title: string
  body: string
  heightVh?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState<boolean | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    ensureGsap()
    const track = trackRef.current
    const video = videoRef.current
    if (!track || !video) return

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.05 },
    )
    io.observe(video)

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const cap = captionRef.current
        if (cap) {
          const o =
            clamp01(seg(self.progress, 0.1, 0.28)) *
            (1 - clamp01(seg(self.progress, 0.78, 0.95)))
          cap.style.opacity = String(o)
          cap.style.transform = `translateY(${(1 - o) * 28}px)`
        }
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
      <section className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(poster)} alt="" aria-hidden className="h-[60vh] w-full object-cover" />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent pb-14 text-center text-white">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em]">{kicker}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold md:text-5xl">{title}</h2>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-label={title}>
      <div ref={trackRef} className="relative" style={{ height: `${heightVh}vh` }}>
        <div className="film-viewport bg-[#4a63c4]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="auto"
            poster={asset(poster)}
            src={remoteFor(clipId)}
            aria-hidden
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(10,20,60,0.35) 100%)',
            }}
          />
          <div
            ref={captionRef}
            className="pointer-events-none absolute inset-x-0 bottom-[12%] px-6 text-center text-white"
            style={{ opacity: 0 }}
          >
            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-white/75">
              {kicker}
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl font-display text-3xl font-extrabold drop-shadow md:text-5xl">
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 md:text-base">{body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
