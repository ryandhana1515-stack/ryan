import { useEffect, useState } from 'react'
import { CERTIFICATIONS, PATENT } from '../data/product'
import Reveal from './Reveal'
import { ICONS } from './icons'

/**
 * TODO: replace these generated placeholder plates with the real certificate scans
 * (patent certificate, GMP certificate, HACCP, ISO 22000) once Bzzworld supplies them.
 */
function CertificatePlate({ label }: { label: string }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.10),rgba(10,17,40,0.9))]">
      <div className="absolute inset-0 flex flex-col gap-2 p-4 blur-[2px]" aria-hidden="true">
        <div className="mx-auto h-6 w-6 rounded-full bg-white/25" />
        <div className="mx-auto h-1.5 w-2/3 rounded bg-white/20" />
        <div className="mx-auto h-1.5 w-1/2 rounded bg-white/15" />
        <div className="mt-3 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-1 w-full rounded bg-white/10" />
          ))}
        </div>
        <div className="mt-auto h-8 w-8 rounded-full border border-white/20" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-navy-900/85 px-3 py-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function Certificates() {
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section className="section border-t border-white/[0.06] bg-navy-900/40">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Patents and certificates</p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="h2 mt-4 max-w-md">
                Strain <span className="text-gradient-cyan">{PATENT.strain}</span>
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="body-lg mt-6 max-w-md">{PATENT.body}</p>
            </Reveal>
            <Reveal delay={270}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {CERTIFICATIONS.map((cert) => {
                  const Icon = ICONS[cert.id]
                  return (
                    <li key={cert.id} className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-cyan-glow/80" />
                      <span className="text-sm text-white/70">{cert.label}</span>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
                {CERTIFICATIONS.map((cert) => (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => setOpen(cert.label)}
                    className="group text-left transition-transform duration-200 hover:-translate-y-1"
                  >
                    <CertificatePlate label={cert.label} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOpen(CERTIFICATIONS[0].label)}
                className="btn-ghost mt-6"
              >
                View certificates
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/90 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${open} certificate`}
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/12 bg-navy-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="h3">{open} certificate</h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="mx-auto mt-5 max-w-[240px]">
              <CertificatePlate label={open} />
            </div>
            <p className="disclaimer mt-4">
              Placeholder image. The signed certificate scan will be published here.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
