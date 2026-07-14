import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROFS = [
  { name: 'Ph.D. Min Sun Kim', role: 'Cardiovascular Health', uni: 'Wonkwang University School of Medicine, Dean' },
  { name: 'Prof. Dr. Hyun-Ock Pae', role: 'NO & Metabolites', uni: 'Wonkwang University, School of Medicine' },
  { name: 'Prof. Dr. Yong-Il Shin', role: 'Neuro-Rehabilitation', uni: 'Pusan National University, School of Medicine' },
  { name: 'Dr. Cheon Hyun Soo', role: 'Medical Development', uni: 'SunChon National University' },
  { name: 'Dr. Ju Sung-Min', role: 'NO & Lymphatic System', uni: 'Center of TKM, Wonkwang University' },
  { name: 'Dr. Sooah Kim', role: 'Regenerative Medicine', uni: 'College of Medical Science, Jeonju University' },
  { name: 'Prof. Dr. Kim Jong-Suk', role: 'Anti-aging & Cancer', uni: 'Jeonbuk National University Medical School' },
  { name: 'Ass. Prof. A-Lum Han', role: 'Metabolic Diseases', uni: 'University Hospital of Wonkwang' },
]

const RESULTS = [
  { n: '30', unit: 'min', label: 'Blood pressure supported', sub: 'Lab tested at Bzzworld Smart Lab' },
  { n: '8%', unit: '', label: 'Blood sugar drop in 1 hour', sub: 'Post-meal glucose stabilization' },
  { n: '84%', unit: '', label: 'Wrinkle reduction in testers', sub: '100-person skin study' },
]

export default function Research() {
  const sectionRef = useRef()
  const headerRef = useRef()
  const gridRef = useRef()
  const resultsRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: headerRef.current, start: 'top 80%' }
      })
      gsap.fromTo(gridRef.current?.children ? Array.from(gridRef.current.children) : [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } }
      )
      gsap.fromTo(resultsRef.current?.children ? Array.from(resultsRef.current.children) : [],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, scrollTrigger: { trigger: resultsRef.current, start: 'top 80%' } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="research" style={{ padding: '10rem 0', background: 'linear-gradient(to bottom, #070b1a, #050810)', position: 'relative', overflow: 'hidden' }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.02,
        backgroundImage: 'linear-gradient(rgba(0,220,255,1) 1px, transparent 1px), linear-gradient(90deg,rgba(0,220,255,1) 1px,transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        <div ref={headerRef} style={{ opacity: 0, textAlign: 'center', marginBottom: '6rem' }}>
          <span className="tag" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>The Research</span>
          <h2 className="bebas" style={{ fontSize: 'clamp(3rem, 5.5vw, 6rem)', color: '#fff', lineHeight: 0.9 }}>
            8 Korean University<br /><span style={{ color: '#00dcff' }}>Professors & Doctors</span>
          </h2>
        </div>

        {/* Professors grid */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(0,220,255,0.07)', marginBottom: '6rem' }}>
          {PROFS.map((p, i) => (
            <div key={i} style={{
              padding: '1.8rem 1.5rem', background: '#050810', transition: 'background 0.25s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,220,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = '#050810'}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,220,255,0.15), rgba(0,168,150,0.08))',
                border: '1px solid rgba(0,220,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', marginBottom: '0.8rem',
              }}>🎓</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem', lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#00dcff', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.04em' }}>{p.role}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.35)', lineHeight: 1.5 }}>{p.uni}</div>
            </div>
          ))}
        </div>

        {/* Results numbers */}
        <div style={{ borderTop: '1px solid rgba(0,220,255,0.1)', paddingTop: '5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(0,220,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>
            Clinical Results
          </div>
          <div ref={resultsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(0,220,255,0.07)' }}>
            {RESULTS.map((r, i) => (
              <div key={i} style={{ padding: '3rem 2.5rem', background: '#050810', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(to right, transparent, #00dcff, transparent)' }} />
                <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span className="bebas" style={{ fontSize: '5.5rem', color: '#00dcff', lineHeight: 1, textShadow: '0 0 40px rgba(0,220,255,0.4)' }}>{r.n}</span>
                  {r.unit && <span className="bebas" style={{ fontSize: '2.2rem', color: '#00dcff', opacity: 0.5 }}>{r.unit}</span>}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600, marginTop: '0.5rem' }}>{r.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.35)', marginTop: '0.3rem' }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
