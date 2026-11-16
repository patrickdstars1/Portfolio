import { skillGroups } from '../data/skills.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import Section, { Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'
import TechIcon from './TechIcon.jsx'

export default function Skills() {
  const { t, pick } = useLanguage()
  return (
    <Section id="skills" level="02" title={t.skills.title} subtitle={t.skills.subtitle} className="bg-bg-2" deco={<><Deco kind="block" speed={0.3} className="right-[4%] top-28" /><Deco kind="star" speed={-0.2} bob className="left-[3%] bottom-24" /></>}>
      <div className="divide-y-2 divide-dashed divide-line border-y-2 border-dashed border-line">
        {skillGroups.map((g, gi) => (
          <Reveal key={g.id} delay={gi * 50} className="grid gap-4 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted md:pt-2">{pick(g.title)}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li
                  key={item.name}
                  className="inline-flex items-center gap-2.5 border-2 border-line bg-card px-3.5 py-2 text-sm shadow-[3px_3px_0_0_var(--shadow)] transition-transform duration-100 hover:-translate-y-0.5 hover:text-sky"
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
