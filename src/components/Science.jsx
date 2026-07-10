import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const professors = [
  { name: 'Ph.D. Min Sun Kim', role: 'Cardiovascular Health', uni: 'Wonkwang University School of Medicine, Dean' },
  { name: 'Prof. Dr. Hyun-Ock Pae', role: 'NO & Metabolites', uni: 'Wonkwang University, School of Medicine' },
  { name: 'Prof. Dr. Yong-Il Shin', role: 'Neuro-Rehabilitation', uni: 'Pusan National University, School of Medicine' },
  { name: 'Dr. Cheon Hyun Soo', role: 'Medical Development & Research', uni: 'SunChon National University' },
  { name: 'Dr. Ju Sung-Min', role: 'NO & Lymphatic System', uni: 'Center of TKM, Wonkwang University' },
  { name: 'Dr. Sooah Kim', role: 'Regenerative Medicine', uni: 'College of Medical Science, Jeonju University' },
  { name: 'Prof. Dr. Kim Jong-Suk', role: 'Anti-aging & Cancer', uni: 'Jeonbuk National University Medical School' },
  { name: 'Ass. Prof. A-Lum Han', role: 'Metabolic Diseases & Nutrition', uni: 'University Hospital of Wonkwang' },
]

export default function Science() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="science-team" style={{ padding: '8rem 0', background: '#06091f', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(0,220,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative' }}>
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="tag">The Research</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff' }}
          >
            8 Korean University<br /><span style={{ color: '#00dcff' }}>Professors & Researchers</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.7 }}
            style={{ color: 'rgba(200,212,232,0.55)', fontSize: '1rem', marginTop: '1rem', maxWidth: '560px', margin: '1rem auto 0' }}
          >
            A multi-disciplinary team from Korea's top medical schools, dedicated to
            unlocking the full potential of Nitric Oxide for human health.
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '4rem' }}>
          {professors.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.07 }}
              className="glass"
              style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
              whileHover={{ y: -3 }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,220,255,0.2), rgba(0,168,150,0.1))',
                border: '1px solid rgba(0,220,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', marginBottom: '0.8rem'
              }}>
                🎓
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem', lineHeight: 1.3 }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#00dcff', fontWeight: 600, marginBottom: '0.4rem' }}>
                {p.role}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(200,212,232,0.45)', lineHeight: 1.5 }}>
                {p.uni}
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            padding: '3rem',
            background: 'linear-gradient(135deg, rgba(0,220,255,0.04), rgba(0,168,150,0.04))',
            border: '1px solid rgba(0,220,255,0.15)',
            borderRadius: '20px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h3 className="bebas" style={{ fontSize: '2.2rem', color: '#fff' }}>
              How BIO N:OV Makes<br /><span style={{ color: '#00dcff' }}>Blood Vessels Younger</span>
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', position: 'relative' }}>
            {[
              { pct: '100%', label: 'Vessel Relaxed', detail: 'Sufficient NO — broad, smooth, elastic', color: '#00dcff' },
              { pct: '80%', label: 'Arterial Thickening', detail: 'First signs of stiffness', color: '#00c4e0' },
              { pct: '50%', label: 'Inflammation', detail: 'Clumped, slow blood flow', color: '#00a0b0' },
              { pct: '35%', label: 'Atherosclerosis', detail: 'Dangerous buildup begins', color: '#cc4400' },
              { pct: '15%', label: 'Vessel Rupture', detail: 'Critical — stroke risk', color: '#ff2244' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 0.75rem', position: 'relative' }}>
                {i < 4 && (
                  <div style={{
                    position: 'absolute', right: '-1px', top: '20px', width: '2px', height: '40px',
                    background: 'rgba(255,255,255,0.08)'
                  }} />
                )}
                <div className="bebas" style={{ fontSize: '2rem', color: step.color, lineHeight: 1 }}>{step.pct}</div>
                <div style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, margin: '0.4rem 0 0.3rem' }}>{step.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.45)', lineHeight: 1.5 }}>{step.detail}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '2rem', padding: '1rem 2rem',
            background: 'rgba(0,220,255,0.06)', borderRadius: '10px',
            textAlign: 'center', fontSize: '0.85rem', color: 'rgba(200,212,232,0.65)'
          }}>
            <span style={{ color: '#00dcff', fontWeight: 700 }}>BIO N:OV</span> generates NO instantly, keeping your vessels in the{' '}
            <span style={{ color: '#00dcff' }}>100% zone</span> — relaxed, broad, and elastic.
          </div>
        </motion.div>
      </div>
    </section>
  )
}
