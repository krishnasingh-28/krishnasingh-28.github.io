'use client'

import { motion } from 'framer-motion'

export function FlowDiagram({
  stages,
  compact = false,
}: {
  stages: string[]
  compact?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className={`relative rounded-lg border border-gold/25 bg-card/60 font-mono text-foreground/85 ${
              compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
            }`}
          >
            {stage}
          </motion.div>

          {i < stages.length - 1 && (
            <div className={`relative mx-1 h-px overflow-hidden bg-border ${compact ? 'w-5' : 'w-8'}`}>
              <motion.span
                className="absolute inset-y-0 left-0 w-2 rounded-full bg-gold"
                animate={{ left: ['-10%', '110%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
