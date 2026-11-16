import { ArrowDown, ArrowRight, Download } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { scrollToId } from '../lib/scroll.js'
import Terminal from './Terminal.jsx'
import PixelScene from './PixelScene.jsx'
import { skyGradient } from '../lib/pixelScene.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { GithubIcon, LinkedinIcon } from './TechIcon.jsx'

export default function Hero() {
  const { t, pick } = useLanguage()
  const { theme } = useTheme()
  return (
    <section id="home" className="relative overflow-hidden pt-16" style={{ background: skyGradient(theme) }}>
      <PixelScene />

      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-5 pb-[78vw] pt-12 sm:pb-[340px] md:px-8 md:pt-16 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-[400px] 2xl:pb-[480px]">
        <div className="hero-copy">
          <p className="font-pixel text-[10px] leading-relaxed text-sky" lang="en">{t.hero.label}</p>
          <h1 className="mt-5 text-balance font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            {t.hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg">{t.hero.description}</p>

          <p className="mt-6 font-mono text-sm tracking-wide text-ink">
            {profile.name.en.toUpperCase()}
            <span className="mx-2 text-orange">/</span>
            {profile.nickname.en.toUpperCase()}
            {pick(profile.name) !== profile.name.en && <span className="ml-3 font-sans">{pick(profile.name)}</span>}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              onClick={(e) => { e.preventDefault(); scrollToId('projects') }}
              className="px-btn group inline-flex items-center gap-2 bg-sky px-5 py-3 text-sm font-semibold text-on-accent"
            >
              {t.hero.ctaWork}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <a
              href={profile.resume}
              download
              className="px-btn inline-flex items-center gap-2 bg-card px-5 py-3 text-sm font-semibold"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t.hero.ctaResume}
            </a>
            <div className="flex items-center gap-1 sm:ml-1">
              <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-11 w-11 place-items-center transition-colors hover:text-sky">
                <GithubIcon />
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center transition-colors hover:text-sky">
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {profile.available && (
            <p className="mt-8 inline-flex items-center gap-2.5 text-sm">
              <span className="h-2.5 w-2.5 bg-orange" style={{ animation: 'pulse-dot 1.2s steps(2) infinite' }} />
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
        lang="en"
        className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 bg-black/70 px-3 py-2 text-[9px] uppercase leading-none text-white transition-colors hover:text-[#FFB47A]"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {t.hero.scroll}
        <ArrowDown className="h-3 w-3" style={{ animation: 'nudge 1s steps(2) infinite' }} aria-hidden="true" />
      </button>
    </section>
  )
}
