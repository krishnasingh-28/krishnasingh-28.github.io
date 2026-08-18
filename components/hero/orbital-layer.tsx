'use client'

import { useEffect, useRef } from 'react'
import {
  lerp,
  pointerTarget,
  useLightweightMode,
  usePointerField,
  useReducedMotion,
} from './field-utils'

/** Thin elliptical traces at different tilts, radii and rotation speeds. */
const RINGS = [
  { rx: 210, ry: 196, dur: 68, rev: false, rot: -8, opacity: 0.2, width: 0.9 },
  { rx: 300, ry: 250, dur: 96, rev: true, rot: 12, opacity: 0.15, width: 0.8 },
  { rx: 396, ry: 300, dur: 128, rev: false, rot: -18, opacity: 0.11, width: 0.7 },
  { rx: 500, ry: 344, dur: 160, rev: true, rot: 6, opacity: 0.08, width: 0.6 },
]

export function OrbitalLayer({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const light = useLightweightMode()
  const track = !light && !reduced
  usePointerField(track)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || !track) return
    const cur = { x: 0, y: 0 }
    let raf = 0
    const loop = () => {
      cur.x = lerp(cur.x, pointerTarget.x, 0.035)
      cur.y = lerp(cur.y, pointerTarget.y, 0.035)
      el.style.transform = `translate3d(${(-cur.x * 18).toFixed(2)}px, ${(-cur.y * 12).toFixed(2)}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [track])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="-520 -400 1040 800"
        className="h-[125vh] w-[125vh] max-w-none"
        fill="none"
      >
        {RINGS.map((r, i) => (
          <g
            key={i}
            className={r.rev ? 'orbit-spin-rev' : 'orbit-spin'}
            style={{ ['--orbit-dur' as string]: `${r.dur}s` }}
          >
            <ellipse
              cx="0"
              cy="0"
              rx={r.rx}
              ry={r.ry}
              transform={`rotate(${r.rot})`}
              stroke={`oklch(0.86 0.14 86 / ${r.opacity})`}
              strokeWidth={r.width}
            />
            {/* a short bright arc drifts around one trace as a travelling pulse */}
            {i < 2 && (
              <ellipse
                cx="0"
                cy="0"
                rx={r.rx}
                ry={r.ry}
                transform={`rotate(${r.rot})`}
                stroke={`oklch(0.97 0.07 95 / ${r.opacity * 2.6})`}
                strokeWidth={r.width * 1.6}
                strokeLinecap="round"
                strokeDasharray="70 2400"
                className="orbit-pulse"
                style={{ animationDuration: `${r.dur / 2}s`, animationDelay: `${i * 7}s` }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
