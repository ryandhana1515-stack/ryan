import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Nav() {
  const ref = useRef()
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 })
  }, [])
  return (
    <nav ref={ref} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.5rem 3rem',
      background: 'linear-gradient(to bottom,rgba(5,8,16,0.9),transparent)',
      backdropFilter: 'blur(0px)',
    }}>
      <div className="bebas" style={{ fontSize: '1.3rem', letterSpacing: '0.12em', color: '#fff' }}>
        BIO<span style={{ color: '#00dcff' }}>N:OV</span>
      </div>
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {['Science', 'Benefits', 'Research'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            color: 'rgba(200,212,232,0.6)', fontSize: '0.75rem',
            fontWeight: 500, textDecoration: 'none', letterSpacing: '0.05em',
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.target.style.color = '#00dcff'}
            onMouseLeave={e => e.target.style.color = 'rgba(200,212,232,0.6)'}
          >{l}</a>
        ))}
        <a href="#order" className="btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.72rem' }}>
          Order Now
        </a>
      </div>
    </nav>
  )
}
