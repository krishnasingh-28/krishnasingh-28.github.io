'use client'

import { useEffect, useState } from 'react'

/**
 * Shared, module-level pointer target in normalised (-1 .. 1) space.
 * Written once per pointermove; each canvas layer lerps its own copy toward
 * it, so parallax stays smooth without triggering React re-renders.
 */
export const pointerTarget = { x: 0, y: 0 }

/**
 * Pointer in *viewport pixels*, plus smoothed velocity and an activity ramp.
 * This is what the wave layers sample to deform their geometry, so the field
 * physically reacts to the cursor instead of only parallaxing.
 */
export const pointer = {
  /** raw latest position */
  x: -9999,
  y: -9999,
  /** eased position the field actually follows (feels like fluid inertia) */
  ex: -9999,
  ey: -9999,
  /** eased velocity in px/s, used for directional wake */
  vx: 0,
  vy: 0,
  /** 0..1 — rises while the cursor is over the hero, decays when it leaves */
  active: 0,
  /** what `active` eases toward */
  activeTarget: 0,
  /** 0..1 — rises with speed, drives how hard the field is pushed */
  energy: 0,
}

/** Expanding rings spawned by clicks and fast flicks. */
type Ripple = { x: number; y: number; t: number; strength: number }
export const ripples: Ripple[] = []

export function spawnRipple(x: number, y: number, strength = 1) {
  if (ripples.length > 6) ripples.shift()
  ripples.push({ x, y, t: 0, strength })
}

/** Advances pointer easing + ripple lifetimes. Call once per frame. */
export function stepPointer(dt: number) {
  if (pointer.ex < -9000) {
    pointer.ex = pointer.x
    pointer.ey = pointer.y
  }
  // critically-damped follow: heavy enough to feel like a fluid, not a cursor
  const k = 1 - Math.exp(-dt * 7)
  const nx = lerp(pointer.ex, pointer.x, k)
  const ny = lerp(pointer.ey, pointer.y, k)
  if (dt > 0) {
    pointer.vx = lerp(pointer.vx, (nx - pointer.ex) / dt, 0.25)
    pointer.vy = lerp(pointer.vy, (ny - pointer.ey) / dt, 0.25)
  }
  pointer.ex = nx
  pointer.ey = ny

  const speed = Math.hypot(pointer.vx, pointer.vy)
  pointer.energy = lerp(pointer.energy, Math.min(1, speed / 1400), 0.08)
  pointer.active = lerp(pointer.active, pointer.activeTarget, dt * 3)

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].t += dt
    if (ripples[i].t > 2.4) ripples.splice(i, 1)
  }
}

/**
 * Cursor-driven vertical displacement at a point, in pixels.
 *
 * Combines three effects, all falling off smoothly with distance so the mesh
 * bends as one surface rather than kinking around the cursor:
 *  - a swell that lifts/pushes the surface away from the pointer
 *  - a directional wake trailing the pointer's travel
 *  - concentric ripples from clicks / fast flicks
 */
export function displacementAt(x: number, y: number, radius: number) {
  let dy = 0

  if (pointer.active > 0.001) {
    const dx = x - pointer.ex
    const dyy = y - pointer.ey
    const dist = Math.hypot(dx, dyy)
    if (dist < radius) {
      // cosine falloff — zero slope at the rim, no visible seam
      const f = 0.5 + 0.5 * Math.cos((dist / radius) * Math.PI)
      const swell = f * f * pointer.active
      // Push the surface away from the pointer. The vertical term uses a
      // smooth odd function of dy (not Math.sign, which creases the mesh
      // where a strand crosses the pointer).
      const lobe = Math.tanh((dyy / radius) * 2.6)
      dy += lobe * swell * radius * 0.15
      // wake: the surface drags along the pointer's motion
      dy += (pointer.vy / 1000) * swell * 30 * (0.4 + pointer.energy)
      // long lateral shear so horizontal sweeps roll instead of just shifting
      dy += Math.sin(dx * 0.006 - pointer.vx * 0.0022) * swell * 10 * (0.3 + pointer.energy)
    }
  }

  for (const r of ripples) {
    const dist = Math.hypot(x - r.x, y - r.y)
    const front = r.t * 420
    const band = Math.abs(dist - front)
    if (band < 210) {
      const decay = Math.max(0, 1 - r.t / 2.4) ** 2
      const shape = Math.cos((band / 210) * Math.PI * 0.5) ** 2
      dy += Math.sin((dist - front) * 0.026) * shape * decay * r.strength * 22
    }
  }

  return dy
}

let listenerCount = 0
let detach: (() => void) | null = null

function attachPointer() {
  if (detach) return
  let lastFlick = 0
  const onMove = (e: PointerEvent) => {
    pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1
    pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.activeTarget = 1
    // a hard flick throws off a ripple, like flicking water
    const speed = Math.hypot(pointer.vx, pointer.vy)
    const now = e.timeStamp
    if (speed > 2200 && now - lastFlick > 420) {
      lastFlick = now
      spawnRipple(e.clientX, e.clientY, 0.6)
    }
  }
  const onDown = (e: PointerEvent) => spawnRipple(e.clientX, e.clientY, 1.15)
  const onLeave = () => {
    pointer.activeTarget = 0
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  detach = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerleave', onLeave)
  }
}

/** Enables global pointer tracking while at least one layer wants it. */
export function usePointerField(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    listenerCount += 1
    attachPointer()
    return () => {
      listenerCount -= 1
      if (listenerCount <= 0) {
        detach?.()
        detach = null
        pointerTarget.x = 0
        pointerTarget.y = 0
        pointer.activeTarget = 0
        pointer.active = 0
        ripples.length = 0
      }
    }
  }, [enabled])
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

/** True on touch / small screens — used to drop density and mouse tracking. */
export function useLightweightMode() {
  const [light, setLight] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)')
    const sync = () => setLight(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return light
}

/** Resizes a canvas to its CSS box at capped DPR. Returns CSS pixel size. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.max(1, Math.round(w * dpr))
  canvas.height = Math.max(1, Math.round(h * dpr))
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w, h }
}

/** Observes element size and re-runs a callback (debounced to a frame). */
export function observeResize(el: HTMLElement, cb: () => void) {
  let frame = 0
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(cb)
  })
  ro.observe(el)
  return () => {
    cancelAnimationFrame(frame)
    ro.disconnect()
  }
}

export const GOLD = {
  bright: (a: number) => `oklch(0.97 0.07 95 / ${a})`,
  core: (a: number) => `oklch(0.86 0.14 86 / ${a})`,
  deep: (a: number) => `oklch(0.68 0.1 79 / ${a})`,
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
