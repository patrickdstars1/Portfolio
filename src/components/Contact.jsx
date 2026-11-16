import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { Reveal } from './Section.jsx'
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
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line bg-bg-2 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky">{C.title}</p>
          <h2 id="contact-title" className="mt-4 text-balance text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.08]">{C.heading}</h2>
          <p className="mt-5 text-lg text-muted">{C.body}</p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
          <Reveal className="rounded-xl border border-line bg-card p-6 md:p-7">
            <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.16em] text-muted">
              <Mail className="h-4 w-4 text-sky" aria-hidden="true" />{C.email}
            </div>
            <p className="mt-4 break-all text-lg font-medium md:text-xl">{profile.email}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-lg bg-sky px-4 py-2.5 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5">
                {C.send}
              </a>
              <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold transition-colors hover:border-sky hover:text-sky">
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
                className="group flex h-full flex-col justify-between rounded-xl border border-line bg-card p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-sky/60 md:p-7"
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
