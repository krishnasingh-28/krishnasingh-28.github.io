'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const RING_CONFIG = [
  { r: 68, tube: 1.5, speed: 28, tilt: 'rotateX(72deg) rotateY(0deg)' },
  { r: 90, tube: 1.2, speed: -38, tilt: 'rotateX(58deg) rotateY(30deg)' },
  { r: 112, tube: 1.0, speed: 20, tilt: 'rotateX(80deg) rotateY(60deg)' },
  { r: 136, tube: 0.8, speed: -15, tilt: 'rotateX(44deg) rotateY(90deg)' },
]

function OrbitRing({
  r,
  tube,
  speed,
  tilt,
}: {
  r: number
  tube: number
  speed: number
  tilt: string
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: r * 2,
        height: r * 2,
        marginLeft: -r,
        marginTop: -r,
        transform: tilt,
        border: `${tube}px solid`,
        borderColor:
          'oklch(0.86 0.14 86 / 35%)',
        boxShadow: `0 0 ${tube * 6}px ${tube * 2}px oklch(0.82 0.13 84 / 18%), inset 0 0 ${tube * 3}px oklch(0.9 0.1 88 / 10%)`,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: Math.abs(speed),
        ease: 'linear',
        repeat: Infinity,
        direction: speed < 0 ? 'reverse' : 'normal',
      }}
    />
  )
}

function ParticleDot({ delay, radius }: { delay: number; radius: number }) {
  const angle = (delay / 60) * Math.PI * 2
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius * 0.35

  return (
    <motion.div
      className="absolute rounded-full bg-gold"
      style={{
        width: 3,
        height: 3,
        left: '50%',
        top: '50%',
        marginLeft: -1.5,
        marginTop: -1.5,
        x,
        y,
        opacity: 0.5 + Math.random() * 0.5,
      }}
      animate={{
        opacity: [0.2, 0.9, 0.2],
        scale: [0.7, 1.3, 0.7],
      }}
      transition={{
        duration: 2.5 + Math.random() * 2,
        delay: delay * 0.08,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function AiCore() {
  const coreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = coreRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = ((e.clientX - cx) / window.innerWidth) * 12
      const dy = ((e.clientY - cy) / window.innerHeight) * 8
      el.style.transform = `rotateY(${dx}deg) rotateX(${-dy}deg)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        ref={coreRef}
        className="relative flex items-center justify-center"
        style={{
          width: 320,
          height: 320,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.12s ease-out',
          perspective: 900,
        }}
      >
        {/* Outer diffuse glow layers */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            background:
              'radial-gradient(circle, oklch(0.82 0.13 84 / 16%) 0%, oklch(0.7 0.1 80 / 6%) 55%, transparent 75%)',
            animation: 'aura-pulse 6s ease-in-out infinite',
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background:
              'radial-gradient(circle, oklch(0.9 0.1 88 / 22%) 0%, oklch(0.82 0.13 84 / 10%) 50%, transparent 72%)',
            animation: 'aura-pulse 4s ease-in-out infinite 1s',
          }}
        />

        {/* Orbit rings */}
        {RING_CONFIG.map((cfg, i) => (
          <OrbitRing key={i} {...cfg} />
        ))}

        {/* Scatter particles */}
        {Array.from({ length: 36 }, (_, i) => (
          <ParticleDot key={i} delay={i} radius={140 + (i % 3) * 20} />
        ))}

        {/* Core icosahedron — pure CSS polygon */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
          style={{ width: 72, height: 72 }}
        >
          {/* Hexagonal facets via clip-path to mimic icosahedron */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute rounded-sm"
              style={{
                width: 28,
                height: 28,
                background: `linear-gradient(${deg}deg, oklch(0.92 0.12 90 / 70%), oklch(0.65 0.12 78 / 40%))`,
                transform: `rotate(${deg}deg) translateY(-22px)`,
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                boxShadow: `0 0 14px 2px oklch(0.82 0.13 84 / 40%)`,
              }}
            />
          ))}
          {/* Central bright nucleus */}
          <div
            className="absolute rounded-full"
            style={{
              width: 36,
              height: 36,
              background:
                'radial-gradient(circle, oklch(0.98 0.07 95) 0%, oklch(0.88 0.14 86) 45%, oklch(0.7 0.12 80) 100%)',
              boxShadow:
                '0 0 24px 6px oklch(0.82 0.13 84 / 60%), 0 0 60px 20px oklch(0.82 0.13 84 / 25%)',
              animation: 'aura-pulse 3.5s ease-in-out infinite',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
