import { useEffect, useState } from 'react'

// Reads stats.json (written by scripts/fetch-stats.mjs at every deploy) and re-reads it
// every 5 minutes while the tab is visible, so a long-open page keeps up with new deploys.
const REFRESH_MS = 5 * 60 * 1000

export function useStats() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    let alive = true
    let timer
    const load = async () => {
      try {
        const r = await fetch(`./stats.json?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' })
        if (r.ok) { const j = await r.json(); if (alive) setStats(j) }
      } catch {}
    }
    const tick = () => { if (!document.hidden) load(); timer = setTimeout(tick, REFRESH_MS) }
    const onVisible = () => { if (!document.hidden) load() }
    load()
    timer = setTimeout(tick, REFRESH_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  return stats
}
