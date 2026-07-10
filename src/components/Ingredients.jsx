import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const ingredients = [
  {
    name: 'Lettuce',
    emoji: '🥬',
    badge: 'Top 10 Superfood',
    benefits: ['Various Vitamins, Minerals, Fibers', 'β-Carotene & Vitamin C', 'Prevents skin aging'],
    color: '#4ade80',
  },
  {
    name: 'Garlic',
    emoji: '🧄',
    badge: 'Anticancer',
    benefits: ['Allicin promotes anticancer substances', 'Boosts metabolism', 'Removes active acids → immunity'],
    color: '#fbbf24',
  },
  {
    name: 'Soybean Sprouts',
    emoji: '🌱',
    badge: 'Heart Health',
    benefits: ['Prevents arteriosclerosis', 'Reduces cholesterol', 'Vitamin A, B, Amino Acids'],
    color: '#00dcff',
  },
  {
    name: 'Soybean',
    emoji: '🫘',
    badge: 'Fermented',
    benefits: ['Proprietary fermentation (KACC91554P)', 'Naturally promotes NO generation', 'Optimizes 5 body systems'],
    color: '#a78bfa',
  },
]

export default function Ingredients() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section style={{ padding: '8rem 0', background: '#06091f' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="tag">100% Natural</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff' }}
          >
            Premium Raw Materials<br /><span style={{ color: '#00dcff' }}>Supercharged By Science</span>
          </motion.h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {ingredients.map((ing, i) => (
            <motion.div
              key={ing.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.12 }}
              className="glass"
              style={{ padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
              whileHover={{ y: -6, boxShadow: `0 30px 80px ${ing.color}18` }}
            >
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '70%', height: '1px',
                background: `linear-gradient(to right, transparent, ${ing.color}, transparent)`
              }} />
              <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>{ing.emoji}</div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: ing.color,
                border: `1px solid ${ing.color}44`,
                borderRadius: '100px', padding: '0.25rem 0.75rem',
                marginBottom: '0.8rem'
              }}>{ing.badge}</span>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>{ing.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ing.benefits.map((b, j) => (
                  <div key={j} style={{
                    fontSize: '0.75rem', color: 'rgba(200,212,232,0.6)', lineHeight: 1.5,
                    padding: '0.4rem 0', borderBottom: j < ing.benefits.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                  }}>{b}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{
            marginTop: '4rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'
          }}
        >
          <div className="glass" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ fontSize: '4rem' }}>💊</div>
            <div>
              <div className="bebas" style={{ fontSize: '3rem', color: '#00dcff', lineHeight: 1 }}>3 × 1</div>
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Times per day, 1 pill per time</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(200,212,232,0.5)', marginTop: '0.4rem' }}>
                PTP protector film for superior tightness and freshness
              </div>
            </div>
          </div>
          <div className="glass" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ fontSize: '4rem' }}>❄️</div>
            <div>
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>Storage</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(200,212,232,0.6)', lineHeight: 1.75 }}>
                Store in a cool and dry place.<br />Avoid heat and direct sunlight.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            marginTop: '2rem', padding: '1.25rem 2rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            fontSize: '0.72rem', color: 'rgba(200,212,232,0.35)',
            textAlign: 'center', lineHeight: 1.7
          }}
        >
          * These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
          Consult your healthcare provider before use.
        </motion.div>
      </div>
    </section>
  )
}
