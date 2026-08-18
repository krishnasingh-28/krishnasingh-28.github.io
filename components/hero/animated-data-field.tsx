'use client'

import { useEffect, useRef } from 'react'
import {
  GOLD,
  displacementAt,
  fitCanvas,
  lerp,
  observeResize,
  pointer,
  pointerTarget,
  stepPointer,
  useLightweightMode,
  usePointerField,
  useReducedMotion,
} from './field-utils'

/**
 * A bundle is a sheet of near-parallel filaments that share one flow path —
 * this is what gives the reference image its combed, silk-like density.
 */
type Bundle = {
  /** 0 = background (slow, faint), 1 = midground, 2 = foreground (bright, fast) */
  depth: 0 | 1 | 2
  dir: -1 | 1
  baseY: number
  amp: number
  freq: number
  phase: number
  speed: number
  alpha: number
  /** filaments in this sheet */
  strands: number
  /** vertical spread of the sheet, in fractions of height */
  spread: number
  /** how strongly this sheet answers the cursor */
  react: number
  travel: number
  travelSpeed: number
  pulse: number
  pulseSpeed: number
  pulseDelay: number
}

const DEPTH = {
  0: { parallax: 4, alpha: 0.3, width: 0.5, speed: 0.28, react: 0.45 },
  1: { parallax: 12, alpha: 0.6, width: 0.75, speed: 0.6, react: 0.8 },
  2: { parallax: 26, alpha: 1, width: 1, speed: 1, react: 1.15 },
} as const

function build(light: boolean): Bundle[] {
  const counts = light ? [2, 2, 2] : [3, 3, 3]
  const out: Bundle[] = []
  ;([0, 1, 2] as const).forEach((depth) => {
    for (let i = 0; i < counts[depth]; i++) {
      const dir = i % 2 === 0 ? 1 : -1
      // keep the field clear of the central type band: a broad lower sweep
      // plus a couple of faint traces along the top edge
      const top = i % 3 === 2
      const baseY = top ? 0.04 + Math.random() * 0.14 : 0.62 + Math.random() * 0.34
      out.push({
        depth,
        dir,
        baseY,
        amp: (0.035 + Math.random() * 0.085) * (depth === 0 ? 0.6 : 1),
        freq: 1 + Math.random() * 1.9,
        phase: Math.random() * Math.PI * 2,
        speed: (0.035 + Math.random() * 0.06) * DEPTH[depth].speed,
        alpha: DEPTH[depth].alpha * (0.55 + Math.random() * 0.45),
        strands: light ? 5 + ((i * 3) % 4) : 8 + ((i * 5) % 7),
        spread: 0.035 + Math.random() * 0.075,
        react: DEPTH[depth].react * (0.75 + Math.random() * 0.5),
        travel: Math.random(),
        travelSpeed: 0.05 + Math.random() * 0.1,
        pulse: -1,
        pulseSpeed: 0.16 + Math.random() * 0.16,
        pulseDelay: Math.random() * 9,
      })
    }
  })
  return out
}

