'use client'

import { useEffect, useState } from 'react'

/**
 * Shared, module-level pointer target in normalised (-1 .. 1) space.
 * Written once per pointermove; each canvas layer lerps its own copy toward
 * it, so parallax stays smooth without triggering React re-renders.
 */
export const pointerTarget = { x: 0, y: 0 }

let listenerCount = 0
let detach: (() => void) | null = null

function attachPointer() {
  if (detach) return
  const onMove = (e: PointerEvent) => {
    pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1
    pointerTarget.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  detach = () => window.removeEventListener('pointermove', onMove)
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
