'use client'

/**
 * A pinned cinematic transition scrubbed by scroll.
 *
 * The clip is a fal.ai Kling render whose first frame is the ORIGINAL PDF
 * cover photo, so the packaging stays authentic. The video is scrubbed via
 * currentTime with smoothing — it stops when scrolling stops and reverses
 * when the user scrolls back up.
 *
 * Source resolution: prefers a self-hosted file under /assets/videos/final/
 * if present, otherwise streams the recorded fal.media CDN URL
 * (data/cinematic-assets.json).
 */
import { useEffect, useRef, useState } from 'react'
import { ensureGsap, gsap, ScrollTrigger } from '@/lib/scroll/gsap'
import { clamp01, seg } from '@/components/three/filmMath'
import { asset } from '@/lib/assets'
import cinematic from '@/data/cinematic-assets.json'

interface CineVideo {
  id: string
  remoteUrl?: string
  local?: string
}

function resolveClip(id: string): { remote?: string; local: string } {
  const rec = (cinematic as { videos: Record<string, CineVideo> }).videos?.[id]
  return {
    remote: rec?.remoteUrl,
    local: asset(`/assets/videos/final/${id}.mp4`),
  }
}

export default function KlingTransition({
  clipId,
  poster,
  kicker,
  title,
  body,
  heightVh = 240,
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
  const src = resolveClip(clipId)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reduced !== false) return
    ensureGsap()
    const track = trackRef.current
    const video = videoRef.current
    if (!track || !video) return

    // try local file first; on error fall back to the fal CDN stream
    let usedRemote = false
    const onError = () => {
      if (!usedRemote && src.remote) {
        usedRemote = true
        video.src = src.remote
        video.load()
      }
    }
    video.addEventListener('error', onError)
    const sourceEl = video.querySelector('source')
    sourceEl?.addEventListener('error', onError)

    // scrub with smoothing: target time follows scroll, actual time lerps
    const state = { target: 0 }
    let raf = 0
    const tick = () => {
      const d = video.duration
      if (d && Number.isFinite(d)) {
        const want = state.target * Math.max(0, d - 0.05)
        if (Math.abs(video.currentTime - want) > 0.02) {
          video.currentTime = want
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
        gsap.to(state, {
          target: self.progress,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true,
        })
        const cap = captionRef.current
        if (cap) {
          const o =
            clamp01(seg(self.progress, 0.12, 0.3)) *
            (1 - clamp01(seg(self.progress, 0.78, 0.95)))
          cap.style.opacity = String(o)
          cap.style.transform = `translateY(${(1 - o) * 28}px)`
        }
      },
    })

    return () => {
      st.kill()
      cancelAnimationFrame(raf)
      video.removeEventListener('error', onError)
      sourceEl?.removeEventListener('error', onError)
    }
  }, [reduced, src.remote])

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
            preload="auto"
            poster={asset(poster)}
            crossOrigin="anonymous"
            aria-hidden
          >
            <source src={src.local} type="video/mp4" />
          </video>
          {/* cinematic vignette */}
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
