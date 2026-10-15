'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import { profile } from '@/lib/portfolio-data'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/** Share of the pinned scroll travel used to play the video; the rest holds the last frame. */
const VIDEO_END = 0.92

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Drives <video>.currentTime from scroll progress. The video file is all-intra so
 * seeking is instant; an eased follower on top removes any wheel/trackpad stepping.
 */
function useScrubVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  progress: MotionValue<number>,
  enabled: boolean,
) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const lastFrame = () => Math.max(0, (video.duration || 0) - 0.04)

    if (!enabled) {
      const showEnd = () => {
        video.currentTime = lastFrame()
      }
      if (video.readyState >= 1) showEnd()
      else video.addEventListener('loadedmetadata', showEnd, { once: true })
      return () => video.removeEventListener('loadedmetadata', showEnd)
    }

    // iOS/Safari only allow scrubbing once the element has been "activated" by play().
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {})
    }
    video.addEventListener('loadeddata', unlock, { once: true })

    let raf = 0
    let last = performance.now()
    let current = 0

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (video.duration) {
        const target = clamp01(progress.get() / VIDEO_END) * lastFrame()
        current += (target - current) * (1 - Math.exp(-dt * 14))
        if (Math.abs(current - target) < 0.002) current = target
        if (Math.abs(video.currentTime - current) > 0.001) video.currentTime = current
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('loadeddata', unlock)
    }
  }, [videoRef, progress, enabled])
}

function useIsWide() {
  const [wide, setWide] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setWide(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return wide
}

function NameWord({
  text,
  ready,
  startIndex,
}: {
  text: string
  ready: boolean
  startIndex: number
}) {
  return (
    <span className="inline-block whitespace-nowrap" aria-hidden="true">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            delay: 0.3 + (startIndex + i) * 0.05,
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-gold-shimmer inline-block"
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero({ ready }: { ready: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduceMotion = !!useReducedMotion()
  const wide = useIsWide()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  useScrubVideo(videoRef, scrollYProgress, !reduceMotion)

  // smoothed copy drives the typography / camera so it feels weighted, not twitchy
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4 })

  const spread = wide ? 3 : 0
  const leftX = useTransform(p, [0, VIDEO_END], [0, -spread])
  const rightX = useTransform(p, [0, VIDEO_END], [0, spread])
  const leftXvw = useTransform(leftX, (v) => `${v}vw`)
  const rightXvw = useTransform(rightX, (v) => `${v}vw`)

  const zoom = useTransform(p, [0, VIDEO_END], reduceMotion ? [1, 1] : [1, 1.1])
  const eyeGlow = useTransform(p, [0.5, 0.82], [0, 0.55])
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0])
  const progressScale = useTransform(p, [0, VIDEO_END], [0, 1])
  const progressOpacity = useTransform(p, [0, 0.03, 0.9, 0.97], [0, 1, 1, 0])

  const [first, ...rest] = profile.name.split(' ')
  const last = rest.join(' ')

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative ${reduceMotion ? 'h-svh' : 'h-[420svh]'}`}
      style={{ ['--hv' as string]: 'max(100svh, 56.25vw)', ['--hw' as string]: 'max(100vw, 177.78svh)' }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-background">
        {/* ── scroll-scrubbed video background ── */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale: zoom, transformOrigin: '50% 10%' }}
        >
          <video
            ref={videoRef}
            src="/video/hero-scrub.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            className="h-full w-full object-cover object-top"
          />
        </motion.div>

        {/* eyes ignite late in the transformation */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: eyeGlow,
            background:
              'radial-gradient(ellipse 22% 18% at 50% calc(var(--hv) * 0.27), oklch(0.82 0.15 84 / 0.55), transparent 70%)',
          }}
        />

        {/* edge vignette + bottom fade into the next section + legibility veil for the copy */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_45%,color-mix(in_oklch,var(--background)_70%,transparent)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent via-background/55 to-background" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 grain opacity-20" />

        {/* ── content ── */}
        <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-32 text-center md:pb-28">
          <h1 className="mb-6 font-bold leading-none tracking-tight md:absolute md:inset-x-0 md:top-[calc(var(--hv)*0.265)] md:-translate-y-1/2 md:px-6">
            <span className="sr-only">{profile.name}</span>
            <span
              aria-hidden="true"
              className="flex items-center justify-center gap-[0.28em] text-[clamp(2.4rem,11.5vw,4.5rem)] md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0 md:text-[min(calc((50vw-var(--hw)*0.115-3vw-1.25rem)/4.3),12rem)]"
            >
              <motion.span className="md:justify-self-end" style={{ x: leftXvw }}>
                <NameWord text={first} ready={ready} startIndex={0} />
              </motion.span>
              {/* the head lives here */}
              <span className="hidden md:block md:w-[calc(var(--hw)*0.23)]" />
              <motion.span className="md:justify-self-start" style={{ x: rightXvw }}>
                <NameWord text={last} ready={ready} startIndex={first.length + 1} />
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mb-5 flex items-center gap-2 rounded-full border border-gold/30 bg-background/40 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
              System Online
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-xl font-medium tracking-tight text-foreground sm:text-2xl md:text-3xl"
          >
            {profile.role}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="mt-3 max-w-3xl font-mono [text-shadow:0_1px_14px_rgb(0_0_0/0.9)] text-[10px] uppercase leading-relaxed tracking-[0.25em] text-muted-foreground sm:text-xs"
          >
            {profile.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.15, duration: 0.8 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
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
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-background/30 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold"
            >
              <FileText size={16} />
              View Resume
            </a>
            <button
              onClick={() => scrollTo('contact')}
              className="flex items-center gap-2 rounded-full border border-border bg-background/30 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold"
            >
              <Mail size={16} />
              Contact
            </button>
          </motion.div>
        </div>

        {/* scroll hint, replaced by a progress line once the scrub starts */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:block">
              Scroll to enter the system
            </span>
            <span className="flex h-8 w-5 items-start justify-center rounded-full border border-border p-1">
              <motion.span
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="h-1.5 w-1 rounded-full bg-gold"
              />
            </span>
          </motion.span>
        </motion.div>

        <motion.div
          style={{ opacity: progressOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 h-px w-40 -translate-x-1/2 bg-border"
          aria-hidden="true"
        >
          <motion.div
            className="h-full origin-left bg-gold"
            style={{ scaleX: progressScale }}
          />
        </motion.div>
      </div>
    </section>
  )
}
