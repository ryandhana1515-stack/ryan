'use client'

/**
 * Real-time 3D product film for BIO N:OV.
 *
 * The box carries the actual packaging artwork rectified from the PDF,
 * so the Korean text, V graphic, logo and seals are the original pixels —
 * never AI-regenerated. Scroll progress (0..1) drives every animation, so
 * motion stops, reverses and scrubs perfectly with the user's scroll.
 */
import { useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { asset } from '@/lib/assets'
import { CH, clamp01, lerp, prand, seg, sseg } from './filmMath'

export type FilmMode = 'film' | 'reassembly'

interface SceneProps {
  progressRef: MutableRefObject<number>
  mode: FilmMode
  quality: 'high' | 'low'
}

// ————————————————————————————————————————————— speckled tablet texture
function makeTabletTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  // grey-beige compressed herbal base
  ctx.fillStyle = '#b9ad97'
  ctx.fillRect(0, 0, 256, 256)
  // fine grain noise
  for (let i = 0; i < 9000; i++) {
    const v = 150 + Math.floor(prand(i) * 60)
    ctx.fillStyle = `rgba(${v},${v - 8},${v - 24},${0.25 + prand(i + 1) * 0.3})`
    ctx.fillRect(prand(i + 2) * 256, prand(i + 3) * 256, 1.6, 1.6)
  }
  // irregular dark speckles
  for (let i = 0; i < 240; i++) {
    const x = prand(i + 10) * 256
    const y = prand(i + 20) * 256
    const r = 0.8 + prand(i + 30) * 2.6
    ctx.fillStyle = `rgba(${45 + prand(i) * 30},${38 + prand(i) * 24},${
      30 + prand(i) * 20
    },${0.5 + prand(i + 40) * 0.4})`
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * (0.6 + prand(i + 50) * 0.6), prand(i + 60) * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ————————————————————————————————————————————— environment (no network)
function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new RoomEnvironment()
    const rt = pmrem.fromScene(envScene, 0.04)
    scene.environment = rt.texture
    return () => {
      scene.environment = null
      rt.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

// ————————————————————————————————————————————— product box
const BOX_W = 1.24
const BOX_H = 1.9
const BOX_D = 0.62

function ProductBox({
  progressRef,
  mode,
  group,
}: SceneProps & { group: MutableRefObject<THREE.Group | null> }) {
  const [front, side] = useTexture([
    asset('/assets/product/clean/box-front.png'),
    asset('/assets/product/clean/box-side.png'),
  ])
  front.colorSpace = THREE.SRGBColorSpace
  side.colorSpace = THREE.SRGBColorSpace

  const materials = useMemo(() => {
    // clearcoated physical materials: premium printed-carton sheen
    const white = new THREE.MeshPhysicalMaterial({
      color: '#f4f6fa',
      roughness: 0.5,
      metalness: 0.02,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
    })
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: front,
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.65,
      clearcoatRoughness: 0.3,
    })
    const sideMat = new THREE.MeshPhysicalMaterial({
      map: side,
      roughness: 0.5,
      metalness: 0.02,
      clearcoat: 0.5,
      clearcoatRoughness: 0.35,
    })
    // order: +x, -x, +y, -y, +z, -z — top uses white (flaps cover it)
    return [sideMat, sideMat.clone(), white, white.clone(), frontMat, frontMat.clone()]
  }, [front, side])

  const flapL = useRef<THREE.Mesh>(null)
  const flapR = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const p = progressRef.current
    let open = 0
    if (mode === 'film') {
      open = sseg(p, CH.opening[0], CH.opening[1] - 0.02)
      // pre-loosen at the end of levitation
      open = Math.max(open, sseg(p, CH.levitation[1] - 0.03, CH.levitation[1]) * 0.12)
    } else {
      // reassembly: flaps close in the final third
      open = 1 - sseg(p, 0.6, 0.85)
    }
    const angle = open * 1.9
    if (flapL.current) flapL.current.rotation.z = angle
    if (flapR.current) flapR.current.rotation.z = -angle
  })

  return (
    <group ref={group}>
      <mesh geometry={useMemo(() => new RoundedBoxGeometry(BOX_W, BOX_H, BOX_D, 3, 0.025), [])} material={materials} />
      {/* top opening flaps */}
      <group position={[0, BOX_H / 2, 0]}>
        <mesh ref={flapL} position={[-BOX_W / 4, 0, 0]}>
          <boxGeometry args={[BOX_W / 2, 0.02, BOX_D]} />
          <meshStandardMaterial color="#eef1f6" roughness={0.6} />
        </mesh>
        <mesh ref={flapR} position={[BOX_W / 4, 0, 0]}>
          <boxGeometry args={[BOX_W / 2, 0.02, BOX_D]} />
          <meshStandardMaterial color="#eef1f6" roughness={0.6} />
        </mesh>
      </group>
      {/* soft contact shadow */}
      <mesh position={[0, -BOX_H / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 48]} />
        <meshBasicMaterial color="#0e2a6e" transparent opacity={0.18} />
      </mesh>
      {/* subtle stage rings — premium accent, tuned for the bright gradients */}
      <mesh position={[0, -BOX_H / 2 - 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.28, 1.35, 96]} />
        <meshBasicMaterial color="#1b6fd8" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh position={[0, -BOX_H / 2 - 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 1.58, 96]} />
        <meshBasicMaterial color="#8b7be8" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ————————————————————————————————————————————— silver blister packs
function makeBlisterGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const w = 0.52
  const h = 0.94
  const r = 0.07
  shape.moveTo(-w / 2 + r, -h / 2)
  shape.lineTo(w / 2 - r, -h / 2)
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  shape.lineTo(w / 2, h / 2 - r)
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  shape.lineTo(-w / 2 + r, h / 2)
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  shape.lineTo(-w / 2, -h / 2 + r)
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  })
}

