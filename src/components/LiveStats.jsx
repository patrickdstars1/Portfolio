// Follower counts for a project card. Shows nothing until real numbers exist.
import { useEffect, useRef, useState } from 'react'
import { platformLabel, socialAccounts } from '../data/socials.js'
import { useStats } from '../hooks/useStats.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { prefersReducedMotion } from '../lib/scroll.js'

const fmt = (n) => Math.round(n).toLocaleString('en-US')

// Counts up to the target in a few hard steps, like an 8-bit score ticker.
function Count({ value }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (prefersReducedMotion() || from.current === value) { setShown(value); from.current = value; return }
    const start = from.current, steps = 12
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(i >= steps ? value : start + ((value - start) * i) / steps)
      if (i >= steps) { clearInterval(id); from.current = value }
    }, 45)
    return () => clearInterval(id)
  }, [value])
  return <>{fmt(shown)}</>
}

function ago(iso, T, now) {
  const m = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))
  if (m < 1) return T.justNow
  if (m < 60) return `${m} ${T.minAgo}`
  const h = Math.floor(m / 60)
  return h < 48 ? `${h} ${T.hourAgo}` : `${Math.floor(h / 24)} ${T.dayAgo}`
}

export default function LiveStats() {
  const { t } = useLanguage()
  const T = t.projects.stats
  const stats = useStats()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id) }, [])

  const rows = socialAccounts.filter((a) => stats?.accounts?.[a.key]?.followers != null)
  if (!rows.length) return null
  const total = rows.reduce((sum, a) => sum + stats.accounts[a.key].followers, 0)
  return (
    <div className="mt-5 border-2 border-line bg-bg p-3.5" aria-label={T.followers}>
      <div className="flex items-center justify-between gap-3">
        <span lang="en" className="inline-flex items-center gap-2 font-pixel text-[9px] leading-none text-orange">
          <span className="h-2 w-2 bg-orange" style={{ animation: 'pulse-dot 1.2s steps(2) infinite' }} aria-hidden="true" />LIVE
        </span>
        {stats.updatedAt && <span className="text-xs text-muted">{T.updated} {ago(stats.updatedAt, T, now)}</span>}
      </div>
      <ul className="mt-3 space-y-1.5">
        {rows.map((a) => (
          <li key={a.key} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{a.name} <span className="text-muted">· {platformLabel[a.platform]}</span></span>
            <span className="font-mono font-semibold tabular-nums text-sky"><Count value={stats.accounts[a.key].followers} /> <span className="text-xs font-normal text-muted">{T.followers}</span></span>
          </li>
        ))}
      </ul>
      {rows.length > 1 && (
        <p className="mt-2.5 flex items-baseline justify-between gap-3 border-t-2 border-dashed border-line pt-2.5 text-sm font-semibold">
          <span>{T.total}</span>
          <span className="font-mono tabular-nums text-orange"><Count value={total} /></span>
        </p>
      )}
    </div>
  )
}
