import { BRAND, LEGAL_DISCLAIMER } from '../data/product'

const SOCIALS = [
  // TODO: point these at the live Bio Green Elixirs accounts.
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: '#' },
  { label: 'Facebook', href: '#' },
]

const LINKS = [
  { label: 'Shipping', href: '#' },
  { label: 'Returns', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy', href: '#' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-navy-900 pb-28 pt-14 lg:pb-14">
      <div className="shell">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight">
              BIO <span className="text-gradient-cyan">N:OV</span>
            </p>
            <p className="mt-2 text-sm text-white/50">{BRAND.tagline}</p>
            <p className="mt-4 text-[13px] text-white/50">
              Distributed by {BRAND.distributor}. {BRAND.exclusivity}.
            </p>
          </div>

          <div className="flex gap-12">
            <nav aria-label="Support">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Support
              </p>
              <ul className="mt-4 space-y-2.5">
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Follow
              </p>
              <ul className="mt-4 space-y-2.5">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="hairline my-10" />

        <p className="disclaimer max-w-3xl">{LEGAL_DISCLAIMER}</p>
        <p className="disclaimer mt-4">
          &copy; {new Date().getFullYear()} {BRAND.distributor}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
