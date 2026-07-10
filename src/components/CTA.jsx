import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTA() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="order" style={{ padding: '10rem 0 6rem', background: 'linear-gradient(to bottom, #06091f, #080c25)' }}>
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            textAlign: 'center',
            padding: '6rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(0,220,255,0.06), rgba(0,168,150,0.03), rgba(0,220,255,0.06))',
            border: '1px solid rgba(0,220,255,0.2)',
          }}
        >
          {/* Glow orbs */}
          <div style={{
            position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,220,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <span className="tag" style={{ marginBottom: '2rem' }}>Start Today</span>
          <h2
            className="bebas glow-text"
            style={{ fontSize: 'clamp(3rem, 6vw, 7rem)', color: '#fff', lineHeight: 0.9, marginBottom: '1.5rem' }}
          >
            Clear The Way To<br />
            <span style={{ color: '#00dcff' }}>Optimum Health</span>
          </h2>
          <p style={{
            fontSize: '1.05rem', color: 'rgba(200,212,232,0.6)',
            maxWidth: '520px', margin: '0 auto 3rem', lineHeight: 1.75
          }}>
            Join thousands who have taken control of their health with the world's
            most advanced nitric oxide supplement. 100% natural. Patented science.
            Real results.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://biogreenelixirs.com" className="btn-primary" style={{ fontSize: '0.95rem', padding: '1.1rem 3rem' }}>
              Order BIO N:OV Now →
            </a>
            <a href="#science-team" className="btn-ghost" style={{ fontSize: '0.95rem', padding: '1.1rem 2.5rem' }}>
              Read The Research
            </a>
          </div>

          <div style={{
            marginTop: '3rem', display: 'flex', gap: '2.5rem',
            justifyContent: 'center', flexWrap: 'wrap'
          }}>
            {['GMP Certified', '100% Natural', 'Patented Formula', 'Free Shipping'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'rgba(200,212,232,0.5)' }}>
                <span style={{ color: '#00dcff' }}>✓</span> {b}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{
          marginTop: '6rem', paddingTop: '3rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <div className="bebas" style={{ fontSize: '1.3rem', color: '#00dcff', letterSpacing: '0.1em' }}>
            BIO<span style={{ color: '#fff' }}> N:OV</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.3)', display: 'block', letterSpacing: '0.08em', fontFamily: 'Inter' }}>
              by Bio Green Elixirs
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(200,212,232,0.3)' }}>
            info@biogreenelixirs.com · Singapore
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.25)' }}>
            © 2024 Bio Green Elixirs. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  )
}
