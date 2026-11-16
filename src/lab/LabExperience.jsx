// Full-screen experience at #/lab/retro-console.
// Scroll drives one number (sim.p) through GSAP ScrollTrigger; the 3D scene and
// this overlay are both derived from it.
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, ChevronsDown, Power, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import LabScene from './LabScene.jsx'
import ComponentInfo from './ComponentInfo.jsx'
import { createSequenceSounds } from './ReassemblySequence.js'
import { PART_IDS, stageAt } from './ExplodedView.js'
import { labComponents } from '../data/labComponents.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { closeLab } from '../hooks/useRoute.js'
import { isSoundEnabled, setSoundEnabled, sfx } from '../lib/sound.js'

gsap.registerPlugin(ScrollTrigger)

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function LabExperience() {
  const { t, pick } = useLanguage()
  const X = t.labx
  const spacer = useRef(null)
  const [phase, setPhase] = useState('idle') // idle -> starting -> on
  const [stage, setStage] = useState({ kind: 'play', idx: -1 })
  const [sound, setSound] = useState(isSoundEnabled)

  // Mutable simulation state read by the scene every frame.
  const sim = useMemo(() => ({
    powered: false,
    p: 0,
    intro: { btn: 0, led: 0, cart: 0, brightness: 0, collapse: 1, mode: 'off', bootT: 0 },
  }), [])

  // Scroll is locked until the console has been switched on.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.style.overflow = phase === 'on' ? '' : 'hidden'
    return () => { document.documentElement.style.overflow = '' }
  }, [phase])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeLab()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Power-on sequence: button, LED, cartridge, CRT, boot animation, title screen.
  const powerOn = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('starting')
    const i = sim.intro
    const tl = gsap.timeline({ onComplete: () => { sim.powered = true; setPhase('on') } })
    tl.call(() => sfx.switch())
      .to(i, { btn: 1, duration: 0.12 })
      .set(i, { led: 1 }, '+=0.08')
      .to(i, { cart: 1, duration: 1.7, ease: 'power1.inOut' }, '+=0.25')
      .call(() => sfx.connect())
      .call(() => sfx.crtOn(), null, '+=0.3')
      .set(i, { mode: 'boot', brightness: 1 })
      .to(i, { collapse: 0, duration: 0.45, ease: 'power2.out' })
      .call(() => sfx.boot(), null, '+=0.1')
      .to(i, { bootT: 1, duration: 2.6, ease: 'none' })
      .set(i, { mode: 'title' })
  }, [phase, sim])

  // ScrollTrigger scrubs sim.p from 0 to 1 across the tall spacer.
  useEffect(() => {
    if (phase !== 'on') return
    const cues = createSequenceSounds()
    let last = ''
    const tween = gsap.to(sim, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: spacer.current, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
      onUpdate: () => {
        cues(sim.p)
        const s = stageAt(sim.p)
        const key = s.kind + s.idx
        if (key !== last) { last = key; setStage(s) }
      },
    })
    return () => { tween.scrollTrigger?.kill(); tween.kill() }
  }, [phase, sim])

  const toggleSound = () => { setSoundEnabled(!sound); setSound(!sound) }
  const restart = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const chip = 'pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-[#263447] bg-[#0A0F18]/90 px-3.5 py-2.5 text-sm text-[#F4F7FC] backdrop-blur-sm transition-colors hover:border-[#75CFFF] hover:text-[#75CFFF]'
  const reIdx = stage.kind === 'reassembly' ? stage.idx : -1

  return (
    <div className="bg-[#05070c] text-[#F4F7FC]">
      <div className="fixed inset-0">
        <Boundary fallback={<p className="grid h-full place-items-center px-6 text-center font-mono text-sm text-[#9BA9BA]">{X.error}</p>}>
          <LabScene sim={sim} onPower={powerOn} />
        </Boundary>
      </div>

      {/* scroll length for the whole sequence */}
      <div ref={spacer} style={{ height: phase === 'on' ? '1500vh' : '100svh' }} aria-hidden="true" />

      <div className="pointer-events-none fixed inset-0 z-10">
        {/* always-visible controls */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-5">
          <a href="#lab" className={chip}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{X.exit}</span>
          </a>
          <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? X.soundOn : X.soundOff} title={sound ? X.soundOn : X.soundOff} className={chip}>
            {sound ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {/* progress rail */}
        {phase === 'on' && stage.kind !== 'play' && stage.kind !== 'final' && (
          <ol aria-hidden="true" className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col gap-2 sm:right-6 sm:flex">
            {PART_IDS.map((id, i) => {
              const out = stage.kind === 'part' ? i <= stage.idx : stage.kind === 'overview' ? true : stage.kind === 'reassembly' ? i < stage.idx : false
              const cur = (stage.kind === 'part' || stage.kind === 'reassembly') && i === stage.idx
              return <li key={id} className={`h-[3px] rounded-full transition-all duration-300 ${cur ? 'w-7 bg-[#FFB47A]' : out ? 'w-4 bg-[#75CFFF]' : 'w-4 bg-[#263447]'}`} />
            })}
          </ol>
        )}

        {/* power prompt */}
        {phase === 'idle' && (
          <div className="absolute inset-x-3 bottom-6 mx-auto max-w-sm rounded-xl border border-[#263447] bg-[#0A0F18]/92 p-5 text-center backdrop-blur-sm sm:bottom-10">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#FFB47A]">{X.powerTitle.toUpperCase()}</p>
            <p className="mt-2 text-[#9BA9BA]">{X.powerBody}</p>
            <button type="button" onClick={powerOn} className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-lg bg-[#75CFFF] px-5 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-[#06202F] transition-transform hover:-translate-y-0.5">
              <Power className="h-4 w-4" aria-hidden="true" />{X.powerBtn}
            </button>
          </div>
        )}

        {phase === 'on' && stage.kind === 'play' && (
          <p className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#CFE9F9]">
            {X.scrollHint}
            <ChevronsDown className="h-5 w-5 text-[#75CFFF]" style={{ animation: 'nudge 1.6s ease-in-out infinite' }} aria-hidden="true" />
          </p>
        )}

        {phase === 'on' && (stage.kind === 'shutdown' || stage.kind === 'boot') && (
          <p role="status" className="absolute inset-x-0 bottom-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#FFB47A]">
            {stage.kind === 'shutdown' ? X.shutdown : X.booting}…
          </p>
        )}

        {phase === 'on' && stage.kind === 'part' && <ComponentInfo idx={stage.idx} />}

        {phase === 'on' && stage.kind === 'overview' && (
          <div className="absolute inset-x-4 bottom-10 text-center">
            <h2 className="text-balance text-2xl font-semibold sm:text-4xl">{X.overviewTitle}</h2>
            <p className="mt-2 text-[#9BA9BA]">{X.overviewBody}</p>
          </div>
        )}

        {phase === 'on' && reIdx >= 0 && (
          <div role="status" className="absolute inset-x-4 bottom-10 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#FFB47A]">
              {X.reassembly} {String(labComponents.length - reIdx).padStart(2, '0')} / {labComponents.length}
            </p>
            <p className="mt-1.5 text-xl font-semibold sm:text-2xl">{pick(labComponents[reIdx].name)}</p>
          </div>
        )}

        {phase === 'on' && stage.kind === 'final' && (
          <div className="absolute inset-x-4 bottom-8 text-center sm:bottom-12">
            <h2 className="text-balance font-mono text-2xl font-bold tracking-tight sm:text-4xl">{X.final}</h2>
            <p className="mt-2 text-[#9BA9BA]">{X.finalSub}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href="#lab" className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-[#75CFFF] px-5 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-[#06202F] transition-transform hover:-translate-y-0.5">
                {X.exit}
              </a>
              <button type="button" onClick={restart} className={chip}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />{X.again}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
