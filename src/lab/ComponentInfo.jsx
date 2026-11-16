import { labComponents } from '../data/labComponents.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

// Information panel for the selected part.
export default function ComponentInfo({ idx }) {
  const { t, pick } = useLanguage()
  const L = t.lab
  const c = labComponents[idx]
  if (!c) return <p className="text-sm text-muted">{L.pick}</p>
  const rows = [[L.function, c.fn], [L.spec, c.spec], [L.engineering, c.note]]
  return (
    <div key={c.id} aria-live="polite">
      <p className="font-pixel text-[10px] text-orange">
        {L.part} {String(idx + 1).padStart(2, '0')}/{labComponents.length}
      </p>
      <h3 className="mt-2 text-xl font-semibold">{pick(c.name)}</h3>
      <dl className="mt-4 space-y-3.5">
        {rows.map(([k, v], i) => (
          <div key={k}>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-sky">{k}</dt>
            <dd className={`mt-1 text-[15px] ${i === 1 ? 'font-mono text-[13px]' : i === 2 ? 'text-muted' : ''}`}>{pick(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
