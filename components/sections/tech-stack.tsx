'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { techStack } from '@/lib/portfolio-data'

type Item = { label: string; group: string }

function useSpherePoints(count: number) {
  return useMemo(() => {
    const pts: { x: number; y: number; z: number }[] = []
    const offset = 2 / count
    const inc = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * inc
      pts.push({ x: Math.cos(phi) * r, y, z: Math.sin(phi) * r })
    }
    return pts
  }, [count])
}

function TechSphere({
  items,
  onHover,
  activeGroup,
}: {
  items: Item[]
  onHover: (label: string | null) => void
  activeGroup: string | null
}) {
  const points = useSpherePoints(items.length)
  const [rot, setRot] = useState({ x: 0.2, y: 0 })
  const [mounted, setMounted] = useState(false)
  const rotRef = useRef(rot)
  rotRef.current = rot
  const speed = useRef({ x: 0.0009, y: 0.0016 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    let raf = 0
    const tick = () => {
      setRot((r) => ({ x: r.x + speed.current.x, y: r.y + speed.current.y }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const radius = 150

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-[340px] w-[340px] select-none sm:h-[400px] sm:w-[400px]"
      onMouseMove={(e) => {
        const r = containerRef.current?.getBoundingClientRect()
        if (!r) return
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        speed.current = { x: -py * 0.006, y: px * 0.01 }
      }}
      onMouseLeave={() => {
        speed.current = { x: 0.0009, y: 0.0016 }
      }}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
      {mounted && items.map((item, i) => {
        const p = points[i]
        const cosX = Math.cos(rot.x)
        const sinX = Math.sin(rot.x)
        const cosY = Math.cos(rot.y)
        const sinY = Math.sin(rot.y)
        let { x, y, z } = p
        const x1 = x * cosY - z * sinY
        const z1 = x * sinY + z * cosY
        const y1 = y * cosX - z1 * sinX
        const z2 = y * sinX + z1 * cosX
        const scale = (z2 + 1.6) / 2.6
        const dim = activeGroup && item.group !== activeGroup
        return (
          <span
            key={item.label}
            onMouseEnter={() => onHover(item.label)}
            onMouseLeave={() => onHover(null)}
            className="absolute left-1/2 top-1/2 cursor-default whitespace-nowrap font-mono transition-colors"
            style={{
              transform: `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y1 * radius}px, 0)`,
              fontSize: `${0.62 + scale * 0.5}rem`,
              opacity: dim ? 0.12 : 0.35 + scale * 0.65,
              color: item.group === activeGroup ? 'oklch(0.88 0.12 88)' : 'oklch(0.85 0.02 90)',
              zIndex: Math.round(scale * 100),
              textShadow: item.group === activeGroup ? '0 0 12px oklch(0.82 0.13 84 / 0.6)' : 'none',
            }}
          >
            {item.label}
          </span>
        )
      })}
    </div>
  )
}

export function TechStack() {
  const groups = Object.keys(techStack)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const items: Item[] = useMemo(
    () =>
      Object.entries(techStack).flatMap(([group, list]) =>
        list.map((label) => ({ label, group })),
      ),
    [],
  )

  return (
    <section id="stack" className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading index="06" subtitle="Toolbox" title="The full technology stack." />

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-2 lg:order-1">
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(activeGroup === g ? null : g)}
                className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                  activeGroup === g
                    ? 'border-gold/60 bg-gold/10 text-gold'
                    : 'border-border text-muted-foreground hover:border-gold/40 hover:text-foreground'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="mt-8 min-h-[160px]">
            <motion.p
              key={hovered ?? activeGroup ?? 'all'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-xs uppercase tracking-[0.25em] text-gold"
            >
              {hovered ?? activeGroup ?? 'All Technologies'}
            </motion.p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeGroup ?? 'all'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {(activeGroup
                  ? (techStack[activeGroup as keyof typeof techStack] as readonly string[])
                  : items.map((i) => i.label)
                ).map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.018, duration: 0.25, ease: 'easeOut' }}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      hovered === t
                        ? 'border-gold/60 bg-gold/10 text-gold'
                        : 'border-border text-foreground/70'
                    }`}
                  >
                    {t}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <TechSphere items={items} onHover={setHovered} activeGroup={activeGroup} />
        </div>
      </div>
    </section>
  )
}
