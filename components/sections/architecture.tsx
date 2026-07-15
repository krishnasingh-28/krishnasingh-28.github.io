'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { FlowDiagram } from '@/components/flow-diagram'
import { architectures } from '@/lib/portfolio-data'

export function Architecture() {
  return (
    <section id="architecture" className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading
        index="05"
        subtitle="Systems Showcase"
        title="Architectures, animated."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {architectures.map((arch, i) => (
          <motion.div
            key={arch.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className="glass group relative overflow-hidden rounded-3xl p-7 transition-colors hover:border-gold/30"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gold">{`0${i + 1}`}</span>
              <h3 className="text-xl font-semibold text-foreground">{arch.title}</h3>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {arch.description}
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5">
              <FlowDiagram stages={arch.stages} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
