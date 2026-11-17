import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { experience } from '../data/experience.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import Section, { Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'

function Entry({ item, defaultOpen }) {
  const { t, pick } = useLanguage()
  const E = t.experience
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `exp-${item.id}`
  return (
    <li className="relative pl-9 md:pl-12">
      <span
        aria-hidden="true"
        className={`absolute left-0 top-7 h-[16px] w-[16px] border-[3px] bg-bg ${item.current ? 'border-orange' : 'border-sky'}`}
      >
        {item.current && <span className="absolute inset-[2px] bg-orange" style={{ animation: 'pulse-dot 1.2s steps(2) infinite' }} />}
      </span>

      <Reveal as="article" className="px-card p-6 md:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
          {item.period && <span>{pick(item.period)}</span>}
          {item.current && <span className="bg-orange px-2 py-0.5 font-semibold text-[#10131a]">{E.current}</span>}
          {item.freelance && <span className="bg-sky px-2 py-0.5 font-semibold text-on-accent">{E.freelance}</span>}
        </div>
        <h3 className="mt-3 text-xl font-semibold md:text-2xl">{pick(item.position)}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
          <span className="text-sky">{pick(item.company)}</span>
          {item.place && (
            <span className="inline-flex items-center gap-1 text-muted">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />{pick(item.place)}
            </span>
          )}
        </p>
        <p className="mt-4 max-w-3xl text-pretty text-muted">{pick(item.description)}</p>

        {item.focus && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {pick(item.focus).map((f) => (
              <li key={f} className="rounded-md bg-sky/10 px-2.5 py-1 font-mono text-[11px] text-sky">{f}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-sky"
        >
          {open ? E.hide : E.show}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        <div
          id={panelId}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden" inert={!open}>
            <div className="mt-5 border-t border-line pt-5">
              <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {item.current || item.freelance ? E.responsibilities : E.responsibilitiesPast}
              </h4>
              <ul className="mt-3 grid gap-2 text-[15px] md:grid-cols-2 md:gap-x-8">
                {pick(item.responsibilities).map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-orange" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {item.tech.length > 0 && (
                <>
                  <h4 className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{E.tech}</h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {item.tech.map((x) => (
                      <li key={x} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs">{x}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </li>
  )
}

export default function Experience() {
  const { t } = useLanguage()
  const listRef = useRef(null)
  const fillRef = useRef(null)

  // Timeline progress: the line fills as the list passes the middle of the viewport.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = listRef.current
      if (!el || !fillRef.current) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - r.top) / r.height))
      fillRef.current.style.transform = `scaleY(${p})`
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <Section id="experience" level="03" title={t.experience.title} subtitle={t.experience.subtitle} deco={<><Deco kind="briefcase" speed={0.3} tilt={5} className="right-[2.5%] top-36" /><Deco kind="floppy" speed={-0.2} tilt={-7} delay={1.5} className="left-[1.5%] top-[42%]" /></>}>
      <div className="relative">
        <div aria-hidden="true" className="absolute bottom-0 left-[6px] top-0 w-1 bg-line">
          <div ref={fillRef} className="h-full w-full origin-top bg-sky" style={{ transform: 'scaleY(0)' }} />
        </div>
        <ol ref={listRef} className="space-y-6">
          {experience.map((item, i) => (
            <Entry key={item.id} item={item} defaultOpen={i < 2} />
          ))}
        </ol>
      </div>
    </Section>
  )
}
