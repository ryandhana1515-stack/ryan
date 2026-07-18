import { disclaimer, product } from '@/data/site-content'

export default function Footer() {
  return (
    <footer className="bg-[#0f2b66] py-14 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-extrabold">
              BIO <span className="text-nov-cyan">N:OV</span>
            </p>
            <p className="mt-2 text-sm text-white/65">{product.tagline}</p>
            <p className="mt-4 text-xs text-white/50">
              {product.korean} · {product.spec}
              <br />
              Exclusive @ Bzzworld
            </p>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white/80">
              Product
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              <li>GMP Certified</li>
              <li>Patented fermentation technology</li>
              <li>Proprietary strain {product.strain}</li>
              <li>Health functional food</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white/80">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              <li><a href="#disclaimer" className="hover:text-white">Medical Disclaimer</a></li>
              <li><a href="#disclaimer" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#disclaimer" className="hover:text-white">Terms &amp; Conditions</a></li>
              <li><a href="#disclaimer" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/15 pt-6 text-[11px] leading-relaxed text-white/45">
          {disclaimer}
        </p>
        <p className="mt-4 text-[11px] text-white/40">
          © {new Date().getFullYear()} Bio Green Elixirs Pte. Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
