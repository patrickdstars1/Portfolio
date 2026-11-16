// The BK-8 console, embedded in the Interactive Lab section.
// Three buttons switch between three layouts of the same 11 parts:
//   Assemble  -> parts snap back together and the console boots
//   Take apart -> the console bursts and the parts land in a pile
//   View parts -> the parts line up top to bottom, and each can be inspected
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Hammer, Layers, Volume2, VolumeX, Zap } from 'lucide-react'
import LabScene from './LabScene.jsx'
import ComponentInfo from './ComponentInfo.jsx'
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
  const [layout, setLayoutState] = useState('assembled')
  const [focus, setFocus] = useState(-1)
  const [sound, setSound] = useState(isSoundEnabled)
  const power = useRef(null)
  const started = useRef(false)

  // Mutable state read by the 3D scene every frame.
  const sim = useMemo(() => ({
    layout: 'assembled',
    focus: -1,
    reduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    onAssembled: null,
    elec: { btn: 0, led: 0, cart: 0, brightness: 0, collapse: 1, mode: 'off', bootT: 0, glitch: 0, away: 0 },
  }), [])

  useEffect(() => () => power.current?.kill(), [])
  useEffect(() => { sim.focus = focus }, [focus, sim])

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
    if (next !== 'exploded') setFocus(-1)
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
  const viewing = layout === 'exploded'

  return (
    <div>
      <div className="relative h-[380px] border-b-4 border-line bg-[#05070c] sm:h-[480px] lg:h-[560px]">
        <Boundary fallback={<p className="grid h-full place-items-center px-6 text-center font-mono text-sm text-[#9BA9BA]">{L.error}</p>}>
          <LabScene sim={sim} onPower={powerOn} active={active} />
        </Boundary>
        <p role="status" className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-black/60 px-2.5 py-2 font-pixel text-[9px] leading-none text-[#F4F7FC] sm:left-4 sm:top-4 sm:text-[10px]">
          <span className={`h-2 w-2 ${layout === 'assembled' ? 'bg-[#FFB47A]' : 'bg-[#5b6676]'}`} />
          {L.status[layout]}
        </p>
        <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? L.soundOn : L.soundOff} title={sound ? L.soundOn : L.soundOff}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center border-2 border-white/30 bg-black/60 text-white transition-colors hover:border-[#75CFFF] hover:text-[#75CFFF] sm:right-4 sm:top-4">
          {sound ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="p-5 md:p-7">
        <div role="group" aria-label={L.controls} className="grid gap-3 sm:grid-cols-3">
          {buttons.map(({ id, label, Icon }, i) => (
            <button key={id} type="button" onClick={() => go(id)} aria-pressed={layout === id}
              className={`px-btn flex items-center justify-center gap-2.5 px-4 py-3.5 font-pixel text-[11px] uppercase ${layout === id ? 'bg-orange text-[#10131a]' : 'bg-sky text-on-accent'}`}>
              <span className="font-mono text-xs opacity-70">{i + 1}</span>
              <Icon className="h-4 w-4" aria-hidden="true" />{label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <ul className="flex flex-wrap content-start gap-2" aria-label={L.part}>
            <li>
              <button type="button" disabled={!viewing} aria-pressed={viewing && focus === -1} onClick={() => setFocus(-1)}
                className={`border-2 px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${viewing && focus === -1 ? 'border-orange text-orange' : 'border-line hover:border-sky hover:text-sky'}`}>
                {L.all}
              </button>
            </li>
            {labComponents.map((c, i) => (
              <li key={c.id}>
                <button type="button" disabled={!viewing} aria-pressed={focus === i} onClick={() => { setFocus(i); sfx.click() }}
                  className={`border-2 px-2.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${focus === i ? 'border-orange text-orange' : 'border-line hover:border-sky hover:text-sky'}`}>
                  <span className="mr-1.5 font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>{pick(c.name)}
                </button>
              </li>
            ))}
          </ul>
          <div className="min-h-[13rem] border-2 border-line bg-bg p-5">
            <ComponentInfo idx={viewing ? focus : -1} viewing={viewing} />
          </div>
        </div>
      </div>
    </div>
  )
}
