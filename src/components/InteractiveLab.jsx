import { lazy, Suspense } from 'react'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useInView } from '../hooks/useInView.js'
import { PixelRule, Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'
import { isEmbed } from '../lib/scroll.js'

// three.js and GSAP are only fetched once this section gets close to the viewport.
const LabStage = lazy(() => import('../lab/LabStage.jsx'))

// No card and no frame: the 3D console is the section's background,
// with the heading on top and the three buttons at the bottom.
export default function InteractiveLab() {
  const { t } = useLanguage()
  const L = t.lab
  const [nearRef, near] = useInView({ once: true, rootMargin: '700px 0px' })
  const [viewRef, visible] = useInView({ rootMargin: '100px 0px' })

  return (
    <section id="lab" ref={nearRef} aria-labelledby="lab-title" className="relative flex min-h-[820px] flex-col [.embed_&]:min-h-[420px] overflow-clip border-t-4 border-line pb-10 pt-20 md:min-h-[100svh] [.embed_&]:md:min-h-[420px] md:pb-14 md:pt-28">
      <div ref={viewRef} className="pointer-events-none absolute inset-0" />
      <Deco kind="gamepad" speed={0.3} tilt={6} className="right-[2.5%] top-28" />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-pixel text-[10px] text-orange" lang="en">STAGE 05</p>
          <h2 id="lab-title" className="text-pop mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">{L.title}</h2>
          <PixelRule className="mt-5" />
          <p className="mt-5 text-lg text-muted">{L.subtitle}</p>
        </Reveal>
      </div>

      {isEmbed() ? (
        // Inside the TV there is no second console: that would be a console inside a console.
        <p lang="en" className="relative m-auto max-w-xs px-5 text-center font-pixel text-[10px] leading-loose text-sky">
          YOU ARE ALREADY INSIDE THE BK-8.<br /><span className="text-orange">LOOK UP FROM THE SCREEN.</span>
        </p>
      ) : near && (
        <Suspense fallback={<p className="relative m-auto font-mono text-xs text-muted">{L.loading}</p>}>
          <LabStage active={visible} />
        </Suspense>
      )}
    </section>
  )
}
