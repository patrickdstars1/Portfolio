// Layouts for the BK-8's 11 parts. Each part has three poses:
//   assembled - seated in the console
//   exploded  - the layered "burger" view, top to bottom
//   pile      - scattered on the desk after the console bursts apart
import { Euler, Quaternion, Vector3 } from 'three'

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

// Seated centre of each part + close-up framing (camera direction, distance).
const FOCUS = [
  { c: [0, 0.75, 0], dir: [0.5, 0.5, 1], dist: 7.4 },
  { c: [-0.95, 0.75, 0.95], dir: [-0.35, 0.55, 1], dist: 3.3 },
  { c: [0, 0.45, -0.35], dir: [0.45, 0.5, 1], dist: 4.6 },
  { c: [0, 0.48, 0], dir: [-0.4, 0.55, 1], dist: 6.4 },
  { c: [0, 0.18, 0], dir: [0.3, 0.5, 1], dist: 6.4 },
  { c: [-0.8, 0.26, 0.35], dir: [-0.3, 0.4, 1], dist: 3.0 },
  { c: [0.75, 0.26, 0.35], dir: [0.35, 0.4, 1], dist: 3.0 },
  { c: [-0.4, 0.24, 0.9], dir: [-0.2, 0.42, 1], dist: 3.0 },
  { c: [0.1, 0.3, -0.9], dir: [0.3, 0.42, 1], dist: 5.0 },
  { c: [0.9, 0.33, 1.3], dir: [0.5, 0.4, 1], dist: 3.3 },
  { c: [0, 0.45, 0], dir: [-0.45, 0.34, 1], dist: 7.6 },
]

// Where each part's centre comes to rest in the pile, and how it lies there.
const PILE = [
  { p: [-3.2, 0.36, 1.5], r: [Math.PI - 0.1, -0.45, 0.05] }, // top casing, upside down
  { p: [2.4, 0.42, 2.1], r: [0.1, 0.9, 0.25] }, // buttons, landed in the tray
  { p: [1.5, 0.22, -0.4], r: [0.0, 0.5, 0.0] }, // cartridge slot
  { p: [0.2, 0.2, 0.6], r: [0.07, -0.5, 0.04] }, // heat shield
  { p: [-0.6, 0.08, 2.7], r: [0.02, 0.3, 0.0] }, // motherboard
  { p: [1.0, 0.1, 4.1], r: [0, 0.7, 0] }, // cpu
  { p: [-1.8, 0.26, 3.6], r: [0.5, -0.4, 0.2] }, // gpu, propped on the board
  { p: [2.9, 0.1, 4.2], r: [0, 1.25, 0] }, // ram
  { p: [0.3, 0.2, -1.0], r: [0.0, -0.3, 0.0] }, // components
  { p: [-1.6, 0.2, -0.5], r: [0, 0.8, 0] }, // ports
  { p: [2.5, 0.25, 2.1], r: [0, 0.4, 0.03] }, // bottom casing
].map(({ p, r }) => ({ p: new Vector3(...p), q: new Quaternion().setFromEuler(new Euler(...r)) }))

const tmp = new Vector3()
// Group position that puts part i's centre at its pile spot with its pile rotation.
export function pilePose(i, seated, pos, quat) {
  const pile = PILE[i]
  quat.copy(pile.q)
  tmp.set(...FOCUS[i].c).sub(seated).applyQuaternion(quat) // centre relative to the group origin
  pos.copy(pile.p).sub(tmp)
}

// Camera for each layout. Narrow canvases pull back.
const VIEWS = {
  assembled: { pos: [1.0, 3.7, 11.4], tgt: [0.1, 1.0, -0.7], wide: 0.74 },
  pile: { pos: [0.6, 9.2, 14.2], tgt: [0, 0, 1.1], wide: 0.9 },
  exploded: { pos: [7.2, 3.6, 13.2], tgt: [0, 2.9, 0], wide: 0.95 },
}
export function layoutCamera(layout, aspect, pos, tgt) {
  const v = VIEWS[layout]
  const f = aspect > 1.7 ? v.wide : aspect < 1.25 ? Math.min(1.7, 1.2 / aspect) : 1
  tgt.set(...v.tgt)
  pos.set(...v.pos).sub(tgt).multiplyScalar(f).add(tgt)
}

// Close-up of part i in the exploded view.
export function focusCamera(i, aspect, pos, tgt) {
  const f = FOCUS[i]
  const k = aspect < 1 ? Math.min(2.1, 0.95 / aspect) : 1
  explodedOffset(i, tgt).add(tmp.set(...f.c))
  pos.set(...f.dir).normalize().multiplyScalar(f.dist * k).add(tgt)
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
