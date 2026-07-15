'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import { profile } from '@/lib/portfolio-data'

const AiCore = dynamic(() => import('./ai-core').then((m) => m.AiCore), {
  ssr: false,
})

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function Hero({ ready }: { ready: boolean }) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* 3D core */}
      <div className="pointer-events-none absolute inset-0 opacity-90">
        {ready && <AiCore />}
      </div>

      {/* radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--background)_78%)]" />
      <div className="pointer-events-none absolute inset-0 grain opacity-40" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
            System Online
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl"
        >
          {profile.name.split(' ')[0]}{' '}
          <span className="text-gradient-gold">{profile.name.split(' ')[1]}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-5 text-xl font-medium tracking-tight text-foreground/90 sm:text-2xl"
        >
          {profile.role}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground sm:text-sm"
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => scrollTo('projects')}
            className="group flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Explore Projects
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href={profile.resume}
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/60 hover:text-gold"
          >
            <FileText size={16} />
            View Resume
          </a>
          <button
            onClick={() => scrollTo('contact')}
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/60 hover:text-gold"
          >
            <Mail size={16} />
            Contact
          </button>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.button
        onClick={() => scrollTo('about')}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-label="Scroll to enter the system"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Scroll to enter the system
        </span>
        <span className="flex h-8 w-5 items-start justify-center rounded-full border border-border p-1">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="h-1.5 w-1 rounded-full bg-gold"
          />
        </span>
      </motion.button>
    </section>
  )
}
