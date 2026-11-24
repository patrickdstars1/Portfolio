// Production-line stop log: parsing, statistics and sample data. Pure functions, no DOM.
//
// A stop log is CSV with the columns station, start, end, reason. Times are
// "YYYY-MM-DD HH:MM[:SS]" or just "HH:MM" (a stop that ends before it starts is read as
// crossing midnight). "Downtime" is the sum of stop durations. Availability is the average
// across stations: 1 - downtime / (planned time x number of stations).
import { rng } from '../../lib/pixel.js'

function splitLine(line, d) {
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (q) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c
    } else if (c === '"') q = true
    else if (c === d) { out.push(cur.trim()); cur = '' }
    else cur += c
  }
  out.push(cur.trim())
  return out
}

function detectDelimiter(line) {
  const counts = [',', '\t', ';'].map((d) => [d, line.split(d).length - 1]).sort((a, b) => b[1] - a[1])
  return counts[0][1] ? counts[0][0] : ','
}

export function parseTime(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s)
  if (m) {
    const [, y, mo, d, h, mi, se] = m.map(Number)
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || (se ?? 0) > 59) return null
    return { ms: new Date(y, mo - 1, d, h, mi, se || 0).getTime(), full: true }
  }
  const t = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s)
  if (t) {
    const [, h, mi, se] = t.map(Number)
    if (h > 23 || mi > 59 || (se ?? 0) > 59) return null
    return { ms: new Date(2000, 0, 1, h, mi, se || 0).getTime(), full: false }
  }
  return null
}

const HEADERS = {
  station: /station|line|สถานี/i,
  start: /start|begin|from|เริ่ม/i,
  end: /end|finish|until|stop_?time|จบ|สิ้นสุด/i,
  reason: /reason|cause|สาเหตุ/i,
}
export const MAX_ROWS = 5000

export function parseCsv(text) {
  const lines = String(text ?? '').split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return { rows: [], errors: [] }
  const d = detectDelimiter(lines[0])
  const first = splitLine(lines[0], d)
  const hasHeader = first.some((c) => HEADERS.station.test(c)) && first.some((c) => HEADERS.start.test(c))
  let idx = { station: 0, start: 1, end: 2, reason: 3 }
  if (hasHeader) {
    idx = {}
    for (const key of Object.keys(HEADERS)) idx[key] = first.findIndex((c, i) => HEADERS[key].test(c) && !Object.values(idx).includes(i))
    const missing = Object.keys(idx).filter((k) => idx[k] < 0 && k !== 'reason')
    if (missing.length) return { rows: [], errors: [{ line: 1, code: 'columns', detail: missing.join(', ') }] }
  }
  const rows = []
  const errors = []
  const body = hasHeader ? lines.slice(1) : lines
  body.slice(0, MAX_ROWS).forEach((line, i) => {
    const n = i + (hasHeader ? 2 : 1)
    const c = splitLine(line, d)
    const station = c[idx.station] ?? ''
    const a = parseTime(c[idx.start] ?? '')
    let b = parseTime(c[idx.end] ?? '')
    if (!station) return errors.push({ line: n, code: 'station' })
    if (!a || !b) return errors.push({ line: n, code: 'time' })
    if (a.full !== b.full) return errors.push({ line: n, code: 'mixed' })
    let end = b.ms
    if (!a.full && end <= a.ms) end += 86400000
    if (end <= a.ms) return errors.push({ line: n, code: 'order' })
    rows.push({ station, start: a.ms, end, reason: (idx.reason >= 0 && c[idx.reason]) || 'Unspecified', minutes: (end - a.ms) / 60000 })
  })
  if (body.length > MAX_ROWS) errors.push({ line: MAX_ROWS + 1, code: 'limit' })
  return { rows, errors }
}

const sumBy = (rows, key) => {
  const m = new Map()
  for (const r of rows) {
    const e = m.get(r[key]) || { name: r[key], minutes: 0, count: 0 }
    e.minutes += r.minutes; e.count++
    m.set(r[key], e)
  }
  return [...m.values()].sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name))
}

export function analyze(rows, plannedHours) {
  if (!rows.length) return null
  const downtime = rows.reduce((s, r) => s + r.minutes, 0)
  let cum = 0
  const byReason = sumBy(rows, 'reason').map((e) => { cum += e.minutes; return { ...e, share: e.minutes / downtime, cum: cum / downtime } })
  const byStation = sumBy(rows, 'station').map((e) => ({ ...e, share: e.minutes / downtime }))
  const longest = rows.reduce((a, r) => (r.minutes > a.minutes ? r : a))
  const hour = 3600000
  const t0 = Math.floor(Math.min(...rows.map((r) => r.start)) / hour) * hour
  const t1 = Math.ceil(Math.max(...rows.map((r) => r.end)) / hour) * hour
  const planned = plannedHours > 0 ? plannedHours * 60 : (t1 - t0) / 60000
  const stations = byStation.map((s) => s.name).sort()
  const availability = Math.min(1, Math.max(0, 1 - downtime / (planned * stations.length)))
  return { stops: rows.length, downtime, mttr: downtime / rows.length, longest, availability, planned, stations, byReason, byStation, t0, t1 }
}

const pad = (n) => String(n).padStart(2, '0')
export const fmtClock = (ms) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
export const fmtStamp = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${fmtClock(ms)}` }
export function fmtDuration(min) {
  const m = Math.round(min)
  return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)} min` : `${m} min`
}

// Synthetic 12-hour shift on six stations. The same seed always gives the same file.
export function sampleCsv(seed = 11) {
  const r = rng(seed)
  const stations = ['DL-01', 'DL-02', 'DL-03', 'DL-04', 'FLASH-01', 'TEST-01']
  const reasons = [
    ['Image server timeout', 34, [4, 22]],
    ['Cable or connector fault', 20, [6, 35]],
    ['Software version mismatch', 15, [8, 40]],
    ['Waiting for material', 15, [5, 28]],
    ['Operator change', 8, [3, 9]],
    ['Test fixture error', 8, [10, 45]],
  ]
  const total = reasons.reduce((s, x) => s + x[1], 0)
  const pick = () => { let x = r() * total; for (const re of reasons) { x -= re[1]; if (x <= 0) return re } return reasons[0] }
  const t0 = new Date(2026, 2, 2, 8, 0).getTime()
  const t1 = new Date(2026, 2, 2, 20, 0).getTime()
  const lines = ['station,start,end,reason']
  for (const st of stations) {
    let t = t0 + (20 + r() * 90) * 60000
    while (t < t1) {
      const [name, , [lo, hi]] = pick()
      const dur = Math.max(2, Math.round(lo + (hi - lo) * Math.pow(r(), 1.6)))
      const end = Math.min(t + dur * 60000, t1)
      lines.push(`${st},${fmtStamp(t)},${fmtStamp(end)},${name}`)
      t = end + (50 + r() * 130) * 60000
    }
  }
  return lines.join('\n')
}
