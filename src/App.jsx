import { useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Experience from './components/Experience.jsx'
import Projects from './components/Projects.jsx'
import InteractiveLab from './components/InteractiveLab.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import KonamiEgg from './components/KonamiEgg.jsx'
import { AchievementLayer } from './components/Achievements.jsx'
import { useLanguage } from './hooks/useLanguage.jsx'
import { isEmbed, prefersReducedMotion, setLenis } from './lib/scroll.js'
import { initCardLight } from './lib/cardLight.js'

function Portfolio() {
  const { t } = useLanguage()

  // Smooth scrolling for the main page only; skipped for reduced-motion users.
  useEffect(() => {
    if (prefersReducedMotion() || isEmbed()) return
    const lenis = new Lenis({ duration: 1.0, anchors: false })
    setLenis(lenis)
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null) }
  }, [])

  // Card shadows react to the pointer.
  useEffect(() => initCardLight(), [])

  // Arriving with a section hash jumps to that section.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sky focus:px-4 focus:py-2 focus:text-on-accent">
        {t.nav.skip}
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <InteractiveLab />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <>
      <Portfolio />
      {!isEmbed() && <KonamiEgg />}
      <AchievementLayer />
    </>
  )
}