function BlisterPack(props: JSX.IntrinsicElements['group']) {
  const geo = useMemo(() => makeBlisterGeometry(), [])
  const silver = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d8dde4',
        metalness: 0.92,
        roughness: 0.28,
        envMapIntensity: 1.3,
      }),
    [],
  )
  // 2 × 3 tablet pockets
  const pockets = useMemo(() => {
    const arr: Array<[number, number]> = []
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 2; col++)
        arr.push([(col - 0.5) * 0.24, (row - 1) * 0.28])
    return arr
  }, [])
  return (
    <group {...props}>
      <mesh geometry={geo} material={silver} />
      {pockets.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.035]} scale={[1, 0.62, 0.5]}>
          <sphereGeometry args={[0.085, 20, 14]} />
          <primitive object={silver} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function Blisters({ progressRef, mode }: SceneProps) {
  const a = useRef<THREE.Group>(null)
  const b = useRef<THREE.Group>(null)
  useFrame(() => {
    const p = progressRef.current
    let rise = 0
    let drift = 0
    if (mode === 'film') {
      rise = sseg(p, CH.opening[0] + 0.02, CH.opening[1])
      drift = sseg(p, CH.release[0], CH.release[1])
    } else {
      drift = 1 - sseg(p, 0.25, 0.5)
      rise = 1 - sseg(p, 0.45, 0.68)
    }
    if (a.current) {
      a.current.position.set(
        drift * -0.85,
        BOX_H / 2 - 0.55 + rise * 1.15 + drift * 0.45,
        drift * 0.35,
      )
      a.current.rotation.set(drift * -0.5, drift * 0.4, drift * 0.15)
      const s = rise > 0.01 ? 1 : 0
      a.current.scale.setScalar(s)
    }
    if (b.current) {
      const rise2 = clamp01(rise * 1.25 - 0.25)
      b.current.position.set(
        drift * 0.9,
        BOX_H / 2 - 0.75 + rise2 * 0.95 + drift * 0.65,
        drift * -0.25,
      )
      b.current.rotation.set(drift * 0.35, drift * -0.5, drift * -0.2)
      const s = rise2 > 0.01 ? 1 : 0
      b.current.scale.setScalar(s)
    }
  })
  return (
    <>
      <group ref={a}>
        <BlisterPack rotation={[0.1, 0, 0]} />
      </group>
      <group ref={b}>
        <BlisterPack rotation={[-0.1, 0.2, 0]} />
      </group>
    </>
  )
}

