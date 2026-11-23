// Fetches follower counts and writes them to public/stats.json before each build.
// Runs in GitHub Actions (see .github/workflows/deploy.yml) with tokens from repository
// secrets. It never fails the build: if an account has no token or its API call fails,
// the previous value is kept (read back from the live site), so the page never shows zeros.
//
//   node scripts/fetch-stats.mjs
// env: SITE_URL (live site, for the fallback), STATS_OUT (default public/stats.json),
//      STATS_MOCK_BASE (tests only: send every API call to this origin instead)
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const { socialAccounts } = await import(pathToFileURL(new URL('../src/data/socials.js', import.meta.url).pathname).href)
const OUT = process.env.STATS_OUT || 'public/stats.json'
const SITE = (process.env.SITE_URL || '').replace(/\/$/, '')
const mock = process.env.STATS_MOCK_BASE
const origin = (real) => mock || real
const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v))

const adapters = {
  async facebook({ id }, token) {
    const r = await fetch(`${origin('https://graph.facebook.com')}/v21.0/${encodeURIComponent(id)}?fields=followers_count,fan_count&access_token=${encodeURIComponent(token)}`)
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`)
    return num(j.followers_count ?? j.fan_count)
  },
  async instagram({ id }, token) {
    const r = await fetch(`${origin('https://graph.facebook.com')}/v21.0/${encodeURIComponent(id)}?fields=followers_count&access_token=${encodeURIComponent(token)}`)
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`)
    return num(j.followers_count)
  },
  async youtube({ id }, token) {
    const r = await fetch(`${origin('https://www.googleapis.com')}/youtube/v3/channels?part=statistics&id=${encodeURIComponent(id)}&key=${encodeURIComponent(token)}`)
    const j = await r.json()
    if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`)
    const s = j.items?.[0]?.statistics
    if (!s) throw new Error('channel not found')
    return s.hiddenSubscriberCount ? null : num(s.subscriberCount)
  },
  async tiktok(_acc, token) {
    const r = await fetch(`${origin('https://open.tiktokapis.com')}/v2/user/info/?fields=follower_count`, { headers: { Authorization: `Bearer ${token}` } })
    const j = await r.json()
    if (!r.ok || (j?.error?.code && j.error.code !== 'ok')) throw new Error(j?.error?.message || `HTTP ${r.status}`)
    return num(j.data?.user?.follower_count)
  },
}

// previous values: the file already in the working tree is a placeholder, so ask the live site
async function previous() {
  if (!SITE) return {}
  try {
    const r = await fetch(`${SITE}/stats.json?t=${Date.now()}`)
    if (r.ok) return (await r.json()).accounts || {}
  } catch {}
  return {}
}

const prev = await previous()
const accounts = {}
let fresh = 0
for (const acc of socialAccounts) {
  const token = acc.tokenEnv ? process.env[acc.tokenEnv] : ''
  let value = null
  if (!token) console.log(`- ${acc.key}: no token (${acc.tokenEnv}), keeping previous value`)
  else {
    try {
      value = await adapters[acc.platform](acc, token)
      if (value === null || Number.isNaN(value)) throw new Error('no follower count in the response')
      console.log(`- ${acc.key}: ${value}`)
      fresh++
    } catch (e) {
      console.log(`::warning::${acc.key}: ${String(e.message).replace(token, '***')}`)
      value = null
    }
  }
  if (value !== null) accounts[acc.key] = { followers: value, fetchedAt: new Date().toISOString() }
  else if (prev[acc.key]?.followers != null) accounts[acc.key] = prev[acc.key]
}

const out = { updatedAt: fresh > 0 ? new Date().toISOString() : (Object.values(accounts).map((a) => a.fetchedAt).sort().pop() ?? null), accounts }
await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`wrote ${OUT}: ${Object.keys(accounts).length} account(s), ${fresh} refreshed`)
