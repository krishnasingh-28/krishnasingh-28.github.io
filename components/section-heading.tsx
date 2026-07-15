'use client'

import { motion } from 'framer-motion'

export function SectionHeading({
  index,
  title,
  subtitle,
}: {
  index: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4"
      >
        <span className="font-mono text-xs tracking-[0.3em] text-gold">{index}</span>
        <span className="h-px w-12 bg-gold/40" />
        {subtitle && (
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {subtitle}
          </span>
        )}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
      >
        {title}
      </motion.h2>
    </div>
  )
}
