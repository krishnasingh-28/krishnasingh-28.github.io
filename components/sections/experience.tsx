'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { FlowDiagram } from '@/components/flow-diagram'
import { experiences, architectures } from '@/lib/portfolio-data'

const diagramMap: Record<string, string[]> = {
  financial: architectures[2].stages,
  rag: architectures[1].stages,
  analytics: ['Ingest', 'Transform', 'Model', 'Visualize', 'Decide'],
}

export function Experience() {
  const [open, setOpen] = useState(0)

  return (
    <section id="experience" className="relative mx-auto max-w-5xl px-6 py-28 md:py-36">
      <SectionHeading index="02" subtitle="Trajectory" title="An engineering timeline." />

      <div className="relative">
        <span className="absolute left-3 top-2 bottom-2 hidden w-px bg-gradient-to-b from-gold/50 via-border to-transparent md:block" />

        <ul className="space-y-4">
          {experiences.map((exp, i) => {
            const isOpen = open === i
            return (
              <motion.li
                key={exp.company}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="md:pl-12"
              >
                <span className="absolute left-1.5 hidden h-3 w-3 -translate-y-0 rounded-full border-2 border-gold bg-background md:block" />

                <div
                  className={`glass overflow-hidden rounded-2xl transition-all duration-300 ${
                    isOpen ? 'gold-glow' : 'hover:border-gold/30'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-start justify-between gap-4 p-6 text-left"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{exp.company}</h3>
                        <span className="font-mono text-[11px] uppercase tracking-widest text-gold">
                          {exp.context}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {exp.role} · {exp.period}
                      </p>
                    </div>
                    <span className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border text-gold">
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-6 pb-6 pt-5">
                          <p className="text-sm leading-relaxed text-foreground/80">{exp.summary}</p>

                          <ul className="mt-4 space-y-2">
                            {exp.highlights.map((h) => (
                              <li key={h} className="flex gap-3 text-sm text-muted-foreground">
                                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
                                {h}
                              </li>
                            ))}
                          </ul>

                          <div className="mt-6">
                            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                              System Flow
                            </p>
                            <FlowDiagram stages={diagramMap[exp.diagram]} compact />
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            {exp.stack.map((s) => (
                              <span
                                key={s}
                                className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
