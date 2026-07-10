import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const benefits = [
  {
    icon: '🫀',
    title: 'Blood Pressure',
    stat: '30 min',
    statLabel: 'to take effect',
    desc: 'Relaxes and widens blood vessels, supporting healthy blood pressure levels rapidly after intake.',
    color: '#00dcff',
  },
  {
    icon: '🩸',
    title: 'Blood Sugar',
    stat: '8%',
    statLabel: 'drop in 1 hour',
    desc: 'Stabilizes insulin and glucose levels through GABA, polyphenols, and antioxidant action.',
    color: '#00a896',
  },
  {
    icon: '⚡',
    title: 'Energy & Vigor',
    stat: '∞',
    statLabel: 'Stay active all day',
    desc: 'Restores mitochondrial function and increases oxygen supply to skeletal muscle for lasting energy.',
    color: '#d4af37',
  },
  {
    icon: '🧬',
    title: 'Anti-Aging',
    stat: 'DNA',
    statLabel: 'Telomere protection',
    desc: 'Activates telomerase via NO generation, slowing the shortening of telomeres and the aging process.',
    color: '#a78bfa',
  },
  {
    icon: '✨',
    title: 'Skin & Glow',
    stat: '84%',
    statLabel: 'Wrinkle reduction',
    desc: '78% of testers felt brighter. 68% saw pore shrinkage and reduced inflammation. Real results.',
    color: '#f472b6',
  },
]

export default function Benefits() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="benefits" style={{ padding: '8rem 0', background: 'linear-gradient(to bottom, #06091f, #060b22)' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="tag">What NO Does For You</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff' }}
          >
            Five Ways BIO N:OV<br /><span style={{ color: '#00dcff' }}>Transforms Your Health</span>
          </motion.h2>
        </div>

        {/* Featured first benefit */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass"
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem',
            padding: '3rem', marginBottom: '1.5rem',
            border: '1px solid rgba(0,220,255,0.2)',
            boxShadow: '0 0 80px rgba(0,220,255,0.06)'
          }}
        >
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🫀</div>
            <div style={{ fontSize: '0.7rem', color: '#00dcff', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Primary Benefit
            </div>
            <h3 className="bebas" style={{ fontSize: '3rem', color: '#fff', marginBottom: '1rem' }}>
              Blood Pressure<br />Control
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(200,212,232,0.65)', lineHeight: 1.75 }}>
              BIO N:OV releases NO instantly on contact with stomach acid. This widens arteries,
              improves blood flow, and measurably supports blood pressure — all within 30 minutes.
              Proven in clinical lab tests at Bzzworld Smart Lab.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Vessel Diameter', change: '+' },
              { label: 'Blood Flow', change: '+' },
              { label: 'Blood Pressure', change: '↓' },
              { label: 'Vessel Elasticity', change: '+' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(0,220,255,0.04)', border: '1px solid rgba(0,220,255,0.12)',
                borderRadius: '12px', padding: '1.2rem', textAlign: 'center'
              }}>
                <div className="bebas" style={{ fontSize: '2.5rem', color: '#00dcff', lineHeight: 1 }}>{item.change}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(200,212,232,0.6)', marginTop: '0.4rem' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Remaining 4 benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {benefits.slice(1).map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
              className="glass"
              style={{
                padding: '1.8rem',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              whileHover={{ y: -4, boxShadow: `0 20px 60px ${b.color}22` }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{b.icon}</div>
              <div className="bebas" style={{ fontSize: '2rem', color: b.color, lineHeight: 1 }}>{b.stat}</div>
              <div style={{ fontSize: '0.65rem', color: b.color, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{b.statLabel}</div>
              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '0.6rem' }}>{b.title}</h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(200,212,232,0.55)', lineHeight: 1.7 }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
