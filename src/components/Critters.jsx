// Supporting cast for the hero playground. Each one reacts to the pointer:
//   Slime  - hops away when the pointer comes close, squishes when clicked
//   Flyer  - a bat (night) or bird (day) that crosses the sky and loops when clicked
import { useEffect, useMemo, useRef, useState } from 'react'
import { flyerSheet, slimeSprite } from '../lib/pixelScene.js'
import { sfx } from '../lib/sound.js'
import { mark } from '../lib/achievements.js'
import { prefersReducedMotion } from '../lib/scroll.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useTheme } from '../hooks/useTheme.jsx'

const pixelFont = { fontFamily: "'Press Start 2P', monospace" }

function Bubble({ text }) {
  return (
    <span lang="en" style={pixelFont} className="mascot-bubble absolute bottom-full left-1/2 mb-2 whitespace-nowrap border-2 border-[#10131A] bg-white px-2 py-1.5 text-[9px] leading-none text-[#10131A]">
      {text}
    </span>
  )
}

function Slime({ scale, bottom }) {
  const { lang } = useLanguage()
  const url = useMemo(() => slimeSprite(), [])
  const el = useRef(null)
  const [left, setLeft] = useState(62) // percent of the scene width
  const [hit, setHit] = useState(0)
  const cooldown = useRef(0)

  // run from the pointer
  useEffect(() => {
    if (prefersReducedMotion()) return
    const on = (e) => {
      const now = performance.now()
      if (now < cooldown.current || !el.current) return
      const r = el.current.getBoundingClientRect()
      const cx = r.left + r.width / 2
      if (Math.abs(e.clientY - (r.top + r.height / 2)) > 90 || Math.abs(e.clientX - cx) > 110) return
      cooldown.current = now + 500
      setLeft((v) => {
        const next = v + (e.clientX < cx ? 1 : -1) * (9 + Math.random() * 6)
        return next > 90 ? 70 : next < 6 ? 26 : next // bounce back from the edges
      })
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [])

  useEffect(() => {
    if (!hit) return
    const id = setTimeout(() => setHit(0), 700)
    return () => clearTimeout(id)
  }, [hit])

  return (
    <button
      ref={el}
      type="button"
      onClick={() => { setHit(Date.now()); sfx.blip(); mark('slime') }}
      aria-label={lang === 'th' ? 'สไลม์ กดเพื่อแกล้ง' : 'Slime. Press to poke it'}
      className="pointer-events-auto absolute z-20 block cursor-pointer"
      style={{ left: `${left}%`, bottom, width: 10 * scale, height: 8 * scale, transition: 'left 0.45s steps(7)' }}
    >
      <img src={url} alt="" className="pixelated block h-full w-full origin-bottom" style={hit ? { transform: 'scale(1.3, 0.6)' } : { animation: 'bob 0.9s steps(2) infinite' }} />
      {hit > 0 && <Bubble key={hit} text="!" />}
    </button>
  )
}

function Flyer({ scale }) {
  const { lang } = useLanguage()
  const { theme } = useTheme()
  const sheet = useMemo(() => flyerSheet(theme), [theme])
  const [loop, setLoop] = useState(0)
  useEffect(() => {
    if (!loop) return
    const id = setTimeout(() => setLoop(0), 900)
    return () => clearTimeout(id)
  }, [loop])
  const w = sheet.w * scale, h = sheet.h * scale
  return (
    <div className="flyer-path pointer-events-none absolute left-0 top-[26%] z-[5]">
      <button
        type="button"
        onClick={() => { setLoop(Date.now()); sfx.blip(); mark('flyer') }}
        aria-label={lang === 'th' ? (theme === 'dark' ? 'ค้างคาว กดเพื่อให้ตีลังกา' : 'นก กดเพื่อให้ตีลังกา') : theme === 'dark' ? 'Bat. Press for a loop' : 'Bird. Press for a loop'}
        className={`pointer-events-auto relative block cursor-pointer ${loop ? 'flyer-loop' : ''}`}
        style={{ width: w, height: h }}
      >
        <span className="flyer-wings pixelated block h-full w-full" style={{ backgroundImage: `url(${sheet.url})`, backgroundSize: `${w * 2}px ${h}px`, '--w': `${w}px` }} />
        {loop > 0 && <Bubble key={loop} text="WHEE" />}
      </button>
    </div>
  )
}

export default function Critters({ scale, ground }) {
  return (
    <>
      <Flyer scale={scale} />
      <Slime scale={scale} bottom={ground - scale} />
    </>
  )
}
