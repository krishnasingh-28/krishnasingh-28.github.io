'use client'

import { motion } from 'framer-motion'
import { Mail, FileText, ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { GithubIcon, LinkedinIcon } from '@/components/brand-icons'
import { profile } from '@/lib/portfolio-data'

const channels = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
  { label: 'LinkedIn', value: 'in/krishna-singh28', href: profile.linkedin, Icon: LinkedinIcon },
  { label: 'GitHub', value: '@krishnasingh-28', href: profile.github, Icon: GithubIcon },
  { label: 'Resume', value: 'View Resume', href: profile.resume, Icon: FileText },
]

export function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-5xl px-6 py-28 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />

      <SectionHeading index="09" subtitle="Mission Control" title="Let's build the next generation of AI systems." />

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
        className="glass gold-glow relative overflow-hidden rounded-3xl p-8 md:p-12"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="mb-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
            Channel Open — Available for opportunities
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group flex items-center justify-between rounded-2xl border border-border bg-background/40 p-5 transition-colors hover:border-gold/50"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 text-gold">
                  <c.Icon size={16} />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="text-sm text-foreground">{c.value}</p>
                </div>
              </div>
              <ArrowUpRight
                size={16}
                className="text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
              />
            </motion.a>
          ))}
        </div>
      </motion.div>

      <p className="mt-16 text-center font-mono text-xs text-muted-foreground">
        Designed & engineered by {profile.name} · {new Date().getFullYear()}
      </p>
    </section>
  )
}
