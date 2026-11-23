import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useTheme } from '../hooks/useTheme.jsx'
import Section, { Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'
import { GithubIcon } from './TechIcon.jsx'
import LiveStats from './LiveStats.jsx'

// Abstract previews used until real screenshots are added (set `image` in data/projects.js).
function Preview({ kind, large }) {
  const s = { fill: 'none', stroke: 'var(--line)', strokeWidth: 1 }
  const art = {
    fleet: (
      <>
        <rect x="16" y="16" width="56" height="148" rx="4" {...s} />
        {[30, 44, 58, 72].map((y) => <rect key={y} x="24" y={y} width="40" height="6" rx="2" fill="var(--line)" />)}
        <rect x="24" y="30" width="40" height="6" rx="2" fill="var(--sky)" opacity=".8" />
        {[0, 1, 2].map((i) => <rect key={i} x={84 + i * 74} y="16" width="64" height="38" rx="4" {...s} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={92 + i * 74} y="26" width="24" height="5" rx="2" fill="var(--muted)" opacity=".5" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={92 + i * 74} y="38" width={[34, 28, 40][i]} height="8" rx="2" fill={i === 1 ? 'var(--orange)' : 'var(--sky)'} opacity=".85" />)}
        <rect x="84" y="64" width="138" height="100" rx="4" {...s} />
        <path d="M94 142 L116 126 L138 132 L160 104 L182 112 L212 84" fill="none" stroke="var(--sky)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M94 150 L116 144 L138 146 L160 134 L182 138 L212 122" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="232" y="64" width="72" height="100" rx="4" {...s} />
        {[78, 96, 114, 132, 150].map((y, i) => (
          <g key={y}><circle cx="244" cy={y} r="3" fill={i === 1 ? 'var(--orange)' : 'var(--sky)'} /><rect x="254" y={y - 3} width={[38, 30, 42, 26, 34][i]} height="6" rx="2" fill="var(--line)" /></g>
        ))}
      </>
    ),
    web: (
      <>
        <rect x="40" y="24" width="170" height="132" rx="5" {...s} /><path d="M40 42h170" {...s} />
        <rect x="54" y="56" width="80" height="9" rx="2" fill="var(--sky)" opacity=".85" /><rect x="54" y="72" width="120" height="5" rx="2" fill="var(--line)" /><rect x="54" y="82" width="96" height="5" rx="2" fill="var(--line)" />
        <rect x="54" y="98" width="42" height="42" rx="3" {...s} /><rect x="104" y="98" width="42" height="42" rx="3" {...s} /><rect x="154" y="98" width="42" height="42" rx="3" {...s} />
        <rect x="226" y="52" width="56" height="104" rx="7" {...s} /><rect x="236" y="66" width="36" height="7" rx="2" fill="var(--orange)" opacity=".85" /><rect x="236" y="80" width="36" height="28" rx="3" {...s} /><rect x="236" y="114" width="36" height="28" rx="3" {...s} />
      </>
    ),
    automation: (
      <>
        {[[40, 90], [120, 50], [120, 130], [200, 90], [280, 90]].map(([x, y], i) => (
          <rect key={i} x={x - 22} y={y - 14} width="44" height="28" rx="5" fill="none" stroke={i === 3 ? 'var(--orange)' : 'var(--sky)'} strokeWidth="1.2" />
        ))}
        <path d="M62 90h14M76 90V50h22M76 90v40h22M142 50h14v40h22M142 130h14V90M222 90h36" fill="none" stroke="var(--line)" strokeWidth="1.2" />
        <path d="M30 90h20M112 50h16M112 130h16M192 90h16M272 90h16" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      </>
    ),
    social: (
      <>
        {/* a clip phone feeding four platform nodes */}
        <rect x="40" y="26" width="64" height="128" rx="8" {...s} />
        <rect x="48" y="40" width="48" height="84" rx="3" fill="var(--line)" opacity=".5" />
        <path d="M64 70 L64 94 L84 82 Z" fill="var(--orange)" />
        <rect x="52" y="132" width="40" height="5" rx="2" fill="var(--sky)" opacity=".8" />
        <path d="M110 90 H150" stroke="var(--muted)" strokeWidth="2" strokeDasharray="3 4" />
        <path d="M150 90 V45 M150 90 V72 M150 90 V108 M150 90 V135" stroke="var(--line)" strokeWidth="1.5" fill="none" />
        {[45, 72, 108, 135].map((y, i) => (
          <g key={y}>
            <path d={`M150 ${y} H190`} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="3 4" />
            <rect x="190" y={y - 13} width="76" height="26" rx="4" {...s} />
            <circle cx="203" cy={y} r="5" fill={i % 2 ? 'var(--orange)' : 'var(--sky)'} />
            <rect x="214" y={y - 3} width={[40, 34, 30, 38][i]} height="6" rx="2" fill="var(--muted)" opacity=".55" />
          </g>
        ))}
      </>
    ),
    trading: (
      <>
        <path d="M24 150h272M24 110h272M24 70h272M24 30h272" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" />
        {[[40, 96, 30, 1], [66, 84, 26, 1], [92, 92, 34, 0], [118, 70, 30, 1], [144, 78, 22, 0], [170, 58, 34, 1], [196, 66, 26, 0], [222, 46, 30, 1], [248, 40, 24, 1], [274, 50, 28, 0]].map(([x, y, h, up], i) => (
          <g key={i} stroke={up ? 'var(--sky)' : 'var(--orange)'} fill={up ? 'var(--sky)' : 'var(--orange)'}>
            <path d={`M${x} ${y - 10}V${y + h + 10}`} strokeWidth="1" /><rect x={x - 6} y={y} width="12" height={h} rx="1.5" opacity=".85" stroke="none" />
          </g>
        ))}
      </>
    ),
  }
  return (
    <svg viewBox="0 0 320 180" className={`h-full w-full ${large ? '' : 'max-h-44'}`} role="presentation" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {art[kind]}
    </svg>
  )
}

function Actions({ p }) {
  const { t, pick } = useLanguage()
  const P = t.projects
  const links = p.links || []
  if (!p.url && !p.repo && !links.length) {
    return <span className="inline-flex items-center rounded-md border border-dashed border-line px-3 py-1.5 font-mono text-xs text-muted">{P.soon}</span>
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {p.url && (
        <a href={p.url} target="_blank" rel="noreferrer" className="px-btn inline-flex items-center gap-1.5 bg-sky px-4 py-2 text-sm font-semibold text-on-accent">
          {p.demo ? P.viewDemo : P.view}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="px-btn inline-flex items-center gap-1.5 bg-sky px-4 py-2 text-sm font-semibold text-on-accent">
          {pick(l.label)}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}
      {p.repo && (
        <a href={p.repo} target="_blank" rel="noreferrer" className="px-btn inline-flex items-center gap-2 bg-card px-4 py-2 text-sm font-semibold">
          <GithubIcon className="h-4 w-4" />{P.repo}
        </a>
      )}
    </div>
  )
}

function Card({ p, large }) {
  const { t, pick } = useLanguage()
  const { theme } = useTheme()
  const image = p.image && typeof p.image === 'object' ? p.image[theme] : p.image
  return (
    <article className={`px-card group flex h-full flex-col overflow-hidden transition-transform duration-150 hover:-translate-y-1 ${large ? 'lg:flex-row' : ''}`}>
      <div className={`relative border-line bg-bg-2 ${large ? 'border-b-[3px] lg:w-[55%] lg:border-b-0 lg:border-r-[3px]' : 'border-b-[3px]'}`}>
        {image ? (
          <img src={image} alt={pick(p.name)} loading="lazy" className="h-full w-full object-cover object-top" />
        ) : (
          <div className={`${large ? 'p-6 md:p-10' : 'p-5'} transition-transform duration-500 group-hover:scale-[1.02]`}>
            <Preview kind={p.preview} large={large} />
          </div>
        )}
        {p.demo && <span lang="en" className="absolute left-3 top-3 z-10 bg-orange px-2 py-1.5 font-pixel text-[9px] leading-none text-[#10131a]">DEMO</span>}
        {!image && large && (
          <span className="absolute bottom-3 left-4 font-mono text-[10px] text-muted">{t.projects.preview}</span>
        )}
      </div>
      <div className={`flex flex-1 flex-col ${large ? 'p-7 md:p-9 lg:justify-center' : 'p-6'}`}>
        {large && <p className="font-pixel text-[10px] uppercase text-orange">{t.projects.featured}</p>}
        <h3 className={`font-semibold ${large ? 'mt-3 text-2xl md:text-3xl' : 'text-lg'}`}>{pick(p.name)}</h3>
        <p className={`mt-3 text-pretty text-muted ${large ? '' : 'text-[15px]'}`}>{pick(p.description)}</p>
        {p.demo && <p className="mt-3 border-l-4 border-orange pl-3 text-sm">{t.projects.demoNote}</p>}
        {p.details && (
          <div className="mt-4 border-2 border-dashed border-line p-3.5">
            <p className="font-pixel text-[9px] leading-relaxed text-orange">{pick(p.details.title)}</p>
            <ol className="mt-3 space-y-2">
              {p.details.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-sky font-mono text-[11px] font-bold leading-none text-on-accent">{i + 1}</span>
                  <span>{pick(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        {p.tech.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.tech.map((x) => <li key={x} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs">{x}</li>)}
        </ul>
        )}
        {p.liveStats && <LiveStats />}
        <div className="mt-6 pt-1 lg:mt-auto"><div className={large ? 'lg:mt-7' : ''}><Actions p={p} /></div></div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { t } = useLanguage()
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  return (
    <Section id="projects" level="04" title={t.projects.title} subtitle={t.projects.subtitle} className="bg-bg-2" deco={<><Deco kind="cartridge" speed={0.3} tilt={-5} className="right-[2.5%] top-28" /><Deco kind="code" speed={-0.2} tilt={7} delay={1} className="left-[2%] top-[60%]" /></>}>
      <div className="space-y-6">
        {featured.map((p) => <Reveal key={p.id}><Card p={p} large /></Reveal>)}
        <ul className={`grid gap-6 md:grid-cols-2 ${rest.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {rest.map((p, i) => <Reveal as="li" key={p.id} delay={i * 70}><Card p={p} /></Reveal>)}
        </ul>
      </div>
    </Section>
  )
}
