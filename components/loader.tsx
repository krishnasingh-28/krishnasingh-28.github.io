'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loaderModules } from '@/lib/portfolio-data'

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const total = 2600
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(eased)
      setActive(Math.min(loaderModules.length, Math.floor(eased * loaderModules.length + 0.001)))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setActive(loaderModules.length)
        setDone(true)
        setTimeout(onComplete, 900)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background grain"
        exit={{ opacity: 0, filter: 'blur(8px)' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="w-full max-w-md px-8">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center font-mono text-xs uppercase tracking-[0.35em] text-gold"
          >
            {done ? 'System Ready' : 'AI System Initializing'}
          </motion.p>

          <ul className="space-y-3">
            {loaderModules.map((mod, i) => {
              const state = i < active ? 'done' : i === active ? 'loading' : 'idle'
              return (
                <motion.li
                  key={mod.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: state === 'idle' ? 0.35 : 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between font-mono text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                        state === 'done'
                          ? 'bg-gold'
                          : state === 'loading'
                            ? 'animate-pulse bg-gold'
                            : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span className="text-foreground/80">Loading {mod.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {state === 'done' ? 'OK' : state === 'loading' ? '···' : ''}
                  </span>
                </motion.li>
              )
            })}
          </ul>

          <div className="mt-8">
            <div className="h-px w-full overflow-hidden bg-border">
              <motion.div
                className="h-full bg-gold"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>modules</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
