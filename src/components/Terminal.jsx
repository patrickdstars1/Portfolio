import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import { skillGroups } from '../data/skills.js'
import { experience } from '../data/experience.js'
import { projects } from '../data/projects.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { openLab } from '../hooks/useRoute.js'

let lineId = 0
const line = (text, kind = 'out') => ({ id: ++lineId, text, kind })

// The terminal keeps its dark surface in both themes, like a real one.
export default function Terminal() {
  const { t, pick, lang } = useLanguage()
  const T = t.terminal
  const [lines, setLines] = useState(() => [line(T.welcome, 'dim')])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState([])
  const [cursor, setCursor] = useState(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)

  // Reset the greeting when the language changes.
  useEffect(() => { setLines([line(T.welcome, 'dim')]) }, [lang]) // eslint-disable-line

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const commands = useMemo(() => ({
    help: () => [
      line(T.help),
      ...Object.entries(T.cmds).map(([k, v]) => line(`  ${k.padEnd(11)} ${v}`)),
    ],
    about: () => [line(T.about), line(`${pick(profile.name)} · ${profile.roles.join(' / ')}`, 'dim')],
    skills: () => skillGroups.map((g) => line(`${pick(g.title)}: ${g.items.map((i) => i.name).join(', ')}`)),
    experience: () => experience.map((e) =>
      line(`${pick(e.period) ?? pick(e.company)}  ${pick(e.position)}${typeof e.company === 'string' ? ' @ ' + e.company : ''}`)),
    projects: () => projects.map((p) => line(`${pick(p.name)} — ${p.tech.join(', ')}${p.url ? '  ' + p.url : `  (${T.soon})`}`)),
    contact: () => [
      line(`email     ${profile.email}`),
      line(`linkedin  ${profile.links.linkedin}`),
      line(`github    ${profile.links.github}`),
    ],
    lab: () => { setTimeout(openLab, 350); return [line(T.opening, 'accent')] },
  }), [T, pick])

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase()
    const echo = line(raw, 'cmd')
    if (!cmd) return setLines((l) => [...l, echo])
    setHistory((h) => [raw, ...h].slice(0, 30))
    setCursor(-1)
    if (cmd === 'clear') return setLines([])
    const fn = commands[cmd]
    setLines((l) => [...l, echo, ...(fn ? fn() : [line(`${T.notFound} ${cmd}`, 'err'), line(T.hint, 'dim')])].slice(-80))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { run(value); setValue('') }
    else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault()
      const n = Math.min(cursor + 1, history.length - 1); setCursor(n); setValue(history[n])
    } else if (e.key === 'ArrowDown' && cursor >= 0) {
      e.preventDefault()
      const n = cursor - 1; setCursor(n); setValue(n < 0 ? '' : history[n])
    }
  }

  const color = { out: 'text-[#CFE9F9]', dim: 'text-[#7F8EA3]', cmd: 'text-[#F4F7FC]', err: 'text-[#FFB47A]', accent: 'text-[#75CFFF]' }

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#263447] bg-[#0A0F18] font-mono text-[13px] leading-relaxed shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-[#1C2738] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2B3A50]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2B3A50]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FFB47A]" />
        <span className="ml-2 text-xs text-[#7F8EA3]">{T.title}</span>
      </div>
      <div ref={bodyRef} data-lenis-prevent className="h-72 overflow-y-auto px-4 py-3 sm:h-80" role="log" aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className={`whitespace-pre-wrap break-words ${color[l.kind]}`}>
            {l.kind === 'cmd' && <span className="text-[#75CFFF]">❯ </span>}
            {l.text}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-[#75CFFF]" aria-hidden="true">❯</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={T.inputLabel}
            placeholder={T.placeholder}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-[#F4F7FC] caret-[#75CFFF] outline-none placeholder:text-[#4A5A70]"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-[#1C2738] px-3 py-2.5">
        {['help', 'about', 'skills', 'experience', 'contact'].map((c) => (
          <button
            key={c}
            type="button"
            onClick={(e) => { e.stopPropagation(); run(c) }}
            className="rounded border border-[#263447] px-2 py-0.5 text-[11px] text-[#9BA9BA] transition-colors hover:border-[#75CFFF] hover:text-[#75CFFF]"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
