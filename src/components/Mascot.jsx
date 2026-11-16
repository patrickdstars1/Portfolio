// "Byte", the site mascot. Lives on the ground of the pixel scene.
//  - walks toward the pointer and watches it with its eyes
//  - wanders on its own when the pointer is idle (and on touch screens)
// With `game` on (the hero) it also plays a small coin game:
//  - Space or a click/tap anywhere on the scene makes Byte jump
//  - holding the key or button makes the jump higher
//  - coins appear at random; touching one collects it
// Without `game` (the footer) a click on Byte just makes it hop and say hi.
import { useEffect, useMemo, useRef, useState } from 'react'
import { drawMascot } from '../lib/pixel.js'
import { coinSprite } from '../lib/pixelScene.js'
import { sfx } from '../lib/sound.js'
import { addCoins, unlock } from '../lib/achievements.js'
import { prefersReducedMotion } from '../lib/scroll.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const WORDS = ['HI!', 'YAY!', 'NICE!', '^_^', 'WOW!']
const MAX_COINS = 3
const pixelFont = { fontFamily: "'Press Start 2P', monospace" }

export default function Mascot({ scale, bottom, start = 0.12, game = false }) {
  const { lang, t } = useLanguage()
  const wrap = useRef(null) // spans the scene at ground level, used for measuring
  const body = useRef(null) // the moving element
  const canvas = useRef(null)
  const [bubble, setBubble] = useState(null)
  const [coins, setCoins] = useState([])
  const [score, setScore] = useState(0)
  const cheer = useRef(() => {})
  const coinArt = useMemo(() => coinSprite(), [])
  const size = 16 * scale
  const coinSize = coinArt.w * scale

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    const reduced = prefersReducedMotion()
    const host = wrap.current.closest('section, footer') || wrap.current.parentElement
    // jump tuning, in px relative to the sprite scale
    const G = 620 * scale // gravity
    const HOLD_G = G * 0.42 // gravity while the jump is held and Byte is still rising
    const JUMP = Math.sqrt(2 * HOLD_G * 62 * scale) // full hold reaches about 62 sprite pixels
    const s = {
      x: null, y: 0, vy: 0, dir: 1, frame: 0, step: 0,
      target: null, pointer: null, lastMove: -10, nextWander: 2,
      happyUntil: 0, blinkAt: 2.5, blinkUntil: 0, hoverCooldown: 0, last: '',
      held: false, heldSince: 0, coins: [], nextCoin: 1.2, coinId: 0,
    }
    let raf = 0, visible = false, prev = performance.now() / 1000

    const onMove = (e) => { s.pointer = { x: e.clientX, y: e.clientY }; s.lastMove = performance.now() / 1000 }
    window.addEventListener('pointermove', onMove, { passive: true })

    const say = (text) => setBubble({ id: performance.now(), text })
    cheer.current = () => {
      const now = performance.now() / 1000
      s.happyUntil = now + 0.9
      if (!reduced && s.y === 0) s.vy = JUMP * 0.55
      sfx.blip(); say(WORDS[Math.floor(Math.random() * WORDS.length)])
    }

    // ---- jump input (game mode)
    const press = () => {
      if (s.held) return
      s.held = true; s.heldSince = performance.now() / 1000
      if (s.y === 0) { s.vy = JUMP; sfx.jump() }
    }
    const release = () => {
      if (!s.held) return
      s.held = false
      if (s.vy > 0) s.vy *= 0.45 // cut the jump short
    }
    const interactive = (el) => el instanceof Element && el.closest('a, button, input, textarea, select, iframe, [contenteditable]')
    const onKeyDown = (e) => {
      if (e.code !== 'Space' || e.repeat || !visible || interactive(e.target)) return
      e.preventDefault() // Space would otherwise page-scroll
      press()
    }
    const onKeyUp = (e) => { if (e.code === 'Space') release() }
    const onDown = (e) => { if (e.button === 0 && !interactive(e.target)) press() }
    if (game) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      host.addEventListener('pointerdown', onDown)
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
    }

    const tick = () => {
      raf = 0
      if (!visible) return
      const now = performance.now() / 1000
      const dt = Math.min(0.05, now - prev); prev = now
      const rect = wrap.current.getBoundingClientRect()
      const max = Math.max(0, rect.width - size)
      if (s.x === null) s.x = max * start

      // where to go: follow the pointer while it moves, otherwise wander
      const following = s.pointer && now - s.lastMove < 4
      if (following) s.target = Math.min(max, Math.max(0, s.pointer.x - rect.left - size / 2))
      else if (now > s.nextWander) { s.target = Math.random() * max; s.nextWander = now + 3 + Math.random() * 4 }

      let walking = false
      if (!reduced && s.target !== null) {
        const dx = s.target - s.x
        if (Math.abs(dx) > size * 0.3) {
          walking = true
          s.dir = dx > 0 ? 1 : -1
          s.x += s.dir * Math.min(Math.abs(dx), (following ? 300 : 110) * dt)
          s.step += dt * 9
          s.frame = Math.floor(s.step) % 2
        } else if (!following) s.target = null
      }
      if (!walking || s.y > 0) s.frame = 0

      // jump physics: lighter gravity while the jump is held (up to 0.5 s)
      if (s.vy !== 0 || s.y > 0) {
        const holding = s.held && s.vy > 0 && now - s.heldSince < 0.5
        s.vy -= (holding ? HOLD_G : G) * dt
        s.y += s.vy * dt
        if (s.y <= 0) { s.y = 0; s.vy = 0 }
        if (game && s.y > 56 * scale) unlock('highjump')
      }

      // ---- coins
      if (game) {
        if (s.coins.length < MAX_COINS && now > s.nextCoin) {
          // on wide screens the copy sits on the left, so coins appear on the right
          const from = rect.width >= 1024 ? 0.5 : 0.04
          const coin = {
            id: ++s.coinId,
            x: (from + Math.random() * (0.95 - from)) * rect.width,
            y: (12 + Math.random() * 52) * scale, // height above the ground: some need a held jump
            until: now + 9,
          }
          s.coins = [...s.coins, coin]; setCoins(s.coins)
          s.nextCoin = now + 1.1 + Math.random() * 1.8
        }
        const bx = s.x + size / 2, by = s.y + size / 2
        let changed = false, got = 0
        s.coins = s.coins.filter((c) => {
          if (Math.abs(c.x - bx) < size * 0.6 && Math.abs(c.y - by) < size * 0.62) { got++; changed = true; return false }
          if (now > c.until) { changed = true; return false }
          return true
        })
        if (changed) setCoins(s.coins)
        if (got) { setScore((v) => v + got); addCoins(got); sfx.coin(); s.happyUntil = now + 0.5; say('+1') }
      }

      // eyes follow the pointer; in the footer, say hi when it comes close
      const cx = rect.left + s.x + size / 2
      const cy = rect.bottom - size / 2 - s.y
      let look = [s.dir > 0 ? 1 : 0, 1]
      if (s.pointer) {
        // the sprite is mirrored when it faces left, so mirror the look direction too
        const right = s.pointer.x > cx
        look = [(s.dir > 0 ? right : !right) ? 1 : 0, s.pointer.y > cy ? 1 : 0]
        const near = Math.hypot(s.pointer.x - cx, s.pointer.y - cy) < size * 0.9
        if (!game && near && now > s.hoverCooldown && now - s.lastMove < 1) { s.hoverCooldown = now + 2.5; s.happyUntil = now + 0.9; if (!reduced && s.y === 0) s.vy = JUMP * 0.5 }
      }
      if (now > s.blinkAt) { s.blinkUntil = now + 0.13; s.blinkAt = now + 2.5 + Math.random() * 3 }
      const mood = now < s.happyUntil || s.y > size * 0.5 ? 'happy' : now < s.blinkUntil ? 'blink' : 'idle'

      body.current.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(-s.y)}px, 0)`
      canvas.current.style.transform = s.dir < 0 ? 'scaleX(-1)' : ''
      const key = `${s.frame}${look}${mood}`
      if (key !== s.last) {
        s.last = key
        ctx.clearRect(0, 0, 16, 16)
        drawMascot(ctx, 0, 0, 1, { frame: s.frame, look, mood })
      }
      raf = requestAnimationFrame(tick)
    }

    // only animate while the scene is on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) { prev = performance.now() / 1000; raf = requestAnimationFrame(tick) }
    })
    io.observe(wrap.current)
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [size, scale, bottom, start, game])

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(null), 900)
    return () => clearTimeout(id)
  }, [bubble])

  const Body = game ? 'div' : 'button'
  return (
    <>
      <div ref={wrap} className="pointer-events-none absolute inset-x-0 z-20" style={{ bottom, height: size }}>
        {coins.map((c) => (
          <img key={c.id} src={coinArt.url} alt="" className="coin pixelated absolute block" width={coinSize} height={coinSize}
            style={{ left: c.x - coinSize / 2, bottom: c.y - coinSize / 2 }} />
        ))}
        <Body
          ref={body}
          {...(game ? { 'aria-hidden': true } : { type: 'button', onClick: () => cheer.current(), 'aria-label': lang === 'th' ? 'Byte มาสคอตของเว็บ กดเพื่อทักทาย' : 'Byte the mascot. Press to say hi' })}
          className={`absolute bottom-0 left-0 block will-change-transform ${game ? '' : 'pointer-events-auto cursor-pointer'}`}
          style={{ width: size, height: size }}
        >
          <canvas ref={canvas} width={16} height={16} className="pixelated block h-full w-full" />
          {bubble && (
            <span key={bubble.id} lang="en" style={pixelFont} className="mascot-bubble absolute bottom-full left-1/2 mb-2 whitespace-nowrap border-2 border-[#10131A] bg-white px-2 py-1.5 text-[9px] leading-none text-[#10131A]">
              {bubble.text}
            </span>
          )}
        </Body>
      </div>
      {game && (
        <p aria-live="polite" className="pointer-events-none absolute right-4 top-20 z-20 flex items-center gap-2 bg-black/55 px-2.5 py-2 text-[10px] leading-none text-white sm:right-8" style={pixelFont}>
          <img src={coinArt.url} alt="" width={16} height={16} className="pixelated block" />
          <span className="font-pixel">{t.hero.coins}</span> × {String(score).padStart(2, '0')}
        </p>
      )}
    </>
  )
}
