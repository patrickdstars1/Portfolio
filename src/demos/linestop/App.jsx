import { useMemo, useRef, useState } from 'react'
import { Check, Copy, Download, Upload } from 'lucide-react'
import DemoShell from '../shared/DemoShell.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'
import { analyze, fmtClock, fmtStamp, parseCsv, sampleCsv } from './analyze.js'

const SAMPLE = sampleCsv()
const COLORS = ['#75CFFF', '#FFB47A', '#FFD84D', '#B98CFF', '#6FD486', '#E2543E']

const TEXT = {
  en: {
    title: 'Line Stop Analyzer',
    subtitle: 'Paste or upload a production-line stop log and see where the time went: downtime by cause and station, repair times, a timeline of every stop, and a summary you can send.',
    sampleBanner: 'Showing a synthetic sample shift (12 hours, 6 stations). Paste your own log to replace it.',
    csvLabel: 'Stop log (CSV: station, start, end, reason)',
    csvHint: 'Times like 2026-03-02 08:15 or just 08:15. A stop that ends before it starts is read as crossing midnight.',
    planned: 'Planned production time (hours)',
    loadSample: 'Load sample',
    upload: 'Upload CSV',
    download: 'Download sample CSV',
    clear: 'Clear',
    errors: { station: 'missing station', time: 'start or end is not a valid time', mixed: 'start and end use different time formats', order: 'end is not after start', columns: 'missing columns', limit: 'only the first 5,000 rows are analysed' },
    rowsSkipped: 'rows skipped',
    line: 'Line',
    noData: 'Add a stop log to see the analysis.',
    kpi: { stops: 'Stops', downtime: 'Total downtime', mttr: 'Mean time to repair', avail: 'Station availability' },
    availNote: 'Average over stations: 1 − downtime ÷ (planned time × stations)',
    insights: 'What stands out',
    byReason: 'Downtime by cause',
    byReasonNote: 'Sorted by minutes. The right column is the running total: fix the top causes first.',
    byStation: 'Downtime by station',
    timeline: 'Timeline of stops',
    summary: 'Summary to send',
    copy: 'Copy',
    copied: 'Copied',
    stopsWord: 'stops',
    minutes: 'min',
    hours: 'h',
  },
  th: {
    title: 'ตัววิเคราะห์ไลน์ผลิตหยุด',
    subtitle: 'วางหรืออัปโหลด log การหยุดของไลน์ผลิต แล้วดูว่าเวลาหายไปไหน: downtime แยกตามสาเหตุและสถานี เวลาซ่อม ไทม์ไลน์ของทุกการหยุด และสรุปพร้อมส่ง',
    sampleBanner: 'กำลังแสดงกะตัวอย่างที่สร้างขึ้นเอง (12 ชั่วโมง 6 สถานี) วาง log ของคุณเพื่อแทนที่',
    csvLabel: 'Log การหยุด (CSV: station, start, end, reason)',
    csvHint: 'เวลาเช่น 2026-03-02 08:15 หรือแค่ 08:15 ถ้าเวลาจบน้อยกว่าเวลาเริ่ม จะถือว่าข้ามเที่ยงคืน',
    planned: 'เวลาผลิตตามแผน (ชั่วโมง)',
    loadSample: 'โหลดตัวอย่าง',
    upload: 'อัปโหลด CSV',
    download: 'ดาวน์โหลด CSV ตัวอย่าง',
    clear: 'ล้าง',
    errors: { station: 'ไม่มีชื่อสถานี', time: 'เวลาเริ่มหรือเวลาจบไม่ถูกต้อง', mixed: 'เวลาเริ่มกับเวลาจบใช้รูปแบบไม่ตรงกัน', order: 'เวลาจบไม่หลังเวลาเริ่ม', columns: 'ไม่พบคอลัมน์', limit: 'วิเคราะห์เฉพาะ 5,000 แถวแรก' },
    rowsSkipped: 'แถวที่ข้าม',
    line: 'บรรทัด',
    noData: 'ใส่ log การหยุดเพื่อดูผลวิเคราะห์',
    kpi: { stops: 'จำนวนครั้งที่หยุด', downtime: 'Downtime รวม', mttr: 'เวลาซ่อมเฉลี่ย', avail: 'Availability ของสถานี' },
    availNote: 'ค่าเฉลี่ยทุกสถานี: 1 − downtime ÷ (เวลาตามแผน × จำนวนสถานี)',
    insights: 'จุดที่น่าสนใจ',
    byReason: 'Downtime แยกตามสาเหตุ',
    byReasonNote: 'เรียงตามนาที คอลัมน์ขวาคือผลรวมสะสม ควรแก้สาเหตุบนสุดก่อน',
    byStation: 'Downtime แยกตามสถานี',
    timeline: 'ไทม์ไลน์การหยุด',
    summary: 'สรุปสำหรับส่ง',
    copy: 'คัดลอก',
    copied: 'คัดลอกแล้ว',
    stopsWord: 'ครั้ง',
    minutes: 'นาที',
    hours: 'ชม.',
  },
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  } catch { return false }
}

