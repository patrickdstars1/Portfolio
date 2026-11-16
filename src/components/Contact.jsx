import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { PixelRule, Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'
import { GithubIcon, LinkedinIcon } from './TechIcon.jsx'

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  } catch { return false }
}

export default function Contact() {
  const { t } = useLanguage()
  const C = t.contact
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (await copyText(profile.email)) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  const links = [
    { key: 'linkedin', Icon: LinkedinIcon, label: C.linkedin, sub: C.linkedinSub, href: profile.links.linkedin },
    { key: 'github', Icon: GithubIcon, label: C.github, sub: `@${profile.githubHandle}`, href: profile.links.github },
  ]
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-clip border-t-4 border-line bg-bg-2 py-20 md:py-28">
      <Deco kind="mail" speed={0.3} tilt={-6} className="right-[2.5%] top-28" />
      <Deco kind="heart" speed={-0.2} tilt={6} delay={1.1} className="left-[2%] top-[52%]" />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-pixel text-[10px] text-orange" lang="en">STAGE 06 <span className="text-sky" style={{ animation: 'blink 1s steps(1) infinite' }}>▶</span> CONTINUE?</p>
          <h2 id="contact-title" className="text-pop mt-4 text-balance font-display text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">{C.heading}</h2>
          <PixelRule className="mt-5" />
          <p className="mt-5 text-lg text-muted">{C.body}</p>
        </Reveal>

        <Reveal className="mt-12">
          <h3 className="font-pixel text-[10px] uppercase text-muted">{C.servicesTitle}</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-5 border-y-2 border-dashed border-line py-6 md:grid-cols-3">
            {C.services.map((sv) => (
              <li key={sv.title}>
                <p className="flex items-center gap-2.5 font-semibold">
                  <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-orange" />{sv.title}
                </p>
                <p className="mt-1.5 text-[15px] text-muted">{sv.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
          <Reveal className="px-card p-6 md:p-7">
            <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-muted">
              <Mail className="h-4 w-4 text-sky" aria-hidden="true" />{C.email}
            </div>
            <p className="mt-4 break-all text-[17px] font-medium">{profile.email}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={`mailto:${profile.email}`} className="px-btn inline-flex items-center gap-2 bg-sky px-4 py-2.5 text-sm font-semibold text-on-accent">
                {C.send}
              </a>
              <button type="button" onClick={copy} className="px-btn inline-flex items-center gap-2 bg-card px-4 py-2.5 text-sm font-semibold">
                {copied ? <Check className="h-4 w-4 text-orange" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span aria-live="polite">{copied ? C.copied : C.copy}</span>
              </button>
            </div>
          </Reveal>

          {links.map(({ key, Icon, label, sub, href }, i) => (
            <Reveal key={key} delay={(i + 1) * 70}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${label} — ${C.open}`}
                className="px-card group flex h-full flex-col justify-between p-6 transition-transform duration-150 hover:-translate-y-1 md:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="text-sky"><Icon className="h-7 w-7" /></span>
                  <ArrowUpRight className="h-5 w-5 text-muted transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky" aria-hidden="true" />
                </div>
                <div className="mt-8">
                  <p className="text-lg font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-muted">{sub}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
