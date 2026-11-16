import { skillGroups } from '../data/skills.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import Section, { Reveal } from './Section.jsx'
import TechIcon from './TechIcon.jsx'

export default function Skills() {
  const { t, pick } = useLanguage()
  return (
    <Section id="skills" title={t.skills.title} subtitle={t.skills.subtitle} className="bg-bg-2">
      <div className="divide-y divide-line border-y border-line">
        {skillGroups.map((g, gi) => (
          <Reveal key={g.id} delay={gi * 50} className="grid gap-4 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted md:pt-2">{pick(g.title)}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item.name}
                  className="inline-flex items-center gap-2.5 rounded-lg border border-line bg-card px-3.5 py-2 text-sm transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-sky/70 hover:text-sky"
                >
                  <TechIcon name={item.icon} />
                  {item.name}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
