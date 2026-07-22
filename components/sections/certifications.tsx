'use client'

import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { certifications } from '@/lib/portfolio-data'

export function Certifications() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading index="07" subtitle="Credentials" title="Certifications." />

      <div className="grid gap-4 sm:grid-cols-2">
        {certifications.map((cert, i) => (
          <motion.a
            key={cert.title}
            href={cert.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.07, duration: 0.55 }}
            className="group relative block overflow-hidden rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-gold/50"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-gold/30 text-gold">
                  <Award size={18} />
                </span>
                <div>
                  <h3 className="font-semibold leading-tight text-foreground">{cert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
              </div>
              <span className="whitespace-nowrap font-mono text-xs text-gold">{cert.year}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
