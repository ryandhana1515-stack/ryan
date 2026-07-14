import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function OrderSection() {
  const sectionRef = useRef()
  const contentRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current?.children ? Array.from(contentRef.current.children) : [],
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: contentRef.current, start: 'top 75%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="order" style={{ padding: '10rem 0 6rem', background: '#050810', position: 'relative', overflow: 'hidden' }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,220,255,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative' }}>
        <div ref={contentRef} style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ opacity: 0 }}>
            <span className="tag" style={{ marginBottom: '2rem', display: 'inline-flex' }}>Start Today</span>
          </div>
          <h2 className="bebas" style={{
            opacity: 0, fontSize: 'clamp(4rem, 7vw, 8rem)', color: '#fff', lineHeight: 0.88, marginBottom: '1.5rem',
            textShadow: '0 0 80px rgba(0,220,255,0.25)',
          }}>
            Clear The Way<br />To <span style={{ color: '#00dcff' }}>Optimum<br />Health</span>
          </h2>
          <p style={{ opacity: 0, fontSize: '1rem', color: 'rgba(200,212,232,0.55)', lineHeight: 1.8, marginBottom: '3rem' }}>
            Join thousands who have restored their Nitric Oxide levels with the world's most advanced 3rd generation supplement. 100% natural. Patented science. Real results in 30 minutes.
          </p>
          <div style={{ opacity: 0, display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <a href="https://biogreenelixirs.com" className="btn-primary" style={{ fontSize: '0.9rem', padding: '1.1rem 3rem' }}>
              Order BIO N:OV →
            </a>
            <a href="#research" className="btn-ghost" style={{ fontSize: '0.9rem', padding: '1.1rem 2.5rem' }}>
              Read The Research
            </a>
          </div>
          <div style={{ opacity: 0, display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['GMP Certified', '100% Natural', 'Patented Formula', 'Free Shipping'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'rgba(200,212,232,0.4)' }}>
                <span style={{ color: '#00dcff' }}>✓</span> {b}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '6rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
        }}>
          <div className="bebas" style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '0.1em' }}>
            BIO<span style={{ color: '#00dcff' }}>N:OV</span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(200,212,232,0.25)', fontFamily: 'Inter', letterSpacing: '0.08em', fontWeight: 400 }}>by Bio Green Elixirs</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.25)' }}>info@biogreenelixirs.com · Singapore</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(200,212,232,0.2)' }}>© 2024 Bio Green Elixirs. All rights reserved.</div>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '0.65rem', color: 'rgba(200,212,232,0.2)', textAlign: 'center', lineHeight: 1.7 }}>
          * These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
        </div>
      </div>
    </section>
  )
}
