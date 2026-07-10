import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { motion } from 'framer-motion'

function Pill({ mouse }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.25
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08

    // Mouse parallax
    if (mouse.current) {
      groupRef.current.rotation.y += (mouse.current[0] * 0.3 - groupRef.current.rotation.y) * 0.05
      groupRef.current.rotation.x += (-mouse.current[1] * 0.2 - groupRef.current.rotation.x) * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.6}>
        <group ref={meshRef}>
          {/* Main capsule body */}
          <mesh castShadow>
            <capsuleGeometry args={[0.38, 1.1, 12, 48]} />
            <MeshTransmissionMaterial
              color="#00dcff"
              transmission={0.7}
              roughness={0.0}
              thickness={0.8}
              chromaticAberration={0.08}
              anisotropy={0.1}
              distortion={0.1}
              distortionScale={0.3}
              temporalDistortion={0.05}
              clearcoat={1}
              clearcoatRoughness={0}
              envMapIntensity={2}
              iridescence={0.4}
              iridescenceIOR={1.6}
            />
          </mesh>

          {/* Inner glow core */}
          <mesh ref={glowRef}>
            <capsuleGeometry args={[0.22, 0.7, 8, 32]} />
            <meshStandardMaterial
              color="#00dcff"
              emissive="#00dcff"
              emissiveIntensity={3}
              transparent
              opacity={0.15}
            />
          </mesh>

          {/* Rim ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.012, 8, 64]} />
            <meshStandardMaterial
              color="#00dcff"
              emissive="#00dcff"
              emissiveIntensity={4}
            />
          </mesh>
        </group>

        {/* NO text floating */}
        <group position={[0.85, 0.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={5} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

function NOParticles() {
  const pointsRef = useRef()
  const count = 400

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 1.4 + Math.random() * 3.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = Math.random()
    }
    return { positions, sizes }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.015
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#00dcff"
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function OrbitRings() {
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()

  useFrame((state) => {
    ring1.current.rotation.z = state.clock.elapsedTime * 0.2
    ring2.current.rotation.z = -state.clock.elapsedTime * 0.15
    ring3.current.rotation.z = state.clock.elapsedTime * 0.08
  })

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.8, 0.006, 4, 128]} />
        <meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={2} transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 5, 1.2, 0.5]}>
        <torusGeometry args={[2.4, 0.004, 4, 128]} />
        <meshStandardMaterial color="#00a896" emissive="#00a896" emissiveIntensity={2} transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 7, -0.8, 1]}>
        <torusGeometry args={[3.1, 0.003, 4, 128]} />
        <meshStandardMaterial color="#00dcff" emissive="#00dcff" emissiveIntensity={1.5} transparent opacity={0.15} />
      </mesh>
    </>
  )
}

function Scene({ mouse }) {
  return (
    <>
      <color attach="background" args={['#06091f']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={30} color="#00dcff" />
      <pointLight position={[-3, -2, 2]} intensity={15} color="#00a896" />
      <pointLight position={[0, 0, 4]} intensity={8} color="#ffffff" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Pill mouse={mouse} />
        <NOParticles />
        <OrbitRings />
        <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />

        <EffectComposer>
          <Bloom
            intensity={1.8}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.ADD}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0005, 0.0008]}
          />
        </EffectComposer>
      </Suspense>
    </>
  )
}

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

export default function Hero() {
  const mouse = useRef([0, 0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleMouseMove = (e) => {
    mouse.current = [
      (e.clientX / window.innerWidth - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    ]
  }

  return (
    <section
      style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
    >
      {/* Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </div>

      {/* Gradient vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 60% 80% at 50% 50%, transparent 30%, rgba(6,9,31,0.6) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 2,
        background: 'linear-gradient(to bottom, transparent, #06091f)',
        pointerEvents: 'none'
      }} />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 2.5rem'
        }}
      >
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '1.4rem', color: '#00dcff', letterSpacing: '0.1em' }}>
          BIO<span style={{ color: '#fff' }}> N:OV</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['Science', 'Benefits', 'Results'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} style={{
              color: 'rgba(200,212,232,0.7)', fontSize: '0.8rem', fontWeight: 500,
              letterSpacing: '0.06em', textDecoration: 'none', transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = '#00dcff'}
              onMouseLeave={e => e.target.style.color = 'rgba(200,212,232,0.7)'}
            >{link}</a>
          ))}
          <a href="#order" className="btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.75rem' }}>
            Order Now
          </a>
        </div>
      </motion.nav>

      {/* Hero text — left side */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', alignItems: 'center',
        padding: '0 5vw',
        pointerEvents: 'none'
      }}>
        <div style={{ maxWidth: '48%' }}>
          {mounted && (
            <>
              <motion.div custom={0} variants={textVariants} initial="hidden" animate="visible">
                <span className="tag">3rd Generation Nitric Oxide</span>
              </motion.div>

              <motion.h1
                custom={1} variants={textVariants} initial="hidden" animate="visible"
                className="bebas glow-text"
                style={{
                  fontSize: 'clamp(4rem, 7vw, 7.5rem)',
                  lineHeight: 0.92,
                  color: '#fff',
                  marginBottom: '0.15em'
                }}
              >
                BIO<br />
                <span style={{ color: '#00dcff', WebkitTextStroke: '1px #00dcff' }}>N:OV</span>
              </motion.h1>

              <motion.p
                custom={2} variants={textVariants} initial="hidden" animate="visible"
                className="bebas"
                style={{
                  fontSize: 'clamp(1.2rem, 2.2vw, 2rem)',
                  color: 'rgba(200,212,232,0.75)',
                  letterSpacing: '0.08em',
                  marginBottom: '2rem',
                  lineHeight: 1.25
                }}
              >
                Clearing The Way To<br />Optimum Health
              </motion.p>

              <motion.p
                custom={3} variants={textVariants} initial="hidden" animate="visible"
                style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(200,212,232,0.6)', marginBottom: '2.5rem', maxWidth: '440px' }}
              >
                Patented Korean biotechnology. Blood pressure supported within 30 minutes.
                40–400% more effective than conventional supplements.
              </motion.p>

              <motion.div
                custom={4} variants={textVariants} initial="hidden" animate="visible"
                style={{ display: 'flex', gap: '1rem', pointerEvents: 'all' }}
              >
                <a href="#order" className="btn-primary">Order Now →</a>
                <a href="#science" className="btn-ghost">See The Science</a>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Bottom stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: '2.5rem', left: 0, right: 0, zIndex: 6,
          display: 'flex', justifyContent: 'center', gap: '0.5px',
          pointerEvents: 'none'
        }}
      >
        {[
          { n: '30 min', l: 'Blood Pressure Support' },
          { n: '40–400%', l: 'More Effective' },
          { n: '8+', l: 'Korean University Partners' },
          { n: '100%', l: 'Natural Ingredients' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '0.8rem 2rem',
            borderRight: i < 3 ? '1px solid rgba(0,220,255,0.15)' : 'none',
            textAlign: 'center'
          }}>
            <div className="bebas" style={{ fontSize: '1.8rem', color: '#00dcff', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(200,212,232,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.3rem' }}>{s.l}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
