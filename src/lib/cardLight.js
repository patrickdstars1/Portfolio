// Pointer-aware pixel shadows: while the pointer is over a .px-card, the card's
// hard shadow falls away from the pointer, as if the pointer were the light.
// Offsets snap to 2px steps so the effect stays "8-bit".
export function initCardLight() {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return () => {}
  let current = null
  const clear = () => {
    if (!current) return
    current.style.removeProperty('--sx'); current.style.removeProperty('--sy')
    current = null
  }
  const onMove = (e) => {
    const card = e.target instanceof Element ? e.target.closest('.px-card') : null
    if (card !== current) clear()
    if (!card) return
    current = card
    const r = card.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    const snap = (v) => Math.round((-v * 9) / 2) * 2
    card.style.setProperty('--sx', `${snap(nx)}px`)
    card.style.setProperty('--sy', `${snap(ny)}px`)
  }
  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', clear)
  return () => { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', clear); clear() }
}