// ————————————————————————————————————————————— three calm tablets
// One tablet, three times a day: exactly three tablets drift out of the
// box on gentle arcs — no swarm. The hero tablet then approaches the
// camera and softly breaks apart into fragments for the ingredient
// reveal.
const TABLET_HOMES: Array<[number, number, number]> = [
  [0.0, 1.25, 1.1], // hero — sits on the camera's macro path
  [-1.15, 1.6, 0.2],
  [1.05, 0.95, -0.45],
]

function Tablets({ progressRef, mode }: SceneProps) {
  const count = 3
  const mesh = useRef<THREE.InstancedMesh>(null)
  const frag = useRef<THREE.InstancedMesh>(null)
  const tex = useMemo(() => makeTabletTexture(), [])
  const geo = useMemo(
    // small short oblong rounded rectangle — matches the PDF tablets
    () => new RoundedBoxGeometry(0.34, 0.13, 0.19, 3, 0.055),
    [],
  )
  const fragGeo = useMemo(() => new RoundedBoxGeometry(0.11, 0.07, 0.08, 2, 0.03), [])
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.95,
        metalness: 0.0,
      }),
    [tex],
  )
  const fragMat = useMemo(() => {
    const m = mat.clone()
    m.transparent = true
    return m
  }, [mat])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const FRAGS = 12
  const fragParams = useMemo(
    () =>
      Array.from({ length: FRAGS }, (_, i) => ({
        dir: new THREE.Vector3(
          prand(i * 3 + 21) * 2 - 1,
          prand(i * 3 + 22) * 2 - 1,
          prand(i * 3 + 23) * 2 - 1,
        ).normalize(),
        dist: 0.35 + prand(i * 5 + 24) * 0.75,
        rot: new THREE.Euler(
          prand(i * 7 + 25) * Math.PI * 2,
          prand(i * 7 + 26) * Math.PI * 2,
          prand(i * 7 + 27) * Math.PI * 2,
        ),
        spin: 0.5 + prand(i * 11 + 28) * 1.1,
      })),
    [],
  )

  useFrame((state) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime
    let spread = 0
    let macro = 0
    let dissolve = 0
    if (mode === 'film') {
      spread = sseg(p, CH.release[0], CH.release[1])
      macro = sseg(p, CH.macro[0], CH.macro[1])
      dissolve = sseg(p, CH.dissolve[0], CH.dissolve[1])
    } else {
      spread = 1 - sseg(p, 0.05, 0.45)
      macro = 0
    }
    const m = mesh.current
    if (!m) return
    const origin = new THREE.Vector3(0, BOX_H / 2 - 0.2, 0)
    const heroTarget = new THREE.Vector3(0, 1.2, 2.2)

    for (let i = 0; i < count; i++) {
      const home = TABLET_HOMES[i]
      // gentle arc from box mouth to resting position
      const arc = Math.sin(spread * Math.PI) * 0.35
      dummy.position.set(
        origin.x + (home[0] - origin.x) * spread,
        origin.y + (home[1] - origin.y) * spread + arc,
        origin.z + (home[2] - origin.z) * spread,
      )
      // slow, calm float + rotation
      dummy.position.y += Math.sin(t * 0.6 + i * 2.1) * 0.045 * spread
      dummy.rotation.set(
        0.3 + i + t * 0.12,
        i * 1.7 + t * 0.16,
        0.2 * i,
      )
      let s = spread > 0.005 ? 1 : 0
      if (i === 0) {
        // hero tablet drifts to the camera for the macro chapter…
        dummy.position.lerp(heroTarget, macro)
        dummy.rotation.set(0.3 * (1 - macro) + macro * 0.4, t * 0.15, 0)
        s = spread > 0.005 ? 1 + macro * 2.2 : 0
        // …then softly fades as it breaks apart
        s *= 1 - dissolve
      } else {
        // companions politely drift aside during the macro
        dummy.position.x += macro * (i === 1 ? -1.4 : 1.4)
        s *= 1 - macro * 0.9
      }
      dummy.scale.setScalar(Math.max(0.0001, s))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true

    // fragments: a soft, slow break — not an explosion
    const f = frag.current
    if (f) {
      const ease = smoothDissolve(dissolve)
      for (let i = 0; i < FRAGS; i++) {
        const prm = fragParams[i]
        dummy.position.set(
          heroTarget.x + prm.dir.x * prm.dist * ease,
          heroTarget.y + prm.dir.y * prm.dist * ease * 0.8 - ease * 0.12,
          heroTarget.z + prm.dir.z * prm.dist * ease,
        )
        dummy.rotation.set(
          prm.rot.x + t * prm.spin * 0.2,
          prm.rot.y + t * prm.spin * 0.15,
          prm.rot.z,
        )
        const s = ease > 0.01 ? (1 - ease * 0.55) * (mode === 'film' ? 1 : 0) : 0.0001
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        f.setMatrixAt(i, dummy.matrix)
      }
      fragMat.opacity = dissolve > 0.01 ? 1 - dissolve * 0.75 : 0
      f.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />
      <instancedMesh ref={frag} args={[fragGeo, fragMat, 12]} frustumCulled={false} />
    </>
  )
}

// gentle ease for the break-apart: slow start, calm settle
function smoothDissolve(d: number): number {
  return d * d * (3 - 2 * d)
}

// ————————————————————————————————————————————— ambient particles + trails
function Particles({ quality }: { quality: 'high' | 'low' }) {
  const n = quality === 'high' ? 320 : 120
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (prand(i * 3) * 2 - 1) * 9
      arr[i * 3 + 1] = (prand(i * 3 + 1) * 2 - 1) * 6
      arr[i * 3 + 2] = (prand(i * 3 + 2) * 2 - 1) * 9
    }
    return arr
  }, [n])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.012
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#5fb8ee"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function LightTrails({ progressRef, mode }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const curves = useMemo(() => {
    const mk = (phase: number, rad: number, col: string) => {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 60; i++) {
        const t = i / 60
        const a = phase + t * Math.PI * 3.2
        pts.push(
          new THREE.Vector3(Math.cos(a) * rad, -1.2 + t * 3.4, Math.sin(a) * rad),
        )
      }
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.012, 6, false)
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      return new THREE.Mesh(geo, mat)
    }
    return [mk(0, 1.35, '#29c4f0'), mk(2.1, 1.6, '#8b7be8'), mk(4.2, 1.5, '#f272b6')]
  }, [])
  useFrame((state) => {
    const p = progressRef.current
    let vis = 0
    if (mode === 'film') {
      vis =
        sseg(p, CH.levitation[0], CH.levitation[0] + 0.05) *
        (1 - sseg(p, CH.release[0], CH.release[1]))
    } else {
      vis = sseg(p, 0.55, 0.7) * (1 - sseg(p, 0.85, 0.98))
    }
    curves.forEach((c, i) => {
      const m = c.material as THREE.MeshBasicMaterial
      m.opacity = vis * 0.5
      c.rotation.y = state.clock.elapsedTime * (0.2 + i * 0.07)
    })
  })
  return (
    <group ref={group}>
      {curves.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </group>
  )
}