export function AnimatedDataField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const light = useLightweightMode()
  usePointerField(!reduced)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let { w, h } = fitCanvas(canvas, ctx)
    // canvas-space origin, so pointer (viewport px) maps into our coordinates
    let top = canvas.getBoundingClientRect().top
    let left = canvas.getBoundingClientRect().left
    const syncRect = () => {
      const r = canvas.getBoundingClientRect()
      top = r.top
      left = r.left
    }
    const stopResize = observeResize(canvas, () => {
      const size = fitCanvas(canvas, ctx)
      w = size.w
      h = size.h
      syncRect()
    })
    window.addEventListener('scroll', syncRect, { passive: true })

    const bundles = build(light)
    const px = { x: 0, y: 0 }
    let raf = 0
    let last = performance.now()
    let time = 0

    /** influence radius of the cursor, relative to the canvas */
    const radius = () => Math.max(190, Math.min(w, h) * 0.42)

    /**
     * Point on one filament. `k` is the strand's offset within its sheet
     * (-1..1). Cursor displacement is sampled in viewport space and folded
     * into the same vertical term as the ambient wave, so the sheet bends as
     * a continuous surface.
     */
    const pointAt = (b: Bundle, t: number, k: number, ox: number, oy: number) => {
      const x = (b.dir === 1 ? t : 1 - t) * w
      const p = x / w
      const wave =
        Math.sin(p * b.freq * Math.PI * 2 + time * b.speed * Math.PI * 2 + b.phase) * b.amp
      const warp =
        Math.sin(p * b.freq * 0.6 * Math.PI * 2 - time * b.speed * 1.7 + b.phase * 1.7) *
        b.amp *
        0.45
      // strands fan apart toward the edges and comb together mid-span
      const fan = 0.45 + 0.55 * Math.abs(p - 0.5) * 2
      const converge = 0.45 + 0.55 * Math.abs(p - 0.5) * 2
      const cx = x + ox
      const cy = (b.baseY + (wave + warp) * converge + k * b.spread * fan) * h + oy
      const d = displacementAt(cx + left, cy + top, radius()) * b.react
      return { x: cx, y: cy + d }
    }

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      time += dt
      stepPointer(dt)
      px.x = lerp(px.x, pointerTarget.x, 0.045)
      px.y = lerp(px.y, pointerTarget.y, 0.045)

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      for (const b of bundles) {
        const d = DEPTH[b.depth]
        const ox = -px.x * d.parallax
        const oy = -px.y * d.parallax * 0.5

        b.travel = (b.travel + dt * b.travelSpeed) % 1
        if (b.pulse < 0) {
          b.pulseDelay -= dt
          if (b.pulseDelay <= 0) b.pulse = 0
        } else {
          b.pulse += dt * b.pulseSpeed
          if (b.pulse > 1) {
            b.pulse = -1
            b.pulseDelay = 6 + Math.random() * 12
          }
        }

        // shared gradient for the whole sheet, brighter while stirred
        const boost = 1 + pointer.active * pointer.energy * 0.5
        const a = b.alpha * boost
        const grad = ctx.createLinearGradient(0, 0, w, 0)
        grad.addColorStop(0, GOLD.deep(0))
        grad.addColorStop(0.16, GOLD.deep(a * 0.42))
        grad.addColorStop(0.5, GOLD.core(a * 0.8))
        grad.addColorStop(0.84, GOLD.deep(a * 0.42))
        grad.addColorStop(1, GOLD.deep(0))
        if (b.pulse >= 0) {
          const c = b.dir === 1 ? b.pulse : 1 - b.pulse
          const lo = Math.max(0.001, c - 0.13)
          const hi = Math.min(0.999, c + 0.13)
          grad.addColorStop(lo, GOLD.core(a * 0.55))
          grad.addColorStop(Math.min(0.998, Math.max(0.002, c)), GOLD.bright(a * 0.9))
          grad.addColorStop(hi, GOLD.core(a * 0.55))
        }
        ctx.strokeStyle = grad

        // enough samples that cursor-driven curvature stays smooth, not faceted
        const steps = b.depth === 0 ? 40 : light ? 48 : 72
        // ---- filament sheet
        for (let s = 0; s < b.strands; s++) {
          const k = b.strands === 1 ? 0 : (s / (b.strands - 1)) * 2 - 1
          // centre strands read brightest, rim strands fade out
          const edge = 1 - Math.abs(k) * 0.72
          ctx.globalAlpha = edge
          ctx.lineWidth = d.width * (0.4 + edge * 0.7)
          ctx.beginPath()
          for (let i = 0; i <= steps; i++) {
            const pt = pointAt(b, i / steps, k, ox, oy)
            if (i === 0) ctx.moveTo(pt.x, pt.y)
            else ctx.lineTo(pt.x, pt.y)
          }
          ctx.stroke()
        }
        ctx.globalAlpha = 1

        // ---- luminous nodes scattered along the sheet (reference sparkle)
        const nodes = b.depth === 0 ? 0 : light ? 8 : 14
        for (let n = 0; n < nodes; n++) {
          const t = ((n * 0.6180339887 + b.phase * 0.1591549) % 1 + 1) % 1
          const k = ((n * 0.3819660113 * 2) % 2) - 1
          const pt = pointAt(b, t, k, ox, oy)
          const tw = 0.5 + 0.5 * Math.sin(time * 2.1 + n * 1.7 + b.phase)
          const size = (b.depth === 2 ? 1.5 : 1) * (0.45 + tw * 0.75)
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2)
          ctx.fillStyle = GOLD.bright(0.42 * d.alpha * (0.4 + tw * 0.6) * boost)
          ctx.fill()
        }

        // ---- travelling light with a soft trail, on the sheet's centreline
        const trailSteps = b.depth === 2 ? 9 : 5
        for (let i = trailSteps; i >= 0; i--) {
          const t = (b.travel - i * 0.012 + 1) % 1
          const pt = pointAt(b, t, 0, ox, oy)
          const fade = (1 - i / (trailSteps + 1)) ** 2
          const size = (b.depth === 2 ? 1.9 : 1.3) * fade
          if (size < 0.08) continue
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2)
          ctx.fillStyle = GOLD.bright(0.5 * fade * d.alpha)
          ctx.fill()
        }
        if (b.depth === 2) {
          const pt = pointAt(b, b.travel, 0, ox, oy)
          const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 16)
          glow.addColorStop(0, GOLD.bright(0.3))
          glow.addColorStop(1, GOLD.core(0))
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      raf = requestAnimationFrame(draw)
    }

    if (reduced) {
      const rafOnce = requestAnimationFrame((n) => {
        draw(n)
        cancelAnimationFrame(raf)
      })
      return () => {
        cancelAnimationFrame(rafOnce)
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', syncRect)
        stopResize()
      }
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', syncRect)
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
