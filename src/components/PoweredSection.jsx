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

function FloatingCoaster() {
  const groupRef = useRef()
  const tex = useMemo(() => createCorkTexture(), [])
  useFrame(s => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.005
    groupRef.current.position.y = Math.sin(s.clock.elapsedTime * 0.9) * 0.12
  })
  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      <mesh>
        <cylinderGeometry args={[1.0, 1.0, 0.2, 256]} />
        <meshStandardMaterial map={tex} roughness={0.93} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.105, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.03, 256]} />
        <meshStandardMaterial color="#7A3C0A" roughness={0.98} />
      </mesh>
    </group>
  )
}

// Simple stylized hands using Three.js geometry
function Hands() {
  const skinColor = '#3D2010'
  const handMat = <meshStandardMaterial color={skinColor} roughness={0.85} metalness={0.05} />

  return (
    <group position={[0, -1.8, 0]}>
      {/* Left hand palm */}
      <mesh position={[-0.5, 0, 0]} rotation={[0.3, 0.15, 0.1]}>
        <boxGeometry args={[0.55, 0.08, 0.42]} />
        {handMat}
      </mesh>
      {/* Left thumb */}
      <mesh position={[-0.28, 0.04, 0.25]} rotation={[0.5, -0.3, -0.4]}>
        <capsuleGeometry args={[0.05, 0.18, 4, 12]} />
        {handMat}
      </mesh>
      {/* Left fingers */}
      {[-0.42, -0.28, -0.14, 0.0].map((x, i) => (
        <mesh key={i} position={[-0.5 + x * 0.3, 0.1, -0.1]} rotation={[-0.4, 0, 0.05 * i]}>
          <capsuleGeometry args={[0.045, 0.22, 4, 12]} />
          {handMat}
        </mesh>
      ))}

      {/* Right hand palm */}
      <mesh position={[0.5, 0, 0]} rotation={[0.3, -0.15, -0.1]}>
        <boxGeometry args={[0.55, 0.08, 0.42]} />
        {handMat}
      </mesh>
      {/* Right thumb */}
      <mesh position={[0.28, 0.04, 0.25]} rotation={[0.5, 0.3, 0.4]}>
        <capsuleGeometry args={[0.05, 0.18, 4, 12]} />
        {handMat}
      </mesh>
      {/* Right fingers */}
      {[0.0, 0.14, 0.28, 0.42].map((x, i) => (
        <mesh key={i} position={[0.5 + x * 0.3, 0.1, -0.1]} rotation={[-0.4, 0, -0.05 * i]}>
          <capsuleGeometry args={[0.045, 0.22, 4, 12]} />
          {handMat}
        </mesh>
      ))}
    </group>
  )
}

function PoweredScene() {
  return (<>
    <color attach="background" args={['#100904']} />
    <ambientLight intensity={0.25} />
    <directionalLight position={[2, 5, 3]} intensity={3.5} color="#FFF5E8" />
    <directionalLight position={[-3, 0, -2]} intensity={0.4} color="#FF8539" />
    <pointLight position={[0, -5, 4]} intensity={2} color="#3A1A05" />
    <Suspense fallback={null}>
      <Environment preset="apartment" />
      <FloatingCoaster />
      <Hands />
    </Suspense>
  </>)
}

export default function PoweredSection() {
  const sectionRef = useRef()
  const stickyRef = useRef()
  const headRef = useRef()
  const subTagRef = useRef()
  const subTextRef = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stickyRef.current,
        pinSpacing: false,
      })

      gsap.fromTo(headRef.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: '5% top', end: '25% top', scrub: 1 } }
      )
      gsap.fromTo(subTagRef.current,
        { opacity: 0 },
        { opacity: 1, scrollTrigger: { trigger: sectionRef.current, start: '10% top', end: '30% top', scrub: 1 } }
      )
      gsap.fromTo(subTextRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, scrollTrigger: { trigger: sectionRef.current, start: '40% top', end: '60% top', scrub: 1 } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '300vh', position: 'relative', background: '#100904' }}>
      <div ref={stickyRef} style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#100904' }}>

        {/* 3D Canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0.8, 4.0], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
            <PoweredScene />
          </Canvas>
        </div>

        {/* Big "Powered by AI*" text */}
        <div ref={headRef} style={{ position: 'absolute', top: '10%', left: 0, zIndex: 2, opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            fontFamily: 'Space Grotesk', fontWeight: 700,
            fontSize: 'clamp(4rem, 18vw, 14rem)',
            lineHeight: 0.88, color: '#F5EFE0',
            letterSpacing: '-0.02em', paddingLeft: '1.5rem',
            whiteSpace: 'nowrap',
          }}>
            Powered<br />by AI*
          </div>
        </div>

        {/* ORYZO-1 label */}
        <div ref={subTagRef} style={{ position: 'absolute', top: '10%', right: '1.5rem', zIndex: 3, opacity: 0 }}>
          <span style={{
            fontFamily: 'Space Grotesk', fontWeight: 700,
            fontSize: '0.82rem', color: '#FF8539',
            letterSpacing: '0.08em',
          }}>ORYZO-1</span>
        </div>

        {/* Bottom caption */}
        <div ref={subTextRef} style={{ position: 'absolute', bottom: '3rem', left: '1.5rem', zIndex: 3, opacity: 0, maxWidth: '280px' }}>
          <p style={{
            fontFamily: 'Space Grotesk', fontWeight: 600,
            fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)',
            lineHeight: 1.5, color: '#F5EFE0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            AI FILLS IN THE GAPS.<br />
            WE SAID HIGH FIVE. IT<br />
            HEARD SIX.
          </p>
        </div>

        {/* Footnote bottom right */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', zIndex: 3, textAlign: 'right' }}>
          <div style={{ height: '1px', background: 'rgba(245,239,224,0.2)', marginBottom: '0.4rem', width: '100px', marginLeft: 'auto' }} />
          <div style={{ fontSize: '0.62rem', color: 'rgba(245,239,224,0.35)', letterSpacing: '0.12em', lineHeight: 1.6, fontWeight: 600 }}>
            * ADOBE<br />ILLUSTRATOR
          </div>
        </div>
      </div>
    </section>
  )
}