// ————————————————————————————————————————————— camera + box choreography
function Choreography({
  progressRef,
  mode,
  boxGroup,
}: SceneProps & { boxGroup: MutableRefObject<THREE.Group | null> }) {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const p = progressRef.current
    const box = boxGroup.current
    if (!box) return
    // cinematic breathing: a barely-perceptible handheld drift
    const t = state.clock.elapsedTime
    const bx = Math.sin(t * 0.31) * 0.035
    const by = Math.cos(t * 0.23) * 0.028

    if (mode === 'film') {
      // — box state
      const rot = sseg(p, CH.rotation[0], CH.rotation[1]) * Math.PI * 2
      const lift = sseg(p, CH.levitation[0], CH.levitation[1]) * 1.35
      const settleWobble = 0
      box.rotation.y = rot
      box.position.set(0.0, lift, 0)
      box.rotation.x = settleWobble

      // subtle end-of-rotation pulse handled via scale
      const pulse = 1 + Math.sin(seg(p, CH.rotation[1] - 0.015, CH.rotation[1]) * Math.PI) * 0.012
      box.scale.setScalar(pulse)

      // fade the whole box during macro/dissolve (recedes into distance visually)
      const fade = sseg(p, CH.macro[0], CH.macro[1])
      box.position.z = -fade * 4.5

      // — camera path
      const arrive = sseg(p, CH.arrival[0], CH.arrival[1])
      const through = sseg(p, CH.field[0], CH.field[1])
      const macro = sseg(p, CH.macro[0], CH.macro[1])

      const camX = lerp(1.9, 0.4, arrive) + Math.sin(through * Math.PI) * 1.1
      const camY = lerp(0.4, 0.2, arrive) + lift * 0.92 + through * 0.7 + macro * 0.15
      const camZ =
        lerp(6.4, 4.4, arrive) -
        sseg(p, CH.opening[0], CH.opening[1]) * 0.6 -
        through * 2.4 -
        macro * -1.4

      // macro target: the hero tablet at (0, 1.2, 2.2)
      const tx = lerp(0, 0, macro)
      const ty = lerp(lift * 0.85 + 0.25, 1.2, macro)
      const tz = lerp(0, 2.2, macro)

      camera.position.set(camX + bx, camY + by, lerp(camZ, 3.35, macro))
      target.set(tx, ty, tz)
      camera.lookAt(target)
    } else {
      // ————— reassembly: tablets converge → blisters descend → flaps close → box settles
      const settle = sseg(p, 0.62, 0.92)
      const rotBack = (1 - sseg(p, 0.55, 0.9)) * 0.9
      box.rotation.y = rotBack
      box.position.set(0, (1 - settle) * 1.1, 0)
      box.scale.setScalar(1)

      const camPull = sseg(p, 0.0, 0.6)
      camera.position.set(
        lerp(0.6, 0.85, camPull) + bx,
        lerp(1.6, 0.35, camPull) + by,
        lerp(3.2, 5.6, camPull),
      )
      target.set(0, lerp(1.1, 0.15, camPull), 0)
      camera.lookAt(target)
    }
  })
  return null
}

