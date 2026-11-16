import { lazy, Suspense } from 'react'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useInView } from '../hooks/useInView.js'
import Section, { Reveal } from './Section.jsx'
import { Deco } from './Parallax.jsx'

// three.js and GSAP are only fetched once this section gets close to the viewport.
const LabStage = lazy(() => import('../lab/LabStage.jsx'))
const TAGS = ['Three.js', 'React Three Fiber', 'GSAP', 'WebAudio', 'Canvas 2D']

export default function InteractiveLab() {
  const { t } = useLanguage()
  const L = t.lab
  const [nearRef, near] = useInView({ once: true, rootMargin: '700px 0px' })
  const [viewRef, visible] = useInView({ rootMargin: '100px 0px' })

  return (
    <Section
      id="lab"
      level="05"
      title={L.title}
      subtitle={L.subtitle}
      deco={<><Deco kind="gamepad" speed={0.3} tilt={6} className="right-[2.5%] top-28" /><Deco kind="chip" speed={-0.2} tilt={-5} delay={0.6} className="left-[2%] top-[36%]" /></>}
    >
      <div ref={nearRef}>
        <Reveal className="mb-8 max-w-3xl">
          <p className="text-pretty text-muted">{L.body}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {TAGS.map((x) => <li key={x} className="border-2 border-line px-2.5 py-1 font-mono text-xs">{x}</li>)}
          </ul>
        </Reveal>
        <div ref={viewRef} className="px-card overflow-hidden">
          {near ? (
            <Suspense fallback={<p className="grid h-[380px] place-items-center bg-[#05070c] font-mono text-xs text-[#7F8EA3] sm:h-[480px] lg:h-[560px]">{L.loading}</p>}>
              <LabStage active={visible} />
            </Suspense>
          ) : (
            <div className="h-[380px] bg-[#05070c] sm:h-[480px] lg:h-[560px]" />
          )}
        </div>
      </div>
    </Section>
  )
}
