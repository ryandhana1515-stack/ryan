import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SPECS = [
  { label: 'Product', value: 'BIO N:OV' },
  { label: 'Generation', value: '3rd (Latest)' },
  { label: 'Core Technology', value: 'Microbial Fermentation Strain KACC91554P' },
  { label: 'IP Status', value: 'US Patent · Korea Patent' },
  { label: 'Onset Time', value: '30 Minutes' },
  { label: 'Efficacy vs Gen 1', value: '40–400% More Effective' },
  { label: 'Side Effects', value: 'Zero' },
  { label: 'Enzyme Required', value: 'No' },
  { label: 'Suitable Age', value: 'All Ages' },
  { label: 'Format', value: '3 × 1 Capsule Daily' },
  { label: 'Certification', value: 'GMP Certified' },
  { label: 'Origin', value: 'Korea Research Institute of Bioscience & Biotechnology' },
]

const BENEFITS = [
  { icon: '🫀', title: 'Blood Pressure', stat: '30 min', desc: 'Widens arteries, measurably supports healthy blood pressure.' },
  { icon: '🧬', title: 'Anti-Aging', stat: 'DNA', desc: 'Activates telomerase, slows telomere shortening.' },
  { icon: '⚡', title: 'Energy', stat: '∞', desc: 'Restores mitochondrial function and oxygen supply to muscle.' },
  { icon: '💉', title: 'Blood Sugar', stat: '8%', desc: 'Stabilizes insulin and glucose via GABA and antioxidants.' },
  { icon: '✨', title: 'Skin', stat: '84%', desc: '84% wrinkle reduction. 78% brightness improvement.' },
]

export default function SpecSheet() {
  const sectionRef = useRef()
  const rowRefs = useRef([])
  const headerRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: headerRef.current, start: 'top 80%' } }
      )
      rowRefs.current.forEach((row, i) => {
        if (!row) return
        gsap.fromTo(row,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, delay: i * 0.04, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 88%' } }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: '10rem 0', background: 'linear-gradient(to bottom, #050810, #070b1a)' }}>
      <div className="container">

        <div ref={headerRef} style={{ opacity: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem', borderBottom: '1px solid rgba(0,220,255,0.1)', paddingBottom: '2rem' }}>
          <div>
            <span className="tag" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Technical Specifications</span>
            <h2 className="bebas" style={{ fontSize: 'clamp(3rem, 5vw, 5.5rem)', color: '#fff', lineHeight: 0.9 }}>
              Product<br /><span style={{ color: '#00dcff' }}>Spec Sheet</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="bebas" style={{ fontSize: '5rem', color: 'rgba(0,220,255,0.08)', lineHeight: 1 }}>001</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(200,212,232,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Datasheet Rev. 3.0</div>
          </div>
        </div>

        {/* Spec rows */}
        <div style={{ marginBottom: '6rem' }}>
          {SPECS.map((spec, i) => (
            <div key={i} ref={el => rowRefs.current[i] = el} style={{
              opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              gap: '2rem',
            }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', minWidth: '200px' }}>{spec.label}</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, textAlign: 'right' }}>{spec.value}</span>
            </div>
          ))}
        </div>

        {/* Benefits grid */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(0,220,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 700 }}>
            Five System Benefits
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'rgba(0,220,255,0.08)', border: '1px solid rgba(0,220,255,0.08)' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{
                padding: '2rem 1.5rem', background: '#050810',
                transition: 'background 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,220,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = '#050810'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{b.icon}</div>
                <div className="bebas" style={{ fontSize: '2rem', color: '#00dcff', lineHeight: 1 }}>{b.stat}</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, margin: '0.4rem 0' }}>{b.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(200,212,232,0.45)', lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
