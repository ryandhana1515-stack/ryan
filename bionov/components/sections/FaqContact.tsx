'use client'

import { useState } from 'react'
import { ChevronDown, Mail, Globe } from 'lucide-react'
import Reveal from '@/components/scroll/Reveal'
import { faq, disclaimer } from '@/data/site-content'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="bg-nov-mist/60 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal effect="clip-up">
          <h2 className="text-center font-display text-3xl font-extrabold text-nov-ink md:text-5xl">
            Frequently Asked Questions
          </h2>
        </Reveal>
        <div className="mt-12 space-y-4">
          {faq.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} effect="rise" delay={i * 0.05}>
                <div className="nov-card overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display font-bold text-nov-ink">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-nov-blue transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 leading-relaxed text-nov-ink/70">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="bg-white py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal effect="clip-up">
          <h2 className="font-display text-3xl font-extrabold text-nov-ink md:text-5xl">
            Get in Touch
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-nov-ink/70">
            Questions about BIO N:OV, distribution or partnership? We would love to hear from you.
          </p>
        </Reveal>
        <Reveal effect="rise" delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <a
              href="mailto:info@biogreenelixirs.com"
              className="inline-flex items-center gap-2.5 rounded-full bg-nov-gradient px-7 py-3.5 font-display text-sm font-bold text-white shadow-lg transition hover:opacity-90"
            >
              <Mail className="h-4 w-4" aria-hidden /> info@biogreenelixirs.com
            </a>
            <a
              href="https://biogreenelixirs.com"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-nov-blue/25 px-7 py-3.5 font-display text-sm font-bold text-nov-blue transition hover:border-nov-blue/60"
            >
              <Globe className="h-4 w-4" aria-hidden /> biogreenelixirs.com
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function MedicalDisclaimer() {
  return (
    <section id="disclaimer" aria-label="Medical disclaimer" className="bg-nov-mist/60 py-16">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-nov-blue/15 bg-white p-8">
          <h2 className="font-display text-lg font-extrabold text-nov-ink">Medical Disclaimer</h2>
          <p className="mt-3 text-sm leading-relaxed text-nov-ink/70">{disclaimer}</p>
        </div>
      </div>
    </section>
  )
}
