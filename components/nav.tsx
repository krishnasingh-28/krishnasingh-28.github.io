'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${
          scrolled ? 'glass gold-glow' : ''
        }`}
        style={{ width: 'calc(100% - 2rem)' }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5"
          aria-label="Back to top"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/50 font-mono text-xs font-bold text-gold">
            KS
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.2em] text-foreground/70 sm:inline">
            AI Systems Engineer
          </span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-gold"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-4 mt-2 grid grid-cols-2 gap-1 rounded-2xl p-3 md:hidden"
          >
            {links.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => go(l.id)}
                  className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-gold"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
