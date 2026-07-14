import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { gsap } from 'gsap'

function Pill({ mouse }) {
  const meshRef = useRef(), groupRef = useRef()
  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.2
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.06
    if (mouse.current) {
      groupRef.current.rotation.y += (mouse.current[0] * 0.25 - groupRef.current.rotation.y) * 0.04
      groupRef.current.rotation.x += (-mouse.current[1] * 0.15 - groupRef.current.rotation.x) * 0.04
    }
  })
  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={meshRef}>
          <mesh castShadow>
            <capsuleGeometry args={[0.42, 1.2, 14, 56]} />
            <MeshTransmissionMaterial color="#00dcff" transmission={0.75} roughness={0} thickness={0.9}
              chromaticAberration={0.1} anisotropy={0.15} distortion={0.12} distortionScale={0.35}
              temporalDistortion={0.06} clearcoat={1} clearcoatRoughness={0} envMapIntensity={2.5}
              iridescence={0.5} iridescenceIOR={1.7} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.455, 0.014, 8, 72]} />
            <meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={5} />
          </mesh>
          <mesh>
            <capsuleGeometry args={[0.25, 0.75, 8, 32]} />
            <meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={2.5} transparent opacity={0.12} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

function Particles() {
  const ref = useRef(), count = 500
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 1.8 + Math.random() * 4, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta); pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta); pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])
  useFrame(s => { if (ref.current) { ref.current.rotation.y = s.clock.elapsedTime * 0.04; ref.current.rotation.x = s.clock.elapsedTime * 0.012 } })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.022} color="#00dcff" sizeAttenuation transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

function Rings() {
  const r1 = useRef(), r2 = useRef(), r3 = useRef()
  useFrame(s => {
    r1.current.rotation.z = s.clock.elapsedTime * 0.18
    r2.current.rotation.z = -s.clock.elapsedTime * 0.12
    r3.current.rotation.z = s.clock.elapsedTime * 0.07
  })
  return (<>
    <mesh ref={r1} rotation={[Math.PI / 3, 0.3, 0]}><torusGeometry args={[2.0, 0.006, 4, 128]} /><meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={2} transparent opacity={0.3} /></mesh>
    <mesh ref={r2} rotation={[Math.PI / 5, 1.2, 0.5]}><torusGeometry args={[2.8, 0.004, 4, 128]} /><meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={1.5} transparent opacity={0.18} /></mesh>
    <mesh ref={r3} rotation={[Math.PI / 7, -0.8, 1]}><torusGeometry args={[3.6, 0.003, 4, 128]} /><meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={1} transparent opacity={0.1} /></mesh>
  </>)
}

function Scene({ mouse }) {
  return (<>
    <color attach="background" args={['#050810']} />
    <ambientLight intensity={0.15} />
    <pointLight position={[3, 3, 3]} intensity={35} color="#00dcff" />
    <pointLight position={[-3, -2, 2]} intensity={18} color="#0060ff" />
    <pointLight position={[0, 0, 5]} intensity={10} color="#ffffff" />
    <Suspense fallback={null}>
      <Environment preset="studio" />
      <Pill mouse={mouse} />
      <Particles />
      <Rings />
      <Stars radius={100} depth={60} count={1500} factor={3} saturation={0} fade speed={0.4} />
      <EffectComposer>
        <Bloom intensity={2.0} luminanceThreshold={0.35} luminanceSmoothing={0.9} blendFunction={BlendFunction.ADD} />
        <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0005, 0.0008]} />
      </EffectComposer>
    </Suspense>
  </>)
}

export default function Hero() {
  const mouse = useRef([0, 0])
  const tagRef = useRef(), titleRef = useRef(), subRef = useRef(), btnsRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.6 })
    tl.fromTo(tagRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo(titleRef.current, { opacity: 0, y: 50, skewY: 4 }, { opacity: 1, y: 0, skewY: 0, duration: 1.1, ease: 'power3.out' }, '-=0.3')
      .fromTo(subRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
      .fromTo(btnsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
  }, [])

  return (
    <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseMove={e => { mouse.current = [(e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2] }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <Scene mouse={mouse} />
        </Canvas>
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 55% 75% at 50% 50%, transparent 25%, rgba(5,8,16,0.55) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', zIndex: 2, background: 'linear-gradient(to bottom, transparent, #050810)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', padding: '0 5vw', pointerEvents: 'none' }}>
        <div style={{ maxWidth: '46%' }}>
          <div ref={tagRef} style={{ opacity: 0, marginBottom: '1.5rem' }}>
            <span className="tag">3rd Generation Nitric Oxide · Patented</span>
          </div>
          <h1 ref={titleRef} className="bebas" style={{
            opacity: 0, fontSize: 'clamp(5rem, 9vw, 9.5rem)', lineHeight: 0.88, color: '#fff', marginBottom: '0.2em',
            textShadow: '0 0 60px rgba(0,220,255,0.3)',
          }}>
            BIO<br /><span style={{ color: '#00dcff', WebkitTextStroke: '1px #00dcff' }}>N:OV</span>
          </h1>
          <p ref={subRef} className="bebas" style={{
            opacity: 0, fontSize: 'clamp(1.1rem, 1.9vw, 1.8rem)',
            color: 'rgba(200,212,232,0.65)', letterSpacing: '0.1em', marginBottom: '2.5rem', lineHeight: 1.2,
          }}>
            Clearing The Way To<br />Optimum Health
          </p>
          <div ref={btnsRef} style={{ opacity: 0, display: 'flex', gap: '1rem', pointerEvents: 'all' }}>
            <a href="#order" className="btn-primary">Order Now →</a>
            <a href="#science" className="btn-ghost">See The Science</a>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, zIndex: 6, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        {[{ n: '30 min', l: 'Blood Pressure Support' }, { n: '40–400%', l: 'More Effective' }, { n: '8+', l: 'University Partners' }, { n: '100%', l: 'Natural' }].map((s, i) => (
          <div key={i} style={{ padding: '0.7rem 2rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(0,220,255,0.12)' : 'none' }}>
            <div className="bebas" style={{ fontSize: '1.6rem', color: '#00dcff', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: '0.6rem', color: 'rgba(200,212,232,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.25rem' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
