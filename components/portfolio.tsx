'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader } from '@/components/loader'
import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero/hero'
import { About } from '@/components/sections/about'
import { Experience } from '@/components/sections/experience'
import { Skills } from '@/components/sections/skills'
import { Projects } from '@/components/sections/projects'
import { Architecture } from '@/components/sections/architecture'
import { TechStack } from '@/components/sections/tech-stack'
import { Certifications } from '@/components/sections/certifications'
import { GithubDashboard } from '@/components/sections/github-dashboard'
import { Contact } from '@/components/sections/contact'

export function Portfolio() {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      const t = setTimeout(() => setReady(true), 150)
      return () => clearTimeout(t)
    }
  }, [loading])

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}

      <Nav />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero ready={ready} />

        {/* Divider glow between hero and content */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-background" />
        </div>

        <About />
        <Experience />
        <Skills />
        <Projects />
        <Architecture />
        <TechStack />
        <Certifications />
        <GithubDashboard />
        <Contact />
      </motion.main>
    </>
  )
}
