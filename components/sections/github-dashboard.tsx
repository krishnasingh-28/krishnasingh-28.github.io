'use client'

import { useMemo, useState } from 'react'
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

type Contribution = { date: string; count: number; level: number }
type ContribResponse = { total: Record<string, number>; contributions: Contribution[] }

const heatColors = [
  'oklch(0.22 0.004 70)',
  'oklch(0.4 0.05 82)',
  'oklch(0.55 0.08 83)',
  'oklch(0.7 0.11 84)',
  'oklch(0.85 0.14 85)',
]

const weeks = 53
const days = 7

function Heatmap({ days: data, loading }: { days: Contribution[] | null; loading: boolean }) {
  const [hover, setHover] = useState<number | null>(null)

  // Pad the first week so the grid starts on the correct weekday (Sunday-first, like GitHub).
  const cells = useMemo(() => {
    if (!data?.length) return Array.from({ length: weeks * days }, () => null as Contribution | null)
    const lead = new Date(data[0].date + 'T00:00:00Z').getUTCDay()
    return [...Array<null>(lead).fill(null), ...data]
  }, [data])

  const hovered = hover !== null ? cells[hover] : null

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto pb-2" onMouseLeave={() => setHover(null)}>
        <div
          className="grid w-max gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.ceil(cells.length / days)}, minmax(0, 1fr))`,
            gridAutoFlow: 'column',
            gridTemplateRows: `repeat(${days}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((c, i) => {
            const col = Math.floor(i / days)
            const row = i % days
            let scale = 1
            let lift = 0
            if (hover !== null) {
              const hc = Math.floor(hover / days)
              const hr = hover % days
              const d2 = (col - hc) ** 2 + (row - hr) ** 2
              const f = Math.exp(-d2 / 6)
              scale = 1 + 0.9 * f
              lift = -3 * f
            }
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: col * 0.008, duration: 0.3 }}
                onMouseEnter={() => c && setHover(i)}
                className={`h-2.5 w-2.5 rounded-[3px] ${loading ? 'animate-pulse' : ''}`}
                style={{
                  background: heatColors[c?.level ?? 0],
                  visibility: i < cells.length ? 'visible' : 'hidden',
                }}
              >
                <span
                  className="block h-full w-full rounded-[3px] transition-transform duration-200 ease-out"
                  style={{
                    transform: `translateY(${lift}px) scale(${scale})`,
                    background: 'inherit',
                    boxShadow:
                      scale > 1.3 && (c?.level ?? 0) > 0
                        ? '0 0 10px oklch(0.85 0.14 85 / 0.55)'
                        : 'none',
                  }}
                />
              </motion.span>
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex h-5 items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          {hovered
            ? `${hovered.count} contribution${hovered.count === 1 ? '' : 's'} on ${new Date(
                hovered.date + 'T00:00:00Z',
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              })}`
            : loading
              ? 'Loading contributions…'
              : ''}
        </span>
        <span className="flex items-center gap-1.5">
          Less
          {heatColors.map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />
          ))}
          More
        </span>
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

  const { data: contrib, error: contribError } = useSWR<ContribResponse>(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
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

  // Only live GitHub data is shown; nothing is invented while loading or on failure.
  const followers = user?.followers ?? 0
  const stars = derived?.stars ?? 0
  const languages = derived?.languages ?? []
  const pinned = derived?.pinned ?? []
  const totalContribs = contrib ? Object.values(contrib.total)[0] : null

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
          <Heatmap days={contrib?.contributions ?? null} loading={!contrib && !contribError} />
          {totalContribs != null && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {totalContribs.toLocaleString()} contributions in the last year
            </p>
          )}
        </div>

        {/* Languages */}
        {languages.length > 0 && <div className="mt-8">
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
        </div>}
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
            viewport={{ once: false, margin: '-40px' }}
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
