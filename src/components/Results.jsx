import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  { name: 'David L., 58', country: 'Singapore', text: 'My blood pressure readings improved within the first week. I feel lighter, more energized. Nothing else worked like this.', rating: 5 },
  { name: 'Mei Ling T., 62', country: 'Malaysia', text: 'I was skeptical about supplements, but the science convinced me. My doctor noticed my blood pressure numbers improved significantly.', rating: 5 },
  { name: 'Robert K., 55', country: 'Australia', text: 'After just 30 minutes I can feel the difference. Hands feel warmer, circulation is better. This is the real deal.', rating: 5 },
]

export default function Results() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="results" style={{ padding: '8rem 0', background: 'linear-gradient(to bottom, #060b22, #06091f)' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="tag">Clinical Results</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff' }}
          >
            Numbers That<br /><span style={{ color: '#00dcff' }}>Speak For Themselves</span>
          </motion.h2>
        </div>

        {/* Big result numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '5rem' }}>
          {[
            { n: '30', unit: 'min', label: 'Blood pressure supported', sub: 'Lab tested at Bzzworld Smart Lab', color: '#00dcff' },
            { n: '8%', unit: '', label: 'Blood sugar drop within 1 hour', sub: 'Post-meal glucose stabilization', color: '#00a896' },
            { n: '84%', unit: '', label: 'Of testers saw wrinkle reduction', sub: 'In 100-person skin study', color: '#d4af37' },
          ].map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="glass"
              style={{ padding: '2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(to right, transparent, ${r.color}, transparent)`
              }} />
              <div style={{
                display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem',
                marginBottom: '0.5rem'
              }}>
                <span className="bebas" style={{
                  fontSize: '5rem', color: r.color, lineHeight: 1,
                  textShadow: `0 0 40px ${r.color}66`
                }}>{r.n}</span>
                {r.unit && <span className="bebas" style={{ fontSize: '2rem', color: r.color, opacity: 0.6 }}>{r.unit}</span>}
              </div>
              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: '0.4rem' }}>{r.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(200,212,232,0.45)' }}>{r.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Skin results */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="glass"
          style={{ padding: '2.5rem 3rem', marginBottom: '4rem' }}
        >
          <h3 className="bebas" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
            Skin Study Results — 100 Testers, Ages 15–76
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {[
              { pct: '78%', label: 'Feel Brighter', color: '#f472b6' },
              { pct: '84%', label: 'Wrinkles Reduced', color: '#a78bfa' },
              { pct: '68%', label: 'Pores Shrank', color: '#00dcff' },
              { pct: '68%', label: 'Less Inflammation', color: '#00a896' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="bebas" style={{ fontSize: '3.5rem', color: s.color, textShadow: `0 0 20px ${s.color}55` }}>{s.pct}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(200,212,232,0.6)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
              className="glass"
              style={{ padding: '2rem' }}
            >
              <div style={{ color: '#d4af37', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
                {'★'.repeat(t.rating)}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(200,212,232,0.75)', lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1.2rem' }}>
                "{t.text}"
              </p>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.4)' }}>{t.country}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
