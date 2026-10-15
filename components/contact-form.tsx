'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { profile } from '@/lib/portfolio-data'

type Status = 'idle' | 'sending' | 'success' | 'error'

const fieldClass =
  'w-full rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-gold/50 focus:ring-2 focus:ring-gold/20'
const labelClass = 'mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // No key configured yet: hand off to the visitor's mail client instead of failing.
    if (!profile.web3formsKey) {
      const subject = (data.get('topic') as string) || `Portfolio message from ${data.get('name')}`
      const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      return
    }

    data.set('access_key', profile.web3formsKey)
    data.set('subject', `New portfolio message from ${data.get('name')}`)
    data.set('from_name', 'Portfolio — krishnasingh-28.github.io')

    setStatus('sending')
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-[22rem] flex-col items-center justify-center rounded-2xl border border-gold/30 bg-background/40 p-8 text-center"
          >
            <CheckCircle2 size={40} className="mb-4 text-gold" />
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">Message transmitted</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Thanks for reaching out — I&apos;ll get back to you soon.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 text-sm text-foreground underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* honeypot — Web3Forms discards submissions where this is ticked */}
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-name" className={labelClass}>Name</label>
                <input id="cf-name" name="name" required autoComplete="name" placeholder="Your name" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="cf-email" className={labelClass}>Email</label>
                <input id="cf-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={fieldClass} />
              </div>
            </div>
            <div>
              <label htmlFor="cf-topic" className={labelClass}>Subject <span className="normal-case tracking-normal">(optional)</span></label>
              <input id="cf-topic" name="topic" placeholder="Project, role, collaboration…" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="cf-message" className={labelClass}>Message</label>
              <textarea id="cf-message" name="message" required rows={5} placeholder="Tell me about what you're building" className={`${fieldClass} resize-none`} />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="group flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message
                    <Send size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
              {status === 'error' && (
                <p role="alert" className="text-sm text-destructive">
                  Couldn&apos;t send right now —{' '}
                  <a href={`mailto:${profile.email}`} className="underline underline-offset-4 hover:text-gold">
                    email me directly
                  </a>
                  .
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
