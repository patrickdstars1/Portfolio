import { lazy, Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useInView } from '../hooks/useInView.js'
import { LAB_ROUTE } from '../hooks/useRoute.js'
import { Reveal } from './Section.jsx'

// three.js is only fetched once this section gets close to the viewport.
const ConsolePreview = lazy(() => import('../lab/ConsolePreview.jsx'))
const TAGS = ['Three.js', 'React Three Fiber', 'GSAP ScrollTrigger', 'WebAudio', 'Canvas 2D']

export default function InteractiveLab() {
  const { t } = useLanguage()
  const L = t.lab
  const [nearRef, near] = useInView({ once: true, rootMargin: '600px 0px' })
  const [viewRef, visible] = useInView()

  return (
    <section id="lab" aria-labelledby="lab-title" className="border-t border-line py-20 md:py-28">
      <div ref={nearRef} className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="grid overflow-hidden rounded-2xl border border-line bg-card lg:grid-cols-2">
          <div className="flex flex-col justify-center p-7 md:p-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange">{L.eyebrow}</p>
            <h2 id="lab-title" className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.15]">{L.title}</h2>
            <p className="mt-3 text-lg text-sky">{L.subtitle}</p>
            <p className="mt-5 text-pretty text-muted">{L.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TAGS.map((x) => <li key={x} className="rounded-md border border-line px-2.5 py-1 font-mono text-xs">{x}</li>)}
            </ul>
            <div className="mt-8">
              <a
                href={LAB_ROUTE}
                className="group inline-flex items-center gap-2 rounded-lg bg-sky px-5 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-on-accent transition-transform hover:-translate-y-0.5"
              >
                {L.enter}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
              <p className="mt-3 text-sm text-muted">{L.note}</p>
            </div>
          </div>

          <div ref={viewRef} className="relative min-h-[320px] border-t border-line bg-[#0A0F18] lg:min-h-[480px] lg:border-l lg:border-t-0">
            <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(117,207,255,0.10), transparent 70%)' }} />
            {near && (
              <Suspense fallback={<p className="absolute inset-0 grid place-items-center font-mono text-xs text-[#7F8EA3]">{L.loading}</p>}>
                <ConsolePreview active={visible} fallbackText={L.unsupported} />
              </Suspense>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
