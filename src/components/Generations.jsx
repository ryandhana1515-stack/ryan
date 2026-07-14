import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const GENS = [
  {
    gen: '01', name: 'Arginine', era: '1st Generation',
    issues: ['Requires specific enzyme', 'Prohibited for heart patients', 'Nausea, headache, diarrhea'],
    eff: 20, color: 'rgba(200,212,232,0.25)',
  },
  {
    gen: '02', name: 'Vegetable & Fruit Extracts', era: '2nd Generation',
    issues: ['Not suitable for 40+ age group', 'Low absorption rate', 'Slow response time'],
    eff: 50, color: 'rgba(0,168,150,0.6)',
  },
  {
    gen: '03', name: 'BIO N:OV', era: '3rd Generation · Current',
    features: ['No enzyme required', 'Works for all ages & conditions', '30-minute onset', 'Zero side effects', '100% herbal formula', 'Patented strain KACC91554P'],
    eff: 100, color: '#00dcff', highlight: true,
  },
]

export default function Generations() {
  const sectionRef = useRef()
  const cardsRef = useRef([])
  const barRefs = useRef([])
  const headerRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: headerRef.current, start: 'top 80%' }
      })
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.15,
          scrollTrigger: { trigger: card, start: 'top 85%' }
        })
        gsap.fromTo(barRefs.current[i], { scaleX: 0 }, {
          scaleX: 1, duration: 1.2, delay: i * 0.2 + 0.4, ease: 'power3.out',
          transformOrigin: 'left center',
          scrollTrigger: { trigger: card, start: 'top 85%' }
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: '10rem 0', background: '#050810', overflow: 'hidden', position: 'relative' }}>
      {/* Large background number */}
      <div className="bebas" style={{
        position: 'absolute', right: '-2rem', top: '50%', transform: 'translateY(-50%)',
        fontSize: '30vw', color: 'rgba(0,220,255,0.02)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
      }}>NO</div>

      <div className="container" style={{ position: 'relative' }}>
        <div ref={headerRef} style={{ opacity: 0, textAlign: 'center', marginBottom: '6rem' }}>
          <span className="tag" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>Evolution of NO Supplements</span>
          <h2 className="bebas" style={{ fontSize: 'clamp(3rem, 5.5vw, 6rem)', color: '#fff', lineHeight: 0.9 }}>
            Why BIO N:OV Is<br /><span style={{ color: '#00dcff' }}>40–400% More Effective</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: 'rgba(0,220,255,0.08)' }}>
          {GENS.map((g, i) => (
            <div key={i} ref={el => cardsRef.current[i] = el} style={{
              opacity: 0,
              background: g.highlight ? 'rgba(0,220,255,0.04)' : '#050810',
              padding: '3rem 2.5rem', position: 'relative',
              borderTop: g.highlight ? '2px solid #00dcff' : '2px solid transparent',
            }}>
              {g.highlight && (
                <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', padding: '0.3rem 0.8rem', background: 'rgba(0,220,255,0.12)', border: '1px solid rgba(0,220,255,0.3)', borderRadius: '100px', fontSize: '0.62rem', color: '#00dcff', fontWeight: 700, letterSpacing: '0.1em' }}>
                  RECOMMENDED
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <div className="bebas" style={{ fontSize: '4rem', color: g.color, lineHeight: 1, opacity: 0.3 }}>{g.gen}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{g.era}</div>
                <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{g.name}</div>
              </div>

              {/* Efficacy bar */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Efficacy</span>
                  <span className="bebas" style={{ fontSize: '1.2rem', color: g.color }}>{g.eff}%</span>
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px', overflow: 'hidden' }}>
                  <div ref={el => barRefs.current[i] = el} style={{ height: '100%', width: `${g.eff}%`, background: g.color, borderRadius: '1px' }} />
                </div>
              </div>

              {/* Issues or features */}
              {g.issues && g.issues.map((x, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ff3355', fontSize: '0.7rem', marginTop: '0.1rem', flexShrink: 0 }}>✗</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(200,212,232,0.45)' }}>{x}</span>
                </div>
              ))}
              {g.features && g.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: '0.7rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{ color: '#00dcff', fontSize: '0.7rem', marginTop: '0.1rem', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(200,212,232,0.8)' }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Patent callout */}
        <div style={{
          marginTop: '3rem', padding: '2rem 3rem',
          border: '1px solid rgba(0,220,255,0.12)', borderRadius: '4px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
          background: 'rgba(0,220,255,0.02)',
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#00dcff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>Proprietary Technology</div>
            <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Exclusive Fermentation — Strain KACC91554P</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(200,212,232,0.45)', marginTop: '0.2rem' }}>Korea Research Institute of Bioscience and Biotechnology</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {['GMP Certified', 'US Patent', 'Korea Patent'].map(b => (
              <div key={b} style={{ padding: '0.4rem 0.9rem', border: '1px solid rgba(212,175,55,0.35)', borderRadius: '3px', fontSize: '0.7rem', color: '#d4af37', fontWeight: 600, letterSpacing: '0.06em' }}>{b}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
