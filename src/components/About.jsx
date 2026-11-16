import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import Section, { Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'

// Small line illustrations, one per card.
const ART = [
  // automation: a loop feeding a checked step
  <svg key="a" viewBox="0 0 64 40" className="h-10 w-16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="12" width="16" height="16" rx="3" /><rect x="46" y="12" width="16" height="16" rx="3" />
    <path d="M18 20h28" strokeDasharray="3 4" className="text-orange" stroke="currentColor" />
    <path d="M40 15l6 5-6 5" /><path d="M50 20l3 3 5-6" className="text-orange" stroke="currentColor" />
  </svg>,
  // troubleshooting: a signal with one fault found
  <svg key="b" viewBox="0 0 64 40" className="h-10 w-16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 24h12l4-12 6 22 5-16 3 6h10" /><circle cx="50" cy="22" r="7" className="text-orange" stroke="currentColor" /><path d="M55 27l6 6" className="text-orange" stroke="currentColor" />
  </svg>,
  // web: a browser frame with responsive blocks
  <svg key="c" viewBox="0 0 64 40" className="h-10 w-16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="42" height="32" rx="3" /><path d="M2 12h42" /><path d="M8 19h16M8 25h10" />
    <rect x="48" y="12" width="14" height="24" rx="3" className="text-orange" stroke="currentColor" /><path d="M53 31h4" className="text-orange" stroke="currentColor" />
  </svg>,
]

export default function About() {
  const { t, pick } = useLanguage()
  const A = t.about
  const rows = [
    [A.info.name, pick(profile.name)],
    [A.info.nickname, pick(profile.nickname)],
    [A.info.location, pick(profile.location)],
    [A.info.roles, profile.roles.join(' / ')],
    [A.info.education, `${pick(profile.education.degree)}, ${pick(profile.education.school)} (${profile.education.period})`],
    [A.info.languages, pick(profile.languages).join(', ')],
    [A.info.interests, pick(profile.interests).join(', ')],
  ]
  return (
    <Section id="about" level="01" title={A.title} deco={<><Deco kind="cloud" scale={5} speed={0.35} className="right-[3%] top-24" /><Deco kind="coin" speed={-0.25} bob className="left-[2.5%] top-[55%]" /></>}>
      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
        <Reveal className="space-y-5 text-lg text-pretty">
          {A.intro.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-xl text-ink md:text-2xl md:leading-relaxed' : 'text-muted'}>{p}</p>
          ))}
        </Reveal>

        <Reveal as="aside" delay={80} aria-label={A.info.title} className="px-card self-start p-6">
          <h3 className="font-pixel text-[10px] uppercase text-sky">{A.info.title}</h3>
          <dl className="mt-4 divide-y divide-line text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <ul className="mt-14 grid gap-4 md:grid-cols-3">
        {A.cards.map((c, i) => (
          <Reveal as="li" key={c.tag} delay={i * 70} className="px-card group p-6 transition-transform duration-150 hover:-translate-y-1">
            <div className="flex items-start justify-between text-sky">
              <span className="transition-transform duration-300 group-hover:translate-x-1">{ART[i]}</span>
              <span className="font-pixel text-[9px] text-muted" lang="en">{c.tag}</span>
            </div>
            <h3 className="mt-6 text-lg font-semibold">{c.title}</h3>
            <p className="mt-2 text-[15px] text-muted">{c.body}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
