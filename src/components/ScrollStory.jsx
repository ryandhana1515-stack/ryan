import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SLIDES = [
  {
    label: 'The Problem',
    headline: '85% of your\nNitric Oxide\ndisappears\nby age 50',
    sub: 'Nitric Oxide is the molecule your cardiovascular system depends on. After 40, production drops 50% every decade.',
    accent: '#00dcff',
  },
  {
    label: 'The Consequence',
    headline: 'Stiff arteries.\nSlow blood.\nRising risk.',
    sub: '1.28 billion people suffer from hypertension. 99.9% of human diseases are linked to Nitric Oxide deficiency.',
    accent: '#00dcff',
  },
  {
    label: 'The Breakthrough',
    headline: 'Third\nGeneration\nNO Technology',
    sub: 'No enzyme needed. Works on everyone. 40–400% more effective than conventional supplements. Results in 30 minutes.',
    accent: '#00dcff',
  },
  {
    label: 'The Science',
    headline: 'Patented\nKorean\nBiotechnology',
    sub: 'Strain KACC91554P. Owned by Korea Research Institute of Bioscience & Biotechnology. 8 university professors. US & Korea patents.',
    accent: '#00dcff',
  },
]

export default function ScrollStory() {
  const sectionRef = useRef()
  const stickyRef = useRef()
  const slideRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the sticky container for the duration of all slides
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stickyRef.current,
        pinSpacing: false,
      })

      // Animate each slide in/out
      slideRefs.current.forEach((slide, i) => {
        if (!slide) return
        const total = SLIDES.length
        const label = slide.querySelector('.slide-label')
        const headline = slide.querySelectorAll('.slide-word')
        const sub = slide.querySelector('.slide-sub')
        const line = slide.querySelector('.slide-line')

        // entrance
        gsap.fromTo([label, ...headline, sub, line],
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${(i / total) * 100}% top`,
              end: `${((i + 0.5) / total) * 100}% top`,
              scrub: 1,
            }
          }
        )
        // exit
        gsap.to([label, ...headline, sub, line],
          {
            opacity: 0, y: -40,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `${((i + 0.65) / total) * 100}% top`,
              end: `${((i + 1) / total) * 100}% top`,
              scrub: 1,
            }
          }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="science" style={{ height: `${SLIDES.length * 100}vh`, position: 'relative' }}>
      <div ref={stickyRef} style={{ height: '100vh', position: 'relative', background: '#050810', overflow: 'hidden' }}>

        {/* Background radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,220,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: 'linear-gradient(rgba(0,220,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px', pointerEvents: 'none',
        }} />

        {/* Slide content layers */}
        {SLIDES.map((slide, i) => (
          <div key={i} ref={el => slideRefs.current[i] = el} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            padding: '0 8vw', pointerEvents: 'none',
          }}>
            <div style={{ maxWidth: '55%' }}>
              <div className="slide-label tag" style={{ opacity: 0, marginBottom: '2rem', display: 'inline-flex' }}>
                {slide.label}
              </div>
              <div style={{ overflow: 'hidden' }}>
                {slide.headline.split('\n').map((word, j) => (
                  <div key={j} className="bebas slide-word" style={{
                    opacity: 0,
                    fontSize: 'clamp(3.5rem, 6.5vw, 7rem)',
                    lineHeight: 0.9, color: j === 0 ? '#fff' : slide.accent,
                    display: 'block',
                  }}>{word}</div>
                ))}
              </div>
              <p className="slide-sub" style={{
                opacity: 0, fontSize: '1rem', color: 'rgba(200,212,232,0.55)',
                lineHeight: 1.8, marginTop: '2rem', maxWidth: '440px',
              }}>{slide.sub}</p>
              <div className="slide-line" style={{
                opacity: 0, marginTop: '2rem', height: '1px',
                background: `linear-gradient(to right, ${slide.accent}, transparent)`,
                width: '200px',
              }} />
            </div>

            {/* Right side — slide counter */}
            <div style={{ position: 'absolute', right: '4vw', top: '50%', transform: 'translateY(-50%)', textAlign: 'right' }}>
              <div className="bebas" style={{ fontSize: '8rem', color: 'rgba(0,220,255,0.06)', lineHeight: 1 }}>0{i + 1}</div>
            </div>
          </div>
        ))}

        {/* Scroll progress bar */}
        <div style={{ position: 'absolute', left: '3rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{ width: '2px', height: '40px', background: 'rgba(0,220,255,0.15)', borderRadius: '1px' }}>
              <div style={{ width: '100%', background: '#00dcff', height: '100%', borderRadius: '1px', opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
