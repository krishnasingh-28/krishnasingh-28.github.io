'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Float,
  Environment,
  Icosahedron,
  Torus,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import * as THREE from 'three'

const GOLD = '#e8c169'
const GOLD_HOT = '#ffdd8a'

function CoreObject() {
  const inner = useRef<THREE.Mesh>(null)
  const glow = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (inner.current) {
      inner.current.rotation.y += delta * 0.25
      inner.current.rotation.x += delta * 0.12
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.04
      inner.current.scale.setScalar(s)
    }
    if (glow.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.06
      glow.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Outer glow shell */}
      <Icosahedron ref={glow} args={[1.35, 2]}>
        <meshBasicMaterial color={GOLD} transparent opacity={0.06} />
      </Icosahedron>

      {/* Energy core */}
      <Icosahedron ref={inner} args={[1, 6]}>
        <meshStandardMaterial
          color={GOLD_HOT}
          emissive={GOLD}
          emissiveIntensity={1.6}
          roughness={0.15}
          metalness={0.9}
        />
      </Icosahedron>

      <pointLight position={[0, 0, 0]} intensity={4} color={GOLD} distance={8} />
    </group>
  )
}

function GlassRing({
  radius,
  tube,
  speed,
  tilt,
}: {
  radius: number
  tube: number
  speed: number
  tilt: [number, number, number]
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed
    }
  })
  return (
    <group rotation={tilt}>
      <Torus ref={ref} args={[radius, tube, 24, 120]}>
        <MeshTransmissionMaterial
          thickness={0.6}
          roughness={0.08}
          transmission={1}
          ior={1.4}
          chromaticAberration={0.04}
          backside
          color="#ffffff"
          attenuationColor={GOLD}
          attenuationDistance={2.5}
        />
      </Torus>
    </group>
  )
}

function OrbitDots({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 1.6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={GOLD} transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x += (pointer.current.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (-pointer.current.y * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

export function AiCore() {
  const pointer = useRef({ x: 0, y: 0 })

  return (
    <div
      className="absolute inset-0"
      onPointerMove={(e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1
        const y = (e.clientY / window.innerHeight) * 2 - 1
        pointer.current = { x, y }
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <spotLight position={[5, 5, 5]} angle={0.3} intensity={40} color={GOLD} penumbra={1} />
        <spotLight position={[-5, -3, 2]} angle={0.4} intensity={12} color="#ffffff" penumbra={1} />

        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
          <CoreObject />
          <GlassRing radius={1.9} tube={0.03} speed={0.3} tilt={[Math.PI / 2.4, 0, 0]} />
          <GlassRing radius={2.35} tube={0.025} speed={-0.22} tilt={[Math.PI / 3, Math.PI / 5, 0]} />
          <GlassRing radius={2.8} tube={0.02} speed={0.16} tilt={[Math.PI / 2, Math.PI / 3, Math.PI / 6]} />
        </Float>

        <OrbitDots />
        <Rig pointer={pointer} />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
