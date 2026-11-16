// The BK-8 console as the background of the Interactive Lab section.
// Three buttons switch between three layouts of the same 11 parts:
//   Assemble   -> parts snap back together and the console boots
//   Take apart -> the console bursts and the parts land in a pile
//   View parts -> the parts line up top to bottom
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Hammer, Layers, Volume2, VolumeX, Zap } from 'lucide-react'
import LabScene from './LabScene.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { isSoundEnabled, setSoundEnabled, sfx } from '../lib/sound.js'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function LabStage({ active }) {
  const { t } = useLanguage()
  const L = t.lab
  const [layout, setLayoutState] = useState('assembled')
  const [sound, setSound] = useState(isSoundEnabled)
  const power = useRef(null)
  const started = useRef(false)

  // Mutable state read by the 3D scene every frame.
  const sim = useMemo(() => ({
    layout: 'assembled',
    reduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    onAssembled: null,
    elec: { btn: 0, led: 0, cart: 0, brightness: 0, collapse: 1, mode: 'off', bootT: 0, glitch: 0, away: 0 },
  }), [])

  useEffect(() => () => power.current?.kill(), [])

  // Button, LED, cartridge, CRT, boot animation, title screen.
  const powerOn = useCallback(() => {
    const e = sim.elec
    if (e.mode !== 'off') return
    const k = sim.reduced ? 0.3 : 1
    power.current?.kill()
    power.current = gsap.timeline()
      .call(() => sfx.switch())
      .set(e, { btn: 1, glitch: 0 })
      .set(e, { led: 1 }, '+=0.1')
      .to(e, { cart: 1, duration: 0.9 * k, ease: 'power1.inOut' })
      .call(() => { sfx.connect(); sfx.crtOn() })
      .set(e, { mode: 'boot', brightness: 1, bootT: 0 })
      .to(e, { collapse: 0, duration: 0.35, ease: 'power2.out' })
      .call(() => sfx.boot())
      .to(e, { bootT: 1, duration: 1.7 * k, ease: 'none' })
      .set(e, { mode: 'title' })
  }, [sim])

  // The picture glitches and collapses, the LED dies, the cartridge pops out.
  const powerOff = useCallback(() => {
    const e = sim.elec
    power.current?.kill()
    if (e.mode !== 'off') sfx.crtOff()
    power.current = gsap.timeline()
      .set(e, { glitch: 1, btn: 0, led: 0 })
      .to(e, { collapse: 1, duration: 0.22, ease: 'power2.in' })
      .set(e, { mode: 'off', brightness: 0, glitch: 0, bootT: 0 })
      .to(e, { cart: 0, duration: 0.5, ease: 'power2.out' }, 0)
  }, [sim])

  const go = (next) => {
    if (next === layout) return
    setLayoutState(next); sim.layout = next
    gsap.to(sim.elec, { away: next === 'exploded' ? 1 : 0, duration: 0.6, ease: 'power2.inOut' })
    if (next === 'assembled') sim.onAssembled = () => { sim.onAssembled = null; sfx.complete(); powerOn() }
    else { sim.onAssembled = null; powerOff() }
  }

  // The console switches itself on the first time the section is on screen.
  useEffect(() => {
    if (!active || started.current) return
    const id = setTimeout(() => { started.current = true; powerOn() }, 500)
    return () => clearTimeout(id)
  }, [active, powerOn])

  const toggleSound = () => { setSoundEnabled(!sound); setSound(!sound) }
  const buttons = [
    { id: 'assembled', label: L.assemble, Icon: Hammer },
    { id: 'pile', label: L.disassemble, Icon: Zap },
    { id: 'exploded', label: L.view, Icon: Layers },
  ]

  return (
    <>
      {/* the scene fills the whole section, behind the heading and buttons */}
      <div className="lab-canvas pointer-events-none absolute inset-0 isolate z-0">
        <Boundary fallback={<p className="grid h-full place-items-center px-6 text-center font-mono text-sm text-muted">{L.error}</p>}>
          <LabScene sim={sim} active={active} />
        </Boundary>
      </div>

      <div role="group" aria-label={L.controls} className="relative mx-auto mt-auto flex w-full max-w-3xl flex-wrap items-stretch justify-center gap-3 px-5 md:px-8">
        {buttons.map(({ id, label, Icon }, i) => (
          <button key={id} type="button" onClick={() => go(id)} aria-pressed={layout === id}
            className={`px-btn flex min-w-[9.5rem] flex-1 items-center justify-center gap-2.5 px-4 py-3.5 font-pixel text-[11px] uppercase ${layout === id ? 'bg-orange text-[#10131a]' : 'bg-sky text-on-accent'}`}>
            <span className="font-mono text-xs opacity-70">{i + 1}</span>
            <Icon className="h-4 w-4" aria-hidden="true" />{label}
          </button>
        ))}
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? L.soundOn : L.soundOff} title={sound ? L.soundOn : L.soundOff}
          className="px-btn grid w-12 place-items-center bg-card">
          {sound ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </>
  )
}
