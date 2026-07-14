import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

function createCorkTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#C87020'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * size, y = Math.random() * size
    const v = (Math.random() - 0.5) * 55
    const r = Math.round(Math.min(255, Math.max(0, 200 + v)))
    const g = Math.round(Math.min(255, Math.max(0, 112 + v * 0.7)))
    const b = Math.round(Math.min(255, Math.max(0, 24 + v * 0.3)))
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.beginPath()
    ctx.ellipse(x, y, Math.random() * 2.5, Math.random() * 1.2, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  return new THREE.CanvasTexture(canvas)
}

function Coaster({ scrollRef }) {
  const groupRef = useRef()
  const tex = useMemo(() => createCorkTexture(), [])
  const autoRotY = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return
    const p = scrollRef.current
    autoRotY.current += 0.004
    groupRef.current.rotation.x = p * 1.35
    groupRef.current.rotation.y = autoRotY.current
    groupRef.current.rotation.z = p * 0.15
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.06
    groupRef.current.scale.setScalar(1 + p * 0.08)
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <cylinderGeometry args={[1.15, 1.15, 0.22, 256, 1]} />
        <meshStandardMaterial map={tex} roughness={0.93} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.04, 256, 1]} />
        <meshStandardMaterial color="#7A3C0A" roughness={0.98} metalness={0} />
      </mesh>
    </group>
  )
}

function Scene({ scrollRef }) {
  return (<>
    <color attach="background" args={['#100904']} />
    <ambientLight intensity={0.3} />
    <directionalLight position={[3, 5, 4]} intensity={3} color="#FFF8F0" />
    <directionalLight position={[-4, 1, -3]} intensity={0.5} color="#FF8539" />
    <pointLight position={[0, -4, 3]} intensity={1.5} color="#60300A" />
    <Suspense fallback={null}>
      <Environment preset="apartment" />
      <Coaster scrollRef={scrollRef} />
    </Suspense>
  </>)
}

export default function ScrollStory() {
  const sectionRef = useRef()
  const stickyRef = useRef()
  const scrollProgress = useRef(0)

  // Text refs
  const line1Ref = useRef(), line2Ref = useRef()
  const subRef = useRef(), footnoteRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stickyRef.current,
        pinSpacing: false,
        onUpdate: self => { scrollProgress.current = self.progress },
      })

      // "ISN'T JUST" fades in then brightens
      gsap.fromTo(line1Ref.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: '5% top', end: '20% top', scrub: 1 } }
      )
      // "A COASTER." fades in
      gsap.fromTo(line2Ref.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1,
          scrollTrigger: { trigger: sectionRef.current, start: '10% top', end: '25% top', scrub: 1 } }
      )
      // sub text
      gsap.fromTo(subRef.current,
        { opacity: 0 },
        { opacity: 1, scrollTrigger: { trigger: sectionRef.current, start: '20% top', end: '35% top', scrub: 1 } }
      )
      gsap.fromTo(footnoteRef.current,
        { opacity: 0 },
        { opacity: 1, scrollTrigger: { trigger: sectionRef.current, start: '25% top', end: '40% top', scrub: 1 } }
      )
      // fade out all text halfway through
      gsap.to([line1Ref.current, line2Ref.current, subRef.current],
        { opacity: 0, y: -40,
          scrollTrigger: { trigger: sectionRef.current, start: '55% top', end: '70% top', scrub: 1 } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '350vh', position: 'relative', background: '#100904' }}>
      <div ref={stickyRef} style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#100904' }}>

        {/* 3D Canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0.5, 4.2], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
            <Scene scrollRef={scrollProgress} />
          </Canvas>
        </div>

        {/* Overlay text */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 1.5rem', pointerEvents: 'none' }}>

          <div ref={line1Ref} style={{ opacity: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk', fontWeight: 300,
              fontSize: 'clamp(3rem, 13vw, 9rem)',
              lineHeight: 0.9, color: 'rgba(245,239,224,0.38)',
              letterSpacing: '-0.02em',
            }}>ISN'T JUST</div>
          </div>

          <div ref={line2Ref} style={{ opacity: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk', fontWeight: 700,
              fontSize: 'clamp(3rem, 13vw, 9rem)',
              lineHeight: 0.9, color: '#F5EFE0',
              letterSpacing: '-0.02em',
            }}>A COASTER.</div>
          </div>

          <div ref={subRef} style={{ opacity: 0, marginTop: '3rem' }}>
            <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', color: 'rgba(245,239,224,0.75)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
              Oryzo isn't just a coaster. It's the result of<br />unprecedented AI* breakthroughs.
            </p>
          </div>
        </div>

        {/* Footnote bottom right */}
        <div ref={footnoteRef} style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', zIndex: 3, textAlign: 'right', opacity: 0 }}>
          <div style={{ height: '1px', background: 'rgba(245,239,224,0.2)', marginBottom: '0.4rem', width: '120px', marginLeft: 'auto' }} />
          <div style={{ fontSize: '0.62rem', color: 'rgba(245,239,224,0.35)', letterSpacing: '0.12em', lineHeight: 1.6, fontWeight: 600 }}>
            * ADOBE<br />ILLUSTRATOR
          </div>
        </div>
      </div>
    </section>
  )
}
