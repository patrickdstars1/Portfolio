import { ArrowDown } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { scrollToId } from '../lib/scroll.js'
import PixelScene from './PixelScene.jsx'
import { skyGradient } from '../lib/pixelScene.js'
import { useTheme } from '../hooks/useTheme.jsx'

// The hero is an open pixel-art playground: no copy, just the world and its
// characters. Everything about Bank starts in the Intro section below.
export default function Hero() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  return (
    <section id="home" aria-label={t.nav.home} className="relative h-[100svh] min-h-[540px] overflow-hidden" style={{ background: skyGradient(theme) }}>
      <PixelScene />
      <p className="pointer-events-none absolute inset-x-0 top-24 text-center font-pixel text-[10px] leading-relaxed text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.55)]">
        {typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches ? t.hero.hintTouch : t.hero.hint}
      </p>
      <button
        type="button"
        onClick={() => scrollToId('intro')}
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
