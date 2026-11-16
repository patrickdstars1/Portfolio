// Layouts for the BK-8's 11 parts. Each part has three poses:
//   assembled - seated in the console
//   exploded  - the layered "burger" view, top to bottom
//   pile      - wherever the physics simulation drops them (see physics.js)
import { Vector3 } from 'three'

export const PART_IDS = ['topCase', 'buttons', 'cartSlot', 'heatShield', 'motherboard', 'cpu', 'gpu', 'ram', 'components', 'ports', 'bottomCase']
const N = PART_IDS.length
const MB = 4 // parts mounted on the motherboard travel with it
const CHILD_OF_MB = new Set([5, 6, 7, 8, 9])
const LIFT = 0.8 // the whole stack floats this far above the bottom casing

// Exploded offsets (world units), relative to the seated position.
const OFFSET = [
  [0, 4.2, 0], // top casing
  [0, 3.4, 0.55], // buttons
  [0, 2.75, 0], // cartridge slot
  [0, 2.0, 0], // heat shield
  [0, 0.6, 0], // motherboard
  [0, 0.6, 0], // cpu (above board)
  [0, 0.6, 0], // gpu
  [0, 0.45, 0], // ram
  [0, 0.3, 0], // components
  [0, 0, 1.15], // ports slide forward out of the board edge
  [0, 0, 0], // bottom casing stays on the desk
].map((v) => new Vector3(...v))

export function explodedOffset(i, out) {
  out.copy(OFFSET[i])
  if (CHILD_OF_MB.has(i)) out.add(OFFSET[MB])
  if (i !== N - 1) out.y += LIFT
  return out
}

// Camera for each layout. Narrow canvases pull back. Each view aims a little
// above the scene so the picture sits in the lower part of the section,
// clear of the heading. (The canvas itself must not be offset: that breaks
// pointer hit-testing for the site shown on the TV.)
const VIEWS = {
  assembled: { pos: [-1.0, 4.2, 11.8], tgt: [-1.7, 2.0, -1.6], wide: 0.82 },
  pile: { pos: [0.4, 10.4, 13.9], tgt: [0, 0, 0.6], wide: 0.92 },
  exploded: { pos: [7.2, 4.5, 13.2], tgt: [0, 3.8, 0], wide: 0.95 },
}
export function layoutCamera(layout, aspect, pos, tgt) {
  const v = VIEWS[layout]
  const f = aspect > 1.7 ? v.wide : aspect < 1.25 ? Math.min(2.5, 1.2 / aspect) : 1
  tgt.set(...v.tgt)
  pos.set(...v.pos).sub(tgt).multiplyScalar(f).add(tgt)
}

// Easing used by the part animator.
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)
export function bounceOut(t) {
  const n = 7.5625, d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}
