'use client'

import { useEffect, useRef } from 'react'
import {
  lerp,
  pointerTarget,
  useLightweightMode,
  usePointerField,
  useReducedMotion,
} from './field-utils'

export function AmbientGlow({ className = '' }: { className?: string }) {
  const glowRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const light = useLightweightMode()
  const track = !light && !reduced
  usePointerField(track)

  useEffect(() => {
    const el = glowRef.current
    if (!el || !track) return
    const cur = { x: 0, y: 0 }
    let raf = 0
    const loop = () => {
      cur.x = lerp(cur.x, pointerTarget.x, 0.02)
      cur.y = lerp(cur.y, pointerTarget.y, 0.02)
      el.style.transform = `translate3d(calc(-50% + ${(cur.x * 34).toFixed(2)}px), calc(-50% + ${(cur.y * 24).toFixed(2)}px), 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [track])

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {/* extremely slow cinematic light sweeps */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="light-sweep absolute -inset-x-1/2 inset-y-0" />
        <div
          className="light-sweep absolute -inset-x-1/2 inset-y-0"
          style={{ animationDuration: '52s', animationDelay: '-18s' }}
        />
      </div>

      {/* breathing core glow that subtly follows the cursor */}
      <div
        ref={glowRef}
        className="gold-aura absolute left-1/2 top-1/2 h-[68vh] w-[68vh] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />

      {/* radial waves expanding outward every few seconds */}
      <div className="absolute left-1/2 top-1/2 h-[64vh] w-[64vh] -translate-x-1/2 -translate-y-1/2">
        {[0, 3, 6].map((d) => (
          <div
            key={d}
            className="ambient-wave absolute inset-0 rounded-full"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>
    </div>
  )
}
