'use client'

import { useEffect, useRef } from 'react'
import {
  GOLD,
  fitCanvas,
  lerp,
  observeResize,
  pointerTarget,
  useLightweightMode,
  usePointerField,
  useReducedMotion,
} from './field-utils'

type Particle = {
  x: number
  y: number
  /** depth 0.25 (far) .. 1 (near) — drives size, opacity, speed, parallax */
  z: number
  size: number
  alpha: number
  vx: number
  vy: number
  /** curved drifters steer their heading with a slow sine */
  curved: boolean
  angle: number
  curl: number
  speed: number
  twinkle: number
  twinkleSpeed: number
}

function build(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => {
    const z = 0.25 + Math.random() * 0.75
    const curved = Math.random() < 0.45
    const speed = (2 + Math.random() * 7) * z
    const angle = Math.random() * Math.PI * 2
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z,
      size: (0.5 + Math.random() * 1.5) * z,
      alpha: (0.12 + Math.random() * 0.4) * z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.5,
      curved,
      angle,
      curl: (Math.random() - 0.5) * 0.5,
      speed,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.15 + Math.random() * 0.4,
    }
  })
}

export function ParticleField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const light = useLightweightMode()
  usePointerField(!light && !reduced)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let { w, h } = fitCanvas(canvas, ctx)
    let particles = build(light ? 70 : 190, w, h)

    const stopResize = observeResize(canvas, () => {
      const size = fitCanvas(canvas, ctx)
      // keep particles in frame on resize without rebuilding their motion
      const sx = size.w / (w || 1)
      const sy = size.h / (h || 1)
      for (const p of particles) {
        p.x *= sx
        p.y *= sy
      }
      w = size.w
      h = size.h
    })

    const px = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      px.x = lerp(px.x, pointerTarget.x, 0.03)
      px.y = lerp(px.y, pointerTarget.y, 0.03)

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        if (p.curved) {
          p.angle += p.curl * dt
          p.vx = Math.cos(p.angle) * p.speed
          p.vy = Math.sin(p.angle) * p.speed * 0.5
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.twinkle += p.twinkleSpeed * dt

        // wrap with a margin so parallax never reveals an empty edge
        const m = 40
        if (p.x < -m) p.x = w + m
        else if (p.x > w + m) p.x = -m
        if (p.y < -m) p.y = h + m
        else if (p.y > h + m) p.y = -m

        const par = p.z * 22
        const x = p.x - px.x * par
        const y = p.y - px.y * par * 0.6
        const a = p.alpha * (0.72 + 0.28 * Math.sin(p.twinkle))

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.z > 0.75 ? GOLD.bright(a) : GOLD.core(a)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      const once = requestAnimationFrame((n) => {
        draw(n)
        cancelAnimationFrame(raf)
      })
      return () => {
        cancelAnimationFrame(once)
        cancelAnimationFrame(raf)
        stopResize()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      stopResize()
      particles = []
    }
  }, [light, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
