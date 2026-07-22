'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { FlowDiagram } from '@/components/flow-diagram'
import { GithubIcon } from '@/components/brand-icons'
import { projects } from '@/lib/portfolio-data'

const flowMap: Record<string, string[]> = {
  rag: ['Query', 'Embed', 'Retrieve', 'Re-rank', 'Generate', 'Stream'],
  agent: ['Input', 'Intent', 'Agent', 'Tools', 'Respond'],
  vision: ['Frame', 'Detect', 'Embed', 'Match', 'Identity'],
}

function TiltCard({
  project,
  index,
  onOpen,
}: {
  project: (typeof projects)[number]
  index: number
  onOpen: () => void
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        setTilt({ x: py * -6, y: px * 8 })
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="glass group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl p-6 text-left transition-shadow hover:gold-glow"
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-3xl transition-opacity group-hover:opacity-100 md:opacity-0" />

      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
        {project.tag}
      </span>
      <h3 className="mt-3 text-2xl font-semibold text-foreground">{project.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{project.blurb}</p>

      <div className="mt-5">
        <FlowDiagram stages={flowMap[project.flow]} compact />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-xs text-foreground/70 transition-colors group-hover:text-gold">
          Open case study
          <ArrowUpRight size={14} />
        </span>
        <a
          href={project.repo}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] text-foreground/70 transition-colors hover:border-gold/60 hover:text-gold"
          aria-label={`View ${project.title} repository on GitHub`}
        >
          <GithubIcon size={13} />
          Repo
        </a>
      </div>
    </motion.div>
  )
}

export function Projects() {
  const [active, setActive] = useState<number | null>(null)
  const project = active !== null ? projects[active] : null

  return (
    <section id="projects" className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading index="04" subtitle="Case Studies" title="Systems built to ship." />

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((p, i) => (
          <TiltCard key={p.title} project={p} index={i} onOpen={() => setActive(i)} />
        ))}
      </div>

      <AnimatePresence>
        {project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-md sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative my-6 w-full max-w-3xl rounded-3xl p-7 sm:p-10"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold/60 hover:text-gold"
                aria-label="Close case study"
              >
                <X size={16} />
              </button>

              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
                {project.tag}
              </span>
              <h3 className="mt-2 text-3xl font-bold text-foreground">{project.title}</h3>
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-4 py-2 font-mono text-xs text-gold transition-colors hover:bg-gold/15"
              >
                <GithubIcon size={14} />
                View Repository
                <ArrowUpRight size={13} />
              </a>

              <div className="mt-8 space-y-7">
                <Block label="Challenge" body={project.challenge} />
                <Block label="Architecture" body={project.architecture} />

                <div>
                  <Label>Data & LLM Flow</Label>
                  <div className="mt-3 rounded-2xl border border-border bg-card/40 p-5">
                    <FlowDiagram stages={flowMap[project.flow]} />
                  </div>
                </div>

                <div>
                  <Label>Engineering Decisions</Label>
                  <ul className="mt-3 space-y-2">
                    {project.decisions.map((d) => (
                      <li key={d} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gold" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label>Results</Label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {project.results.map((r) => (
                      <div
                        key={r}
                        className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs leading-snug text-foreground/80"
                      >
                        {r}
                      </div>
                    ))}
                  </div>
                </div>

                <Block label="Lessons Learned" body={project.lessons} />

                <div>
                  <Label>Tech Stack</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground/70"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">{children}</p>
  )
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{body}</p>
    </div>
  )
}
