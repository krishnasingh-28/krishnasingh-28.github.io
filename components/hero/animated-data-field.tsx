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

type Ribbon = {
  /** 0 = background (slow, faint), 1 = midground, 2 = foreground (bright, fast) */
  depth: 0 | 1 | 2
  /** side the ribbon flows in from */
  dir: -1 | 1
  baseY: number
  amp: number
  freq: number
  phase: number
  speed: number
  width: number
  alpha: number
  /** travelling luminous particle position along the path (0..1) */
  travel: number
  travelSpeed: number
  /** brightness pulse position along the path (0..1), <0 while idle */
  pulse: number
  pulseSpeed: number
  pulseDelay: number
}

const DEPTH = {
  0: { parallax: 4, alpha: 0.32, width: 0.55, speed: 0.28 },
  1: { parallax: 12, alpha: 0.62, width: 1, speed: 0.6 },
  2: { parallax: 26, alpha: 1, width: 1.35, speed: 1 },
} as const

function build(light: boolean): Ribbon[] {
  const counts = light ? [3, 3, 2] : [5, 5, 4]
  const out: Ribbon[] = []
  ;([0, 1, 2] as const).forEach((depth) => {
    for (let i = 0; i < counts[depth]; i++) {
      const dir = i % 2 === 0 ? 1 : -1
      // keep the field out of the central type band: sweep the lower area
      // (as in the reference) with a few faint traces up top
      const top = i % 3 === 2
      const baseY = top ? 0.05 + Math.random() * 0.16 : 0.66 + Math.random() * 0.3
      out.push({
        depth,
        dir,
        baseY,
        amp: (0.03 + Math.random() * 0.09) * (depth === 0 ? 0.6 : 1),
        freq: 1.1 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        speed: (0.04 + Math.random() * 0.07) * DEPTH[depth].speed,
        width: (depth === 2 ? 1 : depth === 1 ? 2.2 : 1.1) * (0.7 + Math.random() * 0.7),
        alpha: DEPTH[depth].alpha * (0.5 + Math.random() * 0.5),
        travel: Math.random(),
        travelSpeed: 0.05 + Math.random() * 0.11,
        pulse: -1,
        pulseSpeed: 0.16 + Math.random() * 0.16,
        pulseDelay: Math.random() * 9,
      })
    }
  })
  return out
}

/** Point on a ribbon at normalised position t (0..1). */
function pointAt(r: Ribbon, t: number, w: number, h: number, time: number) {
  const x = (r.dir === 1 ? t : 1 - t) * w
  const p = x / w
  const wave =
    Math.sin(p * r.freq * Math.PI * 2 + time * r.speed * Math.PI * 2 + r.phase) *
    r.amp
  // secondary, slower deformation so the curve breathes instead of sliding
  const warp =
    Math.sin(p * r.freq * 0.6 * Math.PI * 2 - time * r.speed * 1.7 + r.phase * 1.7) *
    r.amp *
    0.45
  // converge amplitude toward the centre so ribbons funnel inward
  const converge = 0.45 + 0.55 * Math.abs(p - 0.5) * 2
  return { x, y: (r.baseY + (wave + warp) * converge) * h }
}

export function AnimatedDataField({ className = '' }: { className?: string }) {
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
    const stopResize = observeResize(canvas, () => {
      const size = fitCanvas(canvas, ctx)
      w = size.w
      h = size.h
    })

    const ribbons = build(light)
    const px = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()
    let time = 0

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      px.x = lerp(px.x, pointerTarget.x, 0.045)
      px.y = lerp(px.y, pointerTarget.y, 0.045)

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      for (const r of ribbons) {
        const d = DEPTH[r.depth]
        const ox = -px.x * d.parallax
        const oy = -px.y * d.parallax * 0.5

        // advance travelling light + occasional brightness pulse
        r.travel = (r.travel + dt * r.travelSpeed) % 1
        if (r.pulse < 0) {
          r.pulseDelay -= dt
          if (r.pulseDelay <= 0) r.pulse = 0
        } else {
          r.pulse += dt * r.pulseSpeed
          if (r.pulse > 1) {
            r.pulse = -1
            r.pulseDelay = 6 + Math.random() * 12
          }
        }

        // ---- ribbon path
        const steps = r.depth === 0 ? 26 : 40
        ctx.beginPath()
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const p = pointAt(r, t, w, h, time)
          if (i === 0) ctx.moveTo(p.x + ox, p.y + oy)
          else ctx.lineTo(p.x + ox, p.y + oy)
        }

        // gradient fades the ribbon at both edges; the pulse rides inside it
        const grad = ctx.createLinearGradient(0, 0, w, 0)
        const a = r.alpha
        grad.addColorStop(0, GOLD.deep(0))
        grad.addColorStop(0.18, GOLD.deep(a * 0.5))
        grad.addColorStop(0.5, GOLD.core(a * 0.85))
        grad.addColorStop(0.82, GOLD.deep(a * 0.5))
        grad.addColorStop(1, GOLD.deep(0))
        if (r.pulse >= 0) {
          const c = r.dir === 1 ? r.pulse : 1 - r.pulse
          const lo = Math.max(0.001, c - 0.13)
          const hi = Math.min(0.999, c + 0.13)
          grad.addColorStop(lo, GOLD.core(a * 0.6))
          grad.addColorStop(Math.min(0.998, Math.max(0.002, c)), GOLD.bright(a * 0.95))
          grad.addColorStop(hi, GOLD.core(a * 0.6))
        }
        ctx.strokeStyle = grad
        ctx.lineWidth = r.width * d.width
        ctx.stroke()

        // ---- luminous particle riding the ribbon, with a soft trail
        const trailSteps = r.depth === 2 ? 9 : 5
        for (let i = trailSteps; i >= 0; i--) {
          const t = (r.travel - i * 0.012 + 1) % 1
          const p = pointAt(r, t, w, h, time)
          const fade = (1 - i / (trailSteps + 1)) ** 2
          const size = (r.depth === 2 ? 1.9 : 1.3) * fade
          if (size < 0.08) continue
          ctx.beginPath()
          ctx.arc(p.x + ox, p.y + oy, size, 0, Math.PI * 2)
          ctx.fillStyle = GOLD.bright(0.5 * fade * d.alpha)
          ctx.fill()
        }
        if (r.depth === 2) {
          const p = pointAt(r, r.travel, w, h, time)
          const glow = ctx.createRadialGradient(p.x + ox, p.y + oy, 0, p.x + ox, p.y + oy, 16)
          glow.addColorStop(0, GOLD.bright(0.3))
          glow.addColorStop(1, GOLD.core(0))
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(p.x + ox, p.y + oy, 16, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      // single static frame — no motion, same visual language
      const rafOnce = requestAnimationFrame((n) => {
        draw(n)
        cancelAnimationFrame(raf)
      })
      return () => {
        cancelAnimationFrame(rafOnce)
        cancelAnimationFrame(raf)
        stopResize()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      stopResize()
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
