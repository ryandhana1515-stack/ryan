import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'

function StatCard({ number, label, sub, delay }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const numRef = useRef()

  useEffect(() => {
    if (!inView || !numRef.current) return
    const end = parseFloat(number.replace(/[^0-9.]/g, ''))
    const suffix = number.replace(/[0-9.]/g, '')
    gsap.fromTo(numRef.current, { textContent: 0 }, {
      textContent: end,
      duration: 1.8,
      delay: delay * 0.1,
      ease: 'power2.out',
      snap: { textContent: number.includes('.') ? 0.1 : 1 },
      onUpdate() { numRef.current.textContent = numRef.current.textContent + suffix }
    })
  }, [inView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: delay * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass"
      style={{ padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '60%', height: '1px',
        background: 'linear-gradient(to right, transparent, #00dcff, transparent)'
      }} />
      <div
        ref={numRef}
        className="bebas"
        style={{ fontSize: '3.5rem', color: '#00dcff', lineHeight: 1, textShadow: '0 0 30px rgba(0,220,255,0.5)' }}
      >{number}</div>
      <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginTop: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(200,212,232,0.5)', marginTop: '0.3rem' }}>{sub}</div>
    </motion.div>
  )
}

function DeclineBar() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const points = [
    { age: '20s', pct: 100 },
    { age: '30s', pct: 80 },
    { age: '40s', pct: 60 },
    { age: '50+', pct: 35 },
    { age: '60+', pct: 20 },
  ]

  return (
    <div ref={ref} style={{ padding: '2.5rem 0' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', height: '140px' }}>
        {points.map((p, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '100%',
              background: `linear-gradient(to top, #00dcff, rgba(0,168,150,0.4))`,
              borderRadius: '6px 6px 0 0',
              height: inView ? `${p.pct}%` : '0%',
              transition: `height ${0.8 + i * 0.15}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              transitionDelay: `${i * 0.1}s`,
              opacity: 0.3 + (p.pct / 100) * 0.7,
              boxShadow: `0 -4px 20px rgba(0,220,255,${0.1 + (p.pct / 100) * 0.4})`
            }} />
            <span style={{ fontSize: '0.7rem', color: 'rgba(200,212,232,0.6)' }}>{p.age}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: '1rem', fontSize: '0.7rem', color: 'rgba(200,212,232,0.4)',
        textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.12em'
      }}>
        Nitric Oxide Production by Age
      </div>
    </div>
  )
}

export default function Problem() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section style={{ padding: '10rem 0 6rem', background: 'linear-gradient(to bottom, #06091f, #08102e, #06091f)' }}>
      <div className="container">
        <div ref={ref} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="tag">The Silent Decline</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bebas"
            style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)', color: '#fff', marginBottom: '1rem' }}
          >
            85% of Your Nitric Oxide<br />
            <span style={{ color: '#00dcff' }}>Disappears By Age 50</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontSize: '1rem', color: 'rgba(200,212,232,0.6)', maxWidth: '560px', margin: '0 auto' }}
          >
            Nitric Oxide is the molecule your cardiovascular system depends on.
            Without it, blood vessels stiffen, circulation slows, and your risk of serious disease climbs every year.
          </motion.p>
        </div>

        {/* Decline bar + explanation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
          <div>
            <DeclineBar />
          </div>
          <div>
            {[
              { pct: '85%', text: 'NO production capability lost by age 50+', color: '#00dcff' },
              { pct: '50%', text: 'Drop in production every 10 years after 40', color: '#00a896' },
              { pct: '99.9%', text: 'Of human diseases linked to NO deficiency', color: '#d4af37' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.7 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  padding: '1.2rem 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}
              >
                <span className="bebas" style={{ fontSize: '2.2rem', color: item.color, minWidth: '80px', textAlign: 'right' }}>
                  {item.pct}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'rgba(200,212,232,0.7)' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <StatCard number="1.28B" label="Hypertension Patients" sub="Worldwide" delay={0} />
          <StatCard number="537M" label="Adults With Diabetes" sub="Global (2021)" delay={1} />
          <StatCard number="15M" label="Strokes Per Year" sub="87% from blocked blood flow" delay={2} />
          <StatCard number="8.5M" label="Deaths From Hypertension" sub="Annually" delay={3} />
        </div>
      </div>
    </section>
  )
}
