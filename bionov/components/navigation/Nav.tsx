'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { scrollToTarget } from '@/lib/scroll/gsap'

const LINKS = [
  { label: 'Why BIO N:OV', target: '#why-bionov' },
  { label: 'Fermentation', target: '#fermentation' },
  { label: 'Nitric Oxide', target: '#nitric-oxide' },
  { label: 'Wellness', target: '#pillars' },
  { label: 'Research', target: '#research' },
  { label: 'Product', target: '#product-info' },
  { label: 'FAQ', target: '#faq' },
  { label: 'Contact', target: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (target: string) => {
    setOpen(false)
    scrollToTarget(target)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/85 shadow-sm backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`font-display text-lg font-extrabold tracking-tight ${
            scrolled ? 'text-nov-deep' : 'text-white'
          }`}
          aria-label="BIO N:OV — back to top"
        >
          BIO&nbsp;<span className={scrolled ? 'gradient-text' : ''}>N:OV</span>
        </button>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.target}
              onClick={() => go(l.target)}
              className={`text-sm font-semibold transition hover:opacity-70 ${
                scrolled ? 'text-nov-ink' : 'text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          className={`lg:hidden ${scrolled ? 'text-nov-ink' : 'text-white'}`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-nov-mist bg-white/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">
            {LINKS.map((l) => (
              <button
                key={l.target}
                onClick={() => go(l.target)}
                className="py-3 text-left font-display text-sm font-bold text-nov-ink"
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
