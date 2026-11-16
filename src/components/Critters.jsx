// Supporting cast for the hero playground. Each one reacts to the pointer:
//   Slime  - hops away when the pointer comes close, squishes when clicked
//   Flyer  - a bat (night) or bird (day) that crosses the sky and loops when clicked
//   Block  - a "?" block that pays out a coin every time it is bumped
import { useEffect, useMemo, useRef, useState } from 'react'
import { blockSprite, coinSprite, flyerSheet, slimeSprite } from '../lib/pixelScene.js'
import { sfx } from '../lib/sound.js'
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
      onClick={() => { setHit(Date.now()); sfx.blip() }}
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
    <div className="flyer-path pointer-events-none absolute left-0 top-[26%] z-20">
      <button
        type="button"
        onClick={() => { setLoop(Date.now()); sfx.blip() }}
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

function Block({ scale, bottom, onCoin }) {
  const { lang } = useLanguage()
  const block = useMemo(() => blockSprite(), [])
  const coin = useMemo(() => coinSprite(), [])
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (!bump) return
    const id = setTimeout(() => setBump(0), 600)
    return () => clearTimeout(id)
  }, [bump])
  return (
    <button
      type="button"
      onClick={() => { setBump(Date.now()); onCoin(); sfx.connect(); sfx.blip() }}
      aria-label={lang === 'th' ? 'กล่องปริศนา กดเพื่อรับเหรียญ' : 'Mystery block. Press for a coin'}
      className="pointer-events-auto absolute left-[66%] z-20 block cursor-pointer sm:left-[44%]"
      style={{ bottom, width: block.w * scale, height: block.h * scale }}
    >
      <img key={bump} src={block.url} alt="" className={`pixelated block h-full w-full ${bump ? 'block-bump' : ''}`} />
      {bump > 0 && <img key={`c${bump}`} src={coin.url} alt="" width={coin.w * scale} height={coin.h * scale} className="coin-pop pixelated absolute bottom-full left-1/2 block" />}
    </button>
  )
}

export default function Critters({ scale, ground }) {
  const { t } = useLanguage()
  const [coins, setCoins] = useState(0)
  return (
    <>
      <Flyer scale={scale} />
      <Block scale={scale} bottom={ground + 36 * scale} onCoin={() => setCoins((c) => c + 1)} />
      <Slime scale={scale} bottom={ground - scale} />
      {coins > 0 && (
        <p aria-live="polite" style={pixelFont} className="pointer-events-none absolute left-4 top-20 z-20 text-[10px] leading-none text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.6)] sm:left-8">
          <span className="font-pixel">{t.hero.coins}</span> × {String(coins).padStart(2, '0')}
        </p>
      )}
    </>
  )
}
