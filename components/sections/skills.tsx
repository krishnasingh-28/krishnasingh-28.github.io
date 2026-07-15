'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { skillGraph } from '@/lib/portfolio-data'

export function Skills() {
  const [hovered, setHovered] = useState<string | null>(null)

  const nodeMap = useMemo(
    () => Object.fromEntries(skillGraph.nodes.map((n) => [n.id, n])),
    [],
  )

  const connected = useMemo(() => {
    if (!hovered) return new Set<string>()
    const set = new Set<string>([hovered])
    skillGraph.edges.forEach(([a, b]) => {
      if (a === hovered) set.add(b)
      if (b === hovered) set.add(a)
    })
    return set
  }, [hovered])

  const isActive = (id: string) => !hovered || connected.has(id)
  const edgeActive = (a: string, b: string) =>
    !hovered || (connected.has(a) && connected.has(b) && (a === hovered || b === hovered))

  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading
        index="03"
        subtitle="Capability Graph"
        title="Skills as a connected blueprint."
      />

      <div className="glass relative aspect-[16/11] w-full overflow-hidden rounded-3xl md:aspect-[16/8]">
        <div className="grain absolute inset-0 opacity-30" />

        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {skillGraph.edges.map(([a, b], i) => {
            const na = nodeMap[a]
            const nb = nodeMap[b]
            const active = edgeActive(a, b)
            return (
              <motion.line
                key={i}
                x1={`${na.x}%`}
                y1={`${na.y}%`}
                x2={`${nb.x}%`}
                y2={`${nb.y}%`}
                stroke={active ? 'oklch(0.82 0.13 84)' : 'oklch(0.4 0.01 75)'}
                strokeWidth={active ? 1.4 : 0.6}
                strokeOpacity={active ? 0.8 : 0.25}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.05 }}
              />
            )
          })}
        </svg>

        {skillGraph.nodes.map((node, i) => {
          const active = isActive(node.id)
          const isCore = node.group === 'core'
          return (
            <motion.button
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border font-mono transition-all duration-300"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                fontSize: isCore ? '0.8rem' : '0.7rem',
                padding: isCore ? '0.5rem 1rem' : '0.35rem 0.75rem',
                borderColor: active ? 'oklch(0.82 0.13 84 / 0.6)' : 'oklch(0.4 0.01 75 / 0.4)',
                background: active
                  ? isCore
                    ? 'oklch(0.82 0.13 84 / 0.18)'
                    : 'oklch(0.2 0.004 70 / 0.9)'
                  : 'oklch(0.16 0.004 70 / 0.7)',
                color: active ? 'oklch(0.95 0.02 90)' : 'oklch(0.55 0.01 78)',
                boxShadow: active && (isCore || hovered === node.id)
                  ? '0 0 24px -4px oklch(0.82 0.13 84 / 0.5)'
                  : 'none',
                opacity: active ? 1 : 0.4,
              }}
            >
              {node.label}
            </motion.button>
          )
        })}
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        Hover a node to trace connected technologies.
      </p>
    </section>
  )
}
