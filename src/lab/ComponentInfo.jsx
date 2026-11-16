import { labComponents } from '../data/labComponents.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

// Information panel for the part currently in focus.
export default function ComponentInfo({ idx }) {
  const { t, pick } = useLanguage()
  const X = t.labx
  const c = labComponents[idx]
  if (!c) return null
  const rows = [[X.function, c.fn], [X.spec, c.spec], [X.engineering, c.note]]
  return (
    <aside
      key={c.id}
      aria-live="polite"
      className="lab-panel pointer-events-auto absolute inset-x-3 bottom-3 max-h-[46svh] overflow-y-auto rounded-xl border border-[#263447] bg-[#0A0F18]/92 p-4 text-[#F4F7FC] backdrop-blur-sm sm:inset-x-auto sm:bottom-auto sm:left-6 sm:top-1/2 sm:max-h-[78svh] sm:w-[360px] sm:-translate-y-1/2 sm:p-6"
    >
      <p className="font-mono text-[11px] tracking-[0.18em] text-[#FFB47A]">
        {X.part} {String(idx + 1).padStart(2, '0')} / {labComponents.length}
      </p>
      <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{pick(c.name)}</h2>
      <dl className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        {rows.map(([k, v], i) => (
          <div key={k}>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#75CFFF]">{k}</dt>
            <dd className={`mt-1 text-sm ${i === 1 ? 'font-mono text-[12.5px] text-[#CFE9F9]' : i === 2 ? 'text-[#9BA9BA]' : ''}`}>{pick(v)}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
