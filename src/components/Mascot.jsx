// "Byte", the site mascot. Lives on the ground of the pixel scene.
//  - walks toward the pointer and watches it with its eyes
//  - wanders on its own when the pointer is idle (and on touch screens)
//  - hops with a happy face and a speech bubble when clicked, tapped or hovered
import { useEffect, useRef, useState } from 'react'
import { drawMascot } from '../lib/pixel.js'
import { sfx } from '../lib/sound.js'
import { prefersReducedMotion } from '../lib/scroll.js'
import { useLanguage } from '../hooks/useLanguage.jsx'

const WORDS = ['HI!', 'YAY!', '+1 UP', 'NICE!', '^_^', 'WOW!']

export default function Mascot({ scale, bottom, start = 0.12 }) {
  const { lang } = useLanguage()
  const wrap = useRef(null) // spans the scene, used for measuring
  const body = useRef(null) // the moving element
  const canvas = useRef(null)
  const [bubble, setBubble] = useState(null)
  const cheer = useRef(() => {})
  const size = 16 * scale

  useEffect(() => {
    const ctx = canvas.current.getContext('2d')
    const reduced = prefersReducedMotion()
    const s = {
      x: null, y: 0, vy: 0, dir: 1, frame: 0, step: 0,
      target: null, pointer: null, lastMove: -10, nextWander: 2,
      happyUntil: 0, blinkAt: 2.5, blinkUntil: 0, hoverCooldown: 0, last: '',
    }
    let raf = 0, visible = false, prev = performance.now() / 1000

    const onMove = (e) => { s.pointer = { x: e.clientX, y: e.clientY }; s.lastMove = performance.now() / 1000 }
    window.addEventListener('pointermove', onMove, { passive: true })

    cheer.current = (quiet) => {
      const now = performance.now() / 1000
      s.happyUntil = now + 0.9
      if (!reduced && s.y === 0) s.vy = 300
      if (!quiet) {
        sfx.blip()
        setBubble({ id: now, text: WORDS[Math.floor(Math.random() * WORDS.length)] })
      }
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
        if (Math.abs(dx) > size * 0.35) {
          walking = true
          s.dir = dx > 0 ? 1 : -1
          s.x += s.dir * Math.min(Math.abs(dx), (following ? 260 : 110) * dt)
          s.step += dt * 9
          s.frame = Math.floor(s.step) % 2
        } else if (!following) s.target = null
      }
      if (!walking) s.frame = 0

      // hop physics
      if (s.vy !== 0 || s.y > 0) {
        s.y += s.vy * dt; s.vy -= 1100 * dt
        if (s.y <= 0) { s.y = 0; s.vy = 0 }
      }

      // eyes follow the pointer; say hi when it comes close
      const cx = rect.left + s.x + size / 2
      const cy = rect.bottom - bottom - size / 2 - s.y
      let look = [s.dir > 0 ? 1 : 0, 1]
      if (s.pointer) {
        // the sprite is mirrored when it faces left, so mirror the look direction too
        const right = s.pointer.x > cx
        look = [(s.dir > 0 ? right : !right) ? 1 : 0, s.pointer.y > cy ? 1 : 0]
        const near = Math.hypot(s.pointer.x - cx, s.pointer.y - cy) < size * 0.9
        if (near && now > s.hoverCooldown && now - s.lastMove < 1) { s.hoverCooldown = now + 2.5; cheer.current(true) }
      }
      if (now > s.blinkAt) { s.blinkUntil = now + 0.13; s.blinkAt = now + 2.5 + Math.random() * 3 }
      const mood = now < s.happyUntil ? 'happy' : now < s.blinkUntil ? 'blink' : 'idle'

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
    return () => { io.disconnect(); window.removeEventListener('pointermove', onMove); if (raf) cancelAnimationFrame(raf) }
  }, [size, bottom, start])

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(null), 900)
    return () => clearTimeout(id)
  }, [bubble])

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-x-0 z-20" style={{ bottom, height: size }}>
      <button
        ref={body}
        type="button"
        onClick={() => cheer.current(false)}
        aria-label={lang === 'th' ? 'Byte มาสคอตของเว็บ กดเพื่อทักทาย' : 'Byte the mascot. Press to say hi'}
        className="pointer-events-auto absolute bottom-0 left-0 block cursor-pointer will-change-transform"
        style={{ width: size, height: size }}
      >
        <canvas ref={canvas} width={16} height={16} className="pixelated block h-full w-full" />
        {bubble && (
          <span key={bubble.id} lang="en" className="mascot-bubble absolute bottom-full left-1/2 mb-2 whitespace-nowrap border-2 border-[#10131A] bg-white px-2 py-1.5 text-[9px] leading-none text-[#10131A]" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            {bubble.text}
          </span>
        )}
      </button>
    </div>
  )
}