// ————————————————————————————————————————————— scene root
function SceneContent(props: SceneProps) {
  const boxGroup = useRef<THREE.Group | null>(null)
  return (
    <>
      <StudioEnvironment />
      {/* bright clinical-luxury lighting: warm key, cool cyan rim, soft pink fill */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.7} color="#fff8f0" />
      <directionalLight position={[-5, 3, -4]} intensity={0.8} color="#8fd8f8" />
      <directionalLight position={[5, 1, -3]} intensity={0.4} color="#b9aef2" />
      <pointLight position={[0, -2, 4]} intensity={0.35} color="#f2a8d8" />
      <fog attach="fog" args={['#dcebfb', 9, 19]} />
      <ProductBox {...props} group={boxGroup} />
      <Blisters {...props} />
      <Tablets {...props} />
      <LightTrails {...props} />
      <Particles quality={props.quality} />
      <Choreography {...props} boxGroup={boxGroup} />
      {props.quality === 'high' && (
        <EffectComposer>
          <Bloom intensity={0.3} luminanceThreshold={0.92} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.12} darkness={0.42} />
        </EffectComposer>
      )}
    </>
  )
}

export default function FilmCanvas({
  progressRef,
  mode,
  className,
}: {
  progressRef: MutableRefObject<number>
  mode: FilmMode
  className?: string
}) {
  const quality: 'high' | 'low' =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 ||
      (navigator as { deviceMemory?: number }).deviceMemory !== undefined &&
      ((navigator as { deviceMemory?: number }).deviceMemory as number) <= 4)
      ? 'low'
      : 'high'

  return (
    <Canvas
      className={className}
      camera={{ position: [1.9, 0.4, 6.4], fov: 38 }}
      dpr={quality === 'high' ? [1, 2] : [1, 1.35]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        // filmic response curve — the single biggest "cinematic" lever
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <SceneContent progressRef={progressRef} mode={mode} quality={quality} />
    </Canvas>
  )
}