const pct = (x, d = 0) => `${(x * 100).toFixed(d)}%`

function Bars({ items, colors, T, withCum }) {
  const max = Math.max(...items.map((i) => i.minutes))
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={it.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium">{it.name}</span>
            <span className="shrink-0 font-mono text-xs text-muted">{Math.round(it.minutes)} {T.minutes} · {it.count}× · {pct(it.share)}{withCum ? ` · Σ ${pct(it.cum)}` : ''}</span>
          </div>
          <div className="mt-1.5 h-4 border-2 border-line bg-bg">
            <div className="h-full" style={{ width: `${(it.minutes / max) * 100}%`, background: colors[i % colors.length], backgroundImage: 'linear-gradient(to right, transparent 0 6px, rgba(0,0,0,0.18) 6px 8px)', backgroundSize: '8px 100%' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Timeline({ a, rows, reasonColor, T }) {
  const W = 1000, L = 92, R = 12, rowH = 26, gap = 6, top = 24
  const span = a.t1 - a.t0
  const x = (t) => L + ((t - a.t0) / span) * (W - L - R)
  const steps = [1, 2, 3, 6, 12, 24, 48, 168]
  const step = (steps.find((s) => span / 3600000 / s <= 14) ?? 168) * 3600000
  const ticks = []
  for (let t = a.t0; t <= a.t1; t += step) ticks.push(t)
  const H = top + a.stations.length * (rowH + gap)
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label={T.timeline}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={top - 4} y2={H} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
            <text x={x(t)} y={14} textAnchor="middle" fontSize="12" fill="var(--muted)" fontFamily="'JetBrains Mono Variable', monospace">{fmtClock(t)}</text>
          </g>
        ))}
        {a.stations.map((st, i) => {
          const y = top + i * (rowH + gap)
          return (
            <g key={st}>
              <text x={L - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize="12" fill="var(--text)" fontFamily="'JetBrains Mono Variable', monospace">{st}</text>
              <rect x={L} y={y} width={W - L - R} height={rowH} fill="var(--bg)" stroke="var(--line)" strokeWidth="1" />
              {rows.filter((r) => r.station === st).map((r, k) => (
                <rect key={k} x={x(r.start)} y={y + 2} width={Math.max(3, x(r.end) - x(r.start))} height={rowH - 4} fill={reasonColor(r.reason)}>
                  <title>{`${st} · ${fmtStamp(r.start)} – ${fmtClock(r.end)} · ${Math.round(r.minutes)} ${T.minutes} · ${r.reason}`}</title>
                </rect>
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function App() {
  const { lang } = useLanguage()
  const T = TEXT[lang]
  const [text, setText] = useState(SAMPLE)
  const [planned, setPlanned] = useState('12')
  const [copied, setCopied] = useState(false)
  const file = useRef(null)

  const dur = (min) => { const m = Math.round(min); return m >= 60 ? `${Math.floor(m / 60)} ${T.hours} ${String(m % 60).padStart(2, '0')} ${T.minutes}` : `${m} ${T.minutes}` }
  const { rows, errors } = useMemo(() => parseCsv(text), [text])
  const a = useMemo(() => analyze(rows, Number(planned)), [rows, planned])
  const isSample = text === SAMPLE
  const reasonColor = (name) => COLORS[Math.max(0, a.byReason.findIndex((r) => r.name === name)) % COLORS.length]

  const insights = []
  const summary = []
  if (a) {
    const [r1, r2] = a.byReason
    const s1 = a.byStation[0]
    const L = a.longest
    const top2 = r2 ? r1.share + r2.share : r1.share
    if (lang === 'th') {
      insights.push(`สาเหตุอันดับ 1 คือ "${r1.name}" คิดเป็น ${pct(r1.share)} ของ downtime ทั้งหมด (${dur(r1.minutes)})`)
      if (r2) insights.push(`สองสาเหตุแรกรวมกัน ${pct(top2)} ของ downtime${top2 >= 0.6 ? ' ควรเริ่มแก้จากตรงนี้' : ''}`)
      insights.push(`สถานีที่หยุดนานที่สุดคือ ${s1.name} (${dur(s1.minutes)}, ${s1.count} ครั้ง)`)
      insights.push(`การหยุดครั้งเดียวที่นานที่สุด: ${L.station} เวลา ${fmtClock(L.start)} นาน ${dur(L.minutes)} (${L.reason})`)
      summary.push(`เรื่อง: สรุปไลน์หยุด ${a.stops} ครั้ง, downtime ${dur(a.downtime)}`, '',
        'สวัสดีครับทีม', '',
        `สรุปช่วง ${fmtStamp(a.t0)} ถึง ${fmtStamp(a.t1)} (เวลาตามแผน ${(a.planned / 60).toFixed(1)} ชม., ${a.stations.length} สถานี)`,
        `- หยุด ${a.stops} ครั้ง รวม ${dur(a.downtime)} (availability เฉลี่ย ${pct(a.availability, 1)})`,
        `- เวลาซ่อมเฉลี่ย ${dur(a.mttr)}`,
        `- หยุดนานสุด: ${L.station} ${fmtClock(L.start)} นาน ${dur(L.minutes)} (${L.reason})`,
        `- สาเหตุหลัก: ${r1.name} (${pct(r1.share)} ของ downtime)${r2 ? `, ${r2.name} (${pct(r2.share)})` : ''}`, '',
        `ข้อเสนอ: เริ่มจาก "${r1.name}" ก่อน`)
    } else {
      insights.push(`The top cause is "${r1.name}": ${pct(r1.share)} of all downtime (${dur(r1.minutes)}).`)
      if (r2) insights.push(`The top two causes together are ${pct(top2)} of downtime${top2 >= 0.6 ? ': start there.' : '.'}`)
      insights.push(`The station with the most downtime is ${s1.name} (${dur(s1.minutes)}, ${s1.count} stops).`)
      insights.push(`The longest single stop: ${L.station} at ${fmtClock(L.start)}, ${dur(L.minutes)} (${L.reason}).`)
      summary.push(`Subject: Line stop summary: ${a.stops} stops, ${dur(a.downtime)} downtime`, '',
        'Hi team,', '',
        `Summary for ${fmtStamp(a.t0)} to ${fmtStamp(a.t1)} (${(a.planned / 60).toFixed(1)} h planned, ${a.stations.length} stations):`,
        `- ${a.stops} stops, ${dur(a.downtime)} of downtime (average station availability ${pct(a.availability, 1)})`,
        `- Mean time to repair: ${dur(a.mttr)}`,
        `- Longest stop: ${L.station} at ${fmtClock(L.start)}, ${dur(L.minutes)} (${L.reason})`,
        `- Main causes: ${r1.name} (${pct(r1.share)} of downtime)${r2 ? `, ${r2.name} (${pct(r2.share)})` : ''}`, '',
        `Suggested next step: look at "${r1.name}" first.`)
    }
  }
  const summaryText = summary.join('\n')

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result))
    reader.readAsText(f)
    e.target.value = ''
  }
  const downloadSample = () => {
    const blob = new Blob([SAMPLE + '\n'], { type: 'text/csv' })
    const el = document.createElement('a')
    el.href = URL.createObjectURL(blob); el.download = 'sample-line-stops.csv'; el.click()
    setTimeout(() => URL.revokeObjectURL(el.href), 1000)
  }
  const copy = async () => { if (await copyText(summaryText)) { setCopied(true); setTimeout(() => setCopied(false), 1800) } }
  const input = 'mt-2 block border-2 border-line bg-card px-3 py-2 font-mono text-base text-ink focus:border-sky'
  const btn = 'px-btn inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold'

  return (
    <DemoShell title={T.title} subtitle={T.subtitle}>
      <section className="px-card p-5 md:p-6" aria-label={T.csvLabel}>
        {isSample && <p className="mb-4 border-l-4 border-orange pl-3 text-sm">{T.sampleBanner}</p>}
        <label className="block">
          <span className="font-semibold">{T.csvLabel}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} spellCheck={false} data-lenis-prevent
            className="mt-2 block w-full resize-y border-2 border-line bg-bg px-3 py-2.5 font-mono text-xs leading-relaxed text-ink focus:border-sky" aria-describedby="csv-hint" />
          <span id="csv-hint" className="mt-1.5 block text-sm text-muted">{T.csvHint}</span>
        </label>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-sm font-semibold">{T.planned}</span>
            <input value={planned} onChange={(e) => setPlanned(e.target.value)} inputMode="decimal" className={`${input} w-32`} />
          </label>
          <button type="button" onClick={() => setText(SAMPLE)} className={`${btn} bg-sky text-on-accent`}>{T.loadSample}</button>
          <button type="button" onClick={() => file.current?.click()} className={`${btn} bg-card`}><Upload className="h-4 w-4" aria-hidden="true" />{T.upload}</button>
          <input ref={file} type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
          <button type="button" onClick={downloadSample} className={`${btn} bg-card`}><Download className="h-4 w-4" aria-hidden="true" />{T.download}</button>
          <button type="button" onClick={() => setText('')} className={`${btn} bg-card`}>{T.clear}</button>
        </div>
        {errors.length > 0 && (
          <div aria-live="polite" className="mt-4 border-l-4 border-orange pl-3 text-sm">
            <p className="font-semibold">{errors.length} {T.rowsSkipped}</p>
            <ul className="mt-1 text-muted">
              {errors.slice(0, 5).map((e, i) => <li key={i}>{T.line} {e.line}: {T.errors[e.code]}{e.detail ? ` (${e.detail})` : ''}</li>)}
              {errors.length > 5 && <li>…</li>}
            </ul>
          </div>
        )}
      </section>

      {!a ? (
        <p className="mt-10 text-center text-muted">{T.noData}</p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              [T.kpi.stops, String(a.stops)],
              [T.kpi.downtime, dur(a.downtime)],
              [T.kpi.mttr, dur(a.mttr)],
              [T.kpi.avail, pct(a.availability, 1)],
            ].map(([k, v], i) => (
              <li key={k} className="px-card p-4">
                <p className="text-sm text-muted">{k}</p>
                <p className={`mt-1.5 font-mono text-2xl font-semibold ${i === 3 ? 'text-orange' : 'text-sky'}`}>{v}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">{T.availNote}</p>

          <section className="mt-10" aria-labelledby="ins">
            <h2 id="ins" className="font-display text-2xl font-semibold">{T.insights}</h2>
            <ul className="mt-4 space-y-2.5">
              {insights.map((s) => (
                <li key={s} className="flex gap-2.5"><span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 bg-orange" /><span>{s}</span></li>
              ))}
            </ul>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section className="px-card p-5" aria-labelledby="br">
              <h2 id="br" className="font-display text-xl font-semibold">{T.byReason}</h2>
              <p className="mt-1.5 mb-4 text-sm text-muted">{T.byReasonNote}</p>
              <Bars items={a.byReason} colors={COLORS} T={T} withCum />
            </section>
            <section className="px-card p-5" aria-labelledby="bs">
              <h2 id="bs" className="font-display text-xl font-semibold">{T.byStation}</h2>
              <p className="mt-1.5 mb-4 text-sm text-muted">&nbsp;</p>
              <Bars items={a.byStation} colors={['var(--sky)']} T={T} />
            </section>
          </div>

          <section className="px-card mt-8 p-5" aria-labelledby="tl">
            <h2 id="tl" className="font-display text-xl font-semibold">{T.timeline}</h2>
            <ul className="mt-3 mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {a.byReason.map((r) => <li key={r.name} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3" style={{ background: reasonColor(r.name) }} />{r.name}</li>)}
            </ul>
            <Timeline a={a} rows={rows} reasonColor={reasonColor} T={T} />
          </section>

          <section className="mt-8" aria-labelledby="sm">
            <div className="flex items-center justify-between gap-3">
              <h2 id="sm" className="font-display text-xl font-semibold">{T.summary}</h2>
              <button type="button" onClick={copy} className={`${btn} bg-card`}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}<span aria-live="polite">{copied ? T.copied : T.copy}</span></button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap border-2 border-dashed border-line p-4 font-mono text-xs leading-relaxed" data-lenis-prevent>{summaryText}</pre>
          </section>
        </>
      )}
    </DemoShell>
  )
}
