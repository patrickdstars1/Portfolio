import { lazy, Suspense, useEffect } from 'react'
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
import { useRoute } from './hooks/useRoute.js'
import { useLanguage } from './hooks/useLanguage.jsx'
import { prefersReducedMotion, setLenis } from './lib/scroll.js'

// The full-screen lab (three.js, GSAP) is only downloaded when it is opened.
const LabExperience = lazy(() => import('./lab/LabExperience.jsx'))

function Portfolio() {
  const { t } = useLanguage()

  // Smooth scrolling for the main page only; skipped for reduced-motion users.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ duration: 1.0, anchors: false })
    setLenis(lenis)
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    })
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null) }
  }, [])

  // Arriving with a section hash (e.g. returning from the lab) jumps to it.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, 0)
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

function LabFallback() {
  const { t } = useLanguage()
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#05070c] font-mono text-sm text-[#9BA9BA]">
      {t.labx.loading}
    </div>
  )
}

export default function App() {
  const route = useRoute()
  return (
    <>
      {route === 'lab' ? (
        <Suspense fallback={<LabFallback />}>
          <LabExperience />
        </Suspense>
      ) : (
        <Portfolio />
      )}
      <KonamiEgg />
    </>
  )
}
