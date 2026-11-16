// One shared scroll listener drives every parallax element.
// Each element moves by (its distance from the viewport centre) * speed.
import { prefersReducedMotion } from './scroll.js'

const items = new Set()
let raf = 0
let listening = false

function update() {
  raf = 0
  const vh = window.innerHeight
  for (const it of items) {
    const r = it.anchor.getBoundingClientRect()
    if (r.bottom < -vh || r.top > vh * 2) continue // far off-screen
    const y = (r.top + r.height / 2 - vh / 2) * it.speed
    it.el.style.transform = `translate3d(0, ${Math.round(-y)}px, 0)`
  }
}
const request = () => { if (!raf) raf = requestAnimationFrame(update) }

// `anchor` is an element that does not move (usually the parent), used for measuring.
export function registerParallax(el, anchor, speed) {
  if (prefersReducedMotion()) return () => {}
  const it = { el, anchor, speed }
  items.add(it)
  if (!listening) {
    listening = true
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
  }
  request()
  return () => { items.delete(it); el.style.transform = '' }
}
