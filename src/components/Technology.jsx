import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const gens = [
  {
    gen: '1st', name: 'Arginine', color: '#4a4a6a',
    issues: ['Enzyme Needed & Unstable', 'Prohibited For Heart Patients', 'Nausea, Diarrhea, Headache'],
    eff: 20,
  },
  {
    gen: '2nd', name: 'Vegetable & Fruit Extracts', color: '#006080',
    issues: ['Not Suitable for 40+ Age', 'Low absorption rate', 'Slow response time'],
    eff: 50,
  },
  {
    gen: '3rd', name: 'BIO N:OV', color: '#00dcff',
    badge: 'Patented · KACC91554P',
    features: ['No Enzyme Needed', 'Works on EVERYONE', 'Superfast 30-Min Response', 'Zero Side Effects', 'Pure Herbal Formula'],
    eff: 100,
  },
]

export default function Technology() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="science" style={{ padding: '8rem 0', background: '#06091f' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="tag">Innovation</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff' }}
          >
            The World's First<br /><span style={{ color: '#00dcff' }}>3rd Generation NO Supplement</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.7 }}
            style={{ color: 'rgba(200,212,232,0.55)', fontSize: '1rem', marginTop: '1rem' }}
          >
            40–400% more effective than conventional supplements
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {gens.map((g, i) => (
            <motion.div
              key={g.gen}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="glass"
              style={{
                padding: '2rem',
                border: g.gen === '3rd' ? '1px solid #00dcff' : '1px solid rgba(0,220,255,0.1)',
                boxShadow: g.gen === '3rd' ? '0 0 60px rgba(0,220,255,0.12), inset 0 1px 0 rgba(0,220,255,0.15)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                transform: g.gen === '3rd' ? 'scale(1.03)' : 'none',
              }}
            >
              {g.gen === '3rd' && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: 'linear-gradient(to right, transparent, #00dcff, transparent)'
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: g.color, display: 'block', marginBottom: '0.4rem'
                  }}>{g.gen} Generation</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{g.name}</h3>
                </div>
                <div className="bebas" style={{
                  fontSize: '2.5rem', color: g.color,
                  textShadow: g.gen === '3rd' ? '0 0 20px rgba(0,220,255,0.6)' : 'none'
                }}>
                  {g.eff}%
                </div>
              </div>

              {/* Effectiveness bar */}
              <div style={{
                height: '3px', background: 'rgba(255,255,255,0.06)',
                borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${g.eff}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.5 + i * 0.2, ease: 'easeOut' }}
                  style={{
                    height: '100%', background: g.color,
                    boxShadow: g.gen === '3rd' ? `0 0 12px ${g.color}` : 'none'
                  }}
                />
              </div>

              {g.issues && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {g.issues.map((issue, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#ff4466', fontSize: '0.8rem' }}>✕</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(200,212,232,0.5)' }}>{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {g.features && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {g.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: '#00dcff', fontSize: '0.8rem' }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: 'rgba(200,212,232,0.85)' }}>{f}</span>
                    </div>
                  ))}
                  {g.badge && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.5rem 1rem',
                      background: 'rgba(0,220,255,0.08)',
                      border: '1px solid rgba(0,220,255,0.25)',
                      borderRadius: '8px',
                      fontSize: '0.7rem', color: '#00dcff',
                      fontWeight: 600, letterSpacing: '0.08em',
                      textAlign: 'center'
                    }}>
                      {g.badge}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Microbial fermentation callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{
            marginTop: '3rem',
            padding: '2rem 3rem',
            background: 'linear-gradient(135deg, rgba(0,220,255,0.05), rgba(0,168,150,0.05))',
            border: '1px solid rgba(0,220,255,0.15)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: '#00dcff', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Proprietary Technology
            </div>
            <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
              Exclusive Microbial Fermentation — Strain KACC91554P
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(200,212,232,0.55)', marginTop: '0.3rem' }}>
              Owned by Korea Research Institute of Bioscience and Biotechnology
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['GMP Certified', 'US Patent', 'Korea Patent'].map(b => (
              <div key={b} style={{
                padding: '0.5rem 1rem',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: '8px',
                fontSize: '0.72rem', color: '#d4af37', fontWeight: 600,
                letterSpacing: '0.06em', whiteSpace: 'nowrap'
              }}>{b}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
