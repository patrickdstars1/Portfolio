// The BK-8 console, embedded in the Interactive Lab section.
// Buttons animate one number (sim.p) with GSAP; the 3D scene is derived from it,
// so reassembly is the disassembly timeline continued to its end.
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Power, Volume2, VolumeX, Wrench, Hammer } from 'lucide-react'
import LabScene from './LabScene.jsx'
import ComponentInfo from './ComponentInfo.jsx'
import { createSequenceSounds } from './ReassemblySequence.js'
import { P } from './ExplodedView.js'
import { labComponents } from '../data/labComponents.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { isSoundEnabled, setSoundEnabled, sfx } from '../lib/sound.js'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function LabStage({ active }) {
  const { t, pick } = useLanguage()
  const L = t.lab
  // idle -> starting -> on -> disassembling -> apart -> reassembling -> on
  const [phase, setPhase] = useState('idle')
  const [done, setDone] = useState(false)
  const [focus, setFocus] = useState(-1)
  const [sound, setSound] = useState(isSoundEnabled)
  const tween = useRef(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const sim = useMemo(() => ({
    powered: false,
    p: 0,
    focus: -1,
    intro: { btn: 0, led: 0, cart: 0, brightness: 0, collapse: 1, mode: 'off', bootT: 0 },
  }), [])
  const cues = useMemo(() => createSequenceSounds(), [])

  useEffect(() => () => tween.current?.kill(), [])
  useEffect(() => { sim.focus = focus }, [focus, sim])

  // Power-on: button, LED, cartridge, CRT, boot animation, title screen.
  const powerOn = useCallback(() => {
    if (phase !== 'idle') return
    setPhase('starting')
    const i = sim.intro
    const k = reduced ? 0.25 : 1
    tween.current = gsap.timeline({ onComplete: () => { sim.powered = true; setPhase('on') } })
      .call(() => sfx.switch())
      .to(i, { btn: 1, duration: 0.12 })
      .set(i, { led: 1 }, '+=0.08')
      .to(i, { cart: 1, duration: 1.7 * k, ease: 'power1.inOut' }, '+=0.2')
      .call(() => sfx.connect())
      .call(() => sfx.crtOn(), null, '+=0.25')
      .set(i, { mode: 'boot', brightness: 1 })
      .to(i, { collapse: 0, duration: 0.45, ease: 'power2.out' })
      .call(() => sfx.boot(), null, '+=0.1')
      .to(i, { bootT: 1, duration: 2.4 * k, ease: 'none' })
      .set(i, { mode: 'title' })
  }, [phase, sim, reduced])

  const takeApart = () => {
    if (phase !== 'on') return
    setPhase('disassembling'); setDone(false)
    const k = reduced ? 0.25 : 1
    tween.current = gsap.timeline({ onUpdate: () => cues(sim.p), onComplete: () => setPhase('apart') })
      .to(sim, { p: P.shutdownEnd, duration: 2.2 * k, ease: 'none' }) // freeze, flicker, power down
      .to(sim, { p: P.apart, duration: 5.5 * k, ease: 'none' }) // 11 parts, top to bottom
  }

  const putBack = () => {
    if (phase !== 'apart') return
    setFocus(-1); setPhase('reassembling')
    const k = reduced ? 0.25 : 1
    sim.p = P.reStart
    tween.current = gsap.timeline({
      onUpdate: () => cues(sim.p),
      onComplete: () => { sim.p = P.play; cues(sim.p); setPhase('on'); setDone(true) },
    })
      .to(sim, { p: P.reEnd, duration: 5 * k, ease: 'none' }) // reverse order, bottom to top
      .to(sim, { p: P.done, duration: 3 * k, ease: 'none' }) // cartridge, power, boot
  }

  const toggleSound = () => { setSoundEnabled(!sound); setSound(!sound) }
  const busy = phase === 'starting' || phase === 'disassembling' || phase === 'reassembling'
  const status = done && phase === 'on' ? L.status.done : L.status[phase]

  const action =
    phase === 'idle' || phase === 'starting'
      ? { label: L.powerOn, Icon: Power, run: powerOn }
      : phase === 'apart' || phase === 'reassembling'
        ? { label: L.putBack, Icon: Hammer, run: putBack }
        : { label: L.takeApart, Icon: Wrench, run: takeApart }

  return (
    <div>
      <div className="relative h-[380px] border-b-4 border-line bg-[#05070c] sm:h-[480px] lg:h-[560px]">
        <Boundary fallback={<p className="grid h-full place-items-center px-6 text-center font-mono text-sm text-[#9BA9BA]">{L.error}</p>}>
          <LabScene sim={sim} onPower={powerOn} active={active} />
        </Boundary>
        <p role="status" className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-black/60 px-2.5 py-2 font-pixel text-[9px] leading-none text-[#F4F7FC] sm:left-4 sm:top-4 sm:text-[10px]">
          <span className={`h-2 w-2 ${phase === 'idle' || phase === 'apart' ? 'bg-[#5b6676]' : 'bg-[#FFB47A]'}`} style={busy ? { animation: 'pulse-dot 0.8s steps(2) infinite' } : undefined} />
          {status}
        </p>
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? L.soundOn : L.soundOff} title={sound ? L.soundOn : L.soundOff}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center border-2 border-white/30 bg-black/60 text-white transition-colors hover:border-[#75CFFF] hover:text-[#75CFFF] sm:right-4 sm:top-4">
          {sound ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div>
          <button type="button" onClick={action.run} disabled={busy} className="px-btn inline-flex items-center gap-2.5 bg-sky px-5 py-3.5 font-pixel text-[11px] uppercase text-on-accent disabled:cursor-not-allowed disabled:opacity-50">
            <action.Icon className="h-4 w-4" aria-hidden="true" />{action.label}
          </button>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={L.part}>
            <li>
              <button type="button" disabled={phase !== 'apart'} aria-pressed={focus === -1} onClick={() => setFocus(-1)}
                className={`border-2 px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${focus === -1 && phase === 'apart' ? 'border-orange text-orange' : 'border-line hover:border-sky hover:text-sky'}`}>
                {L.all}
              </button>
            </li>
            {labComponents.map((c, i) => (
              <li key={c.id}>
                <button type="button" disabled={phase !== 'apart'} aria-pressed={focus === i} onClick={() => { setFocus(i); sfx.click() }}
                  className={`border-2 px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${focus === i ? 'border-orange text-orange' : 'border-line hover:border-sky hover:text-sky'}`}>
                  <span className="mr-1.5 font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>{pick(c.name)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-[13rem] border-2 border-line bg-bg p-5">
          <ComponentInfo idx={phase === 'apart' ? focus : -1} />
        </div>
      </div>
    </div>
  )
}
