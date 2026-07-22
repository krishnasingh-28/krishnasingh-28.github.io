'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Star, GitFork } from 'lucide-react'
import { GithubIcon } from '@/components/brand-icons'
import { SectionHeading } from '@/components/section-heading'
import { CountUp } from '@/components/count-up'
import { githubStats } from '@/lib/portfolio-data'

type GhUser = { followers: number; public_repos: number }
type GhRepo = {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  html_url: string
  fork: boolean
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('GitHub API error')
    return r.json()
  })

const langColors = [
  'oklch(0.82 0.13 84)',
  'oklch(0.7 0.09 82)',
  'oklch(0.58 0.06 80)',
  'oklch(0.45 0.02 78)',
]

// Deterministic pseudo-random so SSR and client match.
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function Heatmap() {
  const weeks = 52
  const days = 7
  const cells = useMemo(() => {
    return Array.from({ length: weeks * days }, (_, i) => {
      const r = seeded(i)
      const level = r > 0.82 ? 4 : r > 0.68 ? 3 : r > 0.5 ? 2 : r > 0.32 ? 1 : 0
      return level
    })
  }, [])

  const colors = [
    'oklch(0.22 0.004 70)',
    'oklch(0.4 0.05 82)',
    'oklch(0.55 0.08 83)',
    'oklch(0.7 0.11 84)',
    'oklch(0.85 0.14 85)',
  ]

  return (
    <div className="no-scrollbar overflow-x-auto">
      <div
        className="grid w-max gap-1"
        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gridAutoFlow: 'column', gridTemplateRows: `repeat(${days}, minmax(0, 1fr))` }}
      >
        {cells.map((level, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % weeks) * 0.006, duration: 0.25 }}
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ background: colors[level] }}
          />
        ))}
      </div>
    </div>
  )
}

export function GithubDashboard() {
  const username = githubStats.username

  const { data: user } = useSWR<GhUser>(
    `https://api.github.com/users/${username}`,
    fetcher,
    { revalidateOnFocus: false },
  )
  const { data: repos } = useSWR<GhRepo[]>(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const derived = useMemo(() => {
    if (!repos || !Array.isArray(repos)) return null
    const own = repos.filter((r) => !r.fork)
    const stars = own.reduce((acc, r) => acc + r.stargazers_count, 0)

    const langCount: Record<string, number> = {}
    for (const r of own) {
      if (r.language) langCount[r.language] = (langCount[r.language] ?? 0) + 1
    }
    const total = Object.values(langCount).reduce((a, b) => a + b, 0) || 1
    const sorted = Object.entries(langCount).sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 3)
    const otherPct =
      100 - top.reduce((acc, [, c]) => acc + Math.round((c / total) * 100), 0)
    const languages = [
      ...top.map(([name, c], i) => ({
        name,
        pct: Math.round((c / total) * 100),
        color: langColors[i],
      })),
      ...(otherPct > 0 ? [{ name: 'Other', pct: otherPct, color: langColors[3] }] : []),
    ]

    const pinned = [...own]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        description: r.description ?? 'No description provided.',
        language: r.language ?? 'Python',
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url,
      }))

    return { stars, languages, pinned, repoCount: own.length }
  }, [repos])

  const followers = user?.followers ?? githubStats.followers
  const stars = derived?.stars ?? githubStats.stars
  const languages = derived?.languages ?? githubStats.languages
  const pinned =
    derived?.pinned ??
    githubStats.pinned.map((p) => ({ ...p, url: `https://github.com/${username}` }))

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
      <SectionHeading index="08" subtitle="Open Source" title="Developer activity." />

      <div className="glass rounded-3xl p-7 md:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 text-gold">
              <GithubIcon size={20} />
            </span>
            <div>
              <p className="font-semibold text-foreground group-hover:text-gold">@{username}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {derived ? `${derived.repoCount} public repositories` : 'Live from GitHub'}
              </p>
            </div>
          </a>
          <div className="flex gap-8">
            {[
              { v: followers, l: 'Followers' },
              { v: stars, l: 'Stars' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-mono text-2xl font-bold text-gradient-gold">
                  <CountUp to={s.v} />
                </div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Heatmap />
        </div>

        {/* Languages */}
        <div className="mt-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Most Used Languages
          </p>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full">
            {languages.map((lang) => (
              <div key={lang.name} style={{ width: `${lang.pct}%`, background: lang.color }} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            {languages.map((lang) => (
              <span key={lang.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: lang.color }} />
                {lang.name} {lang.pct}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Top repos */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {pinned.map((repo, i) => (
          <motion.a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="group rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-gold/40"
          >
            <div className="flex items-center gap-2">
              <GithubIcon size={14} className="text-gold" />
              <span className="font-mono text-sm text-foreground group-hover:text-gold">
                {repo.name}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{repo.description}</p>
            <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                {repo.language}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} /> {repo.stars}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={12} /> {repo.forks}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
