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

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  /** slowly rotating heading so the network reorganises itself */
  heading: number
  turn: number
  speed: number
}

function build(count: number, w: number, h: number): Node[] {
  return Array.from({ length: count }, () => {
    const heading = Math.random() * Math.PI * 2
    const speed = 3 + Math.random() * 6
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      heading,
      turn: (Math.random() - 0.5) * 0.16,
      speed,
    }
  })
}

export function NeuralNetworkLayer({ className = '' }: { className?: string }) {
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
    const count = light ? 16 : 30
    let nodes = build(count, w, h)
    const linkDist = light ? 150 : 195

    const stopResize = observeResize(canvas, () => {
      const size = fitCanvas(canvas, ctx)
      const sx = size.w / (w || 1)
      const sy = size.h / (h || 1)
      for (const n of nodes) {
        n.x *= sx
        n.y *= sy
      }
      w = size.w
      h = size.h
    })

    const px = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()
    let time = 0

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      px.x = lerp(px.x, pointerTarget.x, 0.025)
      px.y = lerp(px.y, pointerTarget.y, 0.025)

      ctx.clearRect(0, 0, w, h)

      for (const n of nodes) {
        n.heading += n.turn * dt
        n.vx = Math.cos(n.heading) * n.speed
        n.vy = Math.sin(n.heading) * n.speed
        n.x += n.vx * dt
        n.y += n.vy * dt
        const m = 60
        if (n.x < -m) n.x = w + m
        else if (n.x > w + m) n.x = -m
        if (n.y < -m) n.y = h + m
        else if (n.y > h + m) n.y = -m
      }

      const ox = -px.x * 16
      const oy = -px.y * 10
      // global breath keeps the mesh from ever reading as a hard graphic
      const breath = 0.55 + 0.45 * Math.sin(time * 0.22)

      ctx.lineWidth = 0.6
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist > linkDist) continue
          // smooth fade in/out as nodes drift into and out of range
          const t = 1 - dist / linkDist
          const alpha = t * t * 0.13 * breath
          if (alpha < 0.004) continue
          ctx.beginPath()
          ctx.moveTo(a.x + ox, a.y + oy)
          ctx.lineTo(b.x + ox, b.y + oy)
          ctx.strokeStyle = GOLD.core(alpha)
          ctx.stroke()
        }
      }

      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x + ox, n.y + oy, 1.1, 0, Math.PI * 2)
        ctx.fillStyle = GOLD.core(0.22 * breath)
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
      nodes = []
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
