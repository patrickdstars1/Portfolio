import { ArrowDown, ArrowRight, Download } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { scrollToId } from '../lib/scroll.js'
import Terminal from './Terminal.jsx'
import { GithubIcon, LinkedinIcon } from './TechIcon.jsx'

export default function Hero() {
  const { t, pick } = useLanguage()
  return (
    <section id="home" className="relative overflow-hidden pt-16">
      <div aria-hidden="true" className="grid-bg pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.10] blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--sky), transparent 65%)' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:px-8 md:pt-20 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-24">
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-sky">{t.hero.label}</p>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
            {t.hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted">{t.hero.description}</p>

          <p className="mt-6 font-mono text-sm tracking-wide text-ink">
            {profile.name.en.toUpperCase()}
            <span className="mx-2 text-orange">/</span>
            {profile.nickname.en.toUpperCase()}
            {pick(profile.name) !== profile.name.en && <span className="ml-3 font-sans text-muted">{pick(profile.name)}</span>}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              onClick={(e) => { e.preventDefault(); scrollToId('projects') }}
              className="group inline-flex items-center gap-2 rounded-lg bg-sky px-5 py-3 text-sm font-semibold text-on-accent transition-transform hover:-translate-y-0.5"
            >
              {t.hero.ctaWork}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href={profile.resume}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-3 text-sm font-semibold transition-colors hover:border-sky hover:text-sky"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t.hero.ctaResume}
            </a>
            <div className="flex items-center gap-1 sm:ml-1">
              <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition-colors hover:text-sky">
                <GithubIcon />
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center rounded-lg text-muted transition-colors hover:text-sky">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {profile.available && (
            <p className="mt-8 inline-flex items-center gap-2.5 text-sm text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-orange" style={{ animation: 'pulse-dot 2.4s ease-in-out infinite' }} />
              </span>
              {t.hero.available}
            </p>
          )}
        </div>

        <div className="lg:pl-2">
          <Terminal />
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('about')}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-sky lg:inline-flex"
      >
        {t.hero.scroll}
        <ArrowDown className="h-3.5 w-3.5" style={{ animation: 'nudge 1.8s ease-in-out infinite' }} aria-hidden="true" />
      </button>
    </section>
  )
}
