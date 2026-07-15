'use client'

import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'
import { CountUp } from '@/components/count-up'
import { profile, stats } from '@/lib/portfolio-data'

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading index="01" subtitle="The Engineer" title="Systems thinking, shipped to production." />

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-pretty text-lg leading-relaxed text-foreground/80">
            {profile.summary}
          </p>

          <div className="mt-10 space-y-5 border-l border-gold/30 pl-6">
            {[
              { t: 'Architect', d: 'Design AI systems for latency, cost, and reliability — not demos.' },
              { t: 'Build', d: 'Ship retrieval, reasoning, and agent runtimes on FastAPI backends.' },
              { t: 'Operate', d: 'Instrument, evaluate, and iterate on live production traffic.' },
            ].map((item, i) => (
              <motion.div
                key={item.t}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="relative"
              >
                <span className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full bg-gold" />
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">{item.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.06 * i, duration: 0.6 }}
              className="glass rounded-2xl p-5 transition-colors hover:border-gold/40"
            >
              <div className="font-mono text-3xl font-bold text-gradient-gold">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-2 text-xs leading-snug text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
