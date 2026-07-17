import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

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

function Coaster({ rotX = 0, rotY = 0, posY = 0 }) {
  const groupRef = useRef()
  const tex = useMemo(() => createCorkTexture(), [])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = posY + Math.sin(state.clock.elapsedTime * 0.8) * 0.04
  })

  return (
    <group ref={groupRef}>
      {/* Main disc body */}
      <mesh>
        <cylinderGeometry args={[1.15, 1.15, 0.22, 256, 1]} />
        <meshStandardMaterial map={tex} roughness={0.93} metalness={0.02} />
      </mesh>
      {/* Inner concave bowl - darker recessed area */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.93, 0.93, 0.04, 256, 1]} />
        <meshStandardMaterial color="#7A3C0A" roughness={0.98} metalness={0} />
      </mesh>
    </group>
  )
}

function HeroScene() {
  return (<>
    <color attach="background" args={['#2A3828']} />
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 8, 5]} intensity={3.2} color="#FFF8EE" castShadow />
    <directionalLight position={[-4, 2, -1]} intensity={0.5} color="#A8C890" />
    <pointLight position={[0, -2, 3]} intensity={1.0} color="#804818" />
    <Suspense fallback={null}>
      <Environment preset="apartment" />
      <Coaster rotX={0} posY={0} />
    </Suspense>
  </>)
}

export default function Hero() {
  return (
    <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#2A3828' }}>

      {/* Cutting mat grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      {/* Ruler left side */}
      <div style={{
        position: 'absolute', left: 0, top: '8%', bottom: '35%', width: '32px', zIndex: 2,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '0 6px', pointerEvents: 'none',
      }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <div style={{ width: i % 5 === 0 ? '10px' : '6px', height: '1px', background: 'rgba(255,255,255,0.25)' }} />
            {i % 5 === 0 && <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Grotesk' }}>{150 - i * 10}</span>}
          </div>
        ))}
      </div>

      {/* Bottom gradient to dark */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, transparent, #100904)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, padding: '0 1.5rem' }}>

        {/* Small tagline */}
        <div style={{
          textAlign: 'center', paddingTop: '5rem',
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.18em',
          color: 'rgba(245,239,224,0.8)', textTransform: 'uppercase',
        }}>
          MADE FOR MUGS. BUILT FOR TABLES.
        </div>

        {/* Giant ORYZO */}
        <h1 style={{
          fontFamily: 'Syne, Space Grotesk, sans-serif', fontWeight: 800,
          fontSize: 'clamp(5rem, 30.5vw, 28rem)',
          lineHeight: 0.82, color: '#F5EFE0',
          textAlign: 'center', letterSpacing: '-0.03em',
          margin: '0.08em 0',
        }}>
          ORYZO
        </h1>

        {/* Description */}
        <p style={{
          textAlign: 'center', fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
          lineHeight: 1.6, color: '#F5EFE0', maxWidth: '480px',
          margin: '0 auto 0',
          fontWeight: 400,
        }}>
          Designed to lift, insulate,<br />
          and grip in all the right ways.<br />
          Oryzo makes the simplest<br />
          moment feel considered.
        </p>
      </div>

      {/* 3D Canvas — coaster */}
      <div style={{ height: '55vw', maxHeight: '520px', minHeight: '280px', position: 'relative', zIndex: 2, marginTop: '-2rem' }}>
        <Canvas camera={{ position: [1.2, 4.2, 3.0], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <HeroScene />
        </Canvas>
      </div>

      {/* Bottom two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, position: 'relative', zIndex: 3 }}>
        {/* Left panel */}
        <div style={{
          background: 'rgba(180,155,100,0.25)', backdropFilter: 'blur(8px)',
          padding: '1.8rem 1.5rem',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.4, letterSpacing: '0.02em', color: '#F5EFE0', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            DESIGNED<br />BY LUSION,<br />THE AWARD-WINNING<br />DESIGN STUDIO.
          </p>
          <p style={{ fontSize: '0.82rem', color: 'rgba(245,239,224,0.7)', lineHeight: 1.6 }}>
            The world's most<br />unnecessarily sophisticated<br />cork coaster.
          </p>
        </div>

        {/* Right panel — video placeholder */}
        <div style={{
          background: 'rgba(80,55,25,0.5)', position: 'relative', overflow: 'hidden',
          minHeight: '180px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end', padding: '1rem',
        }}>
          {/* Fake video thumbnail bg */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#2a1a08,#4a2a0a)', opacity: 0.8 }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '8px',
              background: 'rgba(255,133,57,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.5rem',
            }}>
              <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #100904', marginLeft: '2px' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(245,239,224,0.6)', letterSpacing: '0.1em' }}>PLAY</span>
          </div>
        </div>
      </div>

      {/* Scroll to continue */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem', background: '#100904', position: 'relative', zIndex: 3 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'transparent', border: '1.5px dashed rgba(245,239,224,0.35)',
          borderRadius: '100px', padding: '0.6rem 1.2rem',
          color: 'rgba(245,239,224,0.6)', fontSize: '0.65rem', fontWeight: 600,
          letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'Space Grotesk',
        }}>
          SCROLL TO CONTINUE
          <span style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '1.5px dashed rgba(245,239,224,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem',
          }}>↓</span>
        </button>
      </div>
    </section>
  )
}
