import { ArrowDown, ArrowRight, Download } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { scrollToId } from '../lib/scroll.js'
import PixelScene from './PixelScene.jsx'
import { skyGradient } from '../lib/pixelScene.js'
import { useTheme } from '../hooks/useTheme.jsx'
import { GithubIcon, LinkedinIcon } from './TechIcon.jsx'
import { unlock } from '../lib/achievements.js'

// Intro copy on the left; the rest of the hero is a small game.
// Byte follows the pointer, and jumps (Space or click, hold for higher) to
// collect the coins that appear. See Mascot.jsx.
export default function Hero() {
  const { t, pick } = useLanguage()
  const { theme } = useTheme()
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  return (
    <section id="home" className="relative min-h-[920px] overflow-hidden sm:min-h-[760px] lg:h-[100svh] lg:min-h-[720px]" style={{ background: skyGradient(theme) }}>
      <PixelScene />

      {/* the wrapper lets clicks through to the game; only the copy itself is interactive */}
      <div className="pointer-events-none relative z-10 mx-auto max-w-6xl px-5 pt-32 sm:pt-24 md:px-8 lg:pt-28">
        <div className="pointer-events-auto max-w-xl">
          <p className="font-pixel text-[10px] leading-relaxed text-sky" lang="en">{t.hero.label}</p>
          <h1 className="mt-4 text-balance font-display text-[2.2rem] font-semibold leading-[1.02] tracking-tight [text-shadow:3px_3px_0_rgba(0,0,0,0.35)] sm:text-5xl lg:text-[3.6rem]">
            {t.hero.heading}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base sm:text-lg">{t.hero.description}</p>

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
              onClick={() => unlock('resume')}
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
      </div>

      <p className="pointer-events-none absolute inset-x-0 z-10 px-4 text-center font-pixel text-[9px] leading-relaxed text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]" style={{ bottom: 44 }}>
        {touch ? t.hero.hintTouch : t.hero.hint}
      </p>
      <button
        type="button"
        onClick={() => scrollToId('about')}
        lang="en"
        className="absolute bottom-3 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 bg-black/70 px-3 py-2 text-[9px] uppercase leading-none text-white transition-colors hover:text-[#FFB47A]"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        {t.hero.scroll}
        <ArrowDown className="h-3 w-3" style={{ animation: 'nudge 1s steps(2) infinite' }} aria-hidden="true" />
      </button>
    </section>
  )
}
