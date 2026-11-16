// Scroll timeline for the lab. Everything in the 3D scene is a pure function of
// scroll progress p (0..1), so reassembly is exactly disassembly played backwards.
import { Vector3 } from 'three'

export const PART_IDS = ['topCase', 'buttons', 'cartSlot', 'heatShield', 'motherboard', 'cpu', 'gpu', 'ram', 'components', 'ports', 'bottomCase']
const N = PART_IDS.length
const MB = 4 // parts mounted on the motherboard travel with it
const CHILD_OF_MB = new Set([5, 6, 7, 8, 9])

export const TL = {
  freeze: 0.05,
  flicker: 0.07,
  dim: 0.09,
  collapse: 0.1,
  off: 0.108,
  disStart: 0.12,
  disEnd: 0.582,
  reStart: 0.63,
  reEnd: 0.87,
  on: 0.885,
  bootStart: 0.895,
  bootEnd: 0.932,
  final: 0.95,
}
const DW = (TL.disEnd - TL.disStart) / N
const RW = (TL.reEnd - TL.reStart) / N

export const clamp01 = (x) => Math.min(1, Math.max(0, x))
export const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export const disWindow = (i) => [TL.disStart + i * DW, TL.disStart + (i + 1) * DW]
// part i goes back in slot (N-1-i): last out, first in
export const reWindow = (i) => { const k = N - 1 - i; return [TL.reStart + k * RW, TL.reStart + (k + 1) * RW] }

// 0 = seated in its original position, 1 = fully exploded
export function partAmount(i, p) {
  const [a, b] = disWindow(i)
  const [c, d] = reWindow(i)
  const out = ease(clamp01((p - a) / ((b - a) * 0.55)))
  const back = ease(clamp01((p - c) / ((d - c) * 0.85)))
  return out * (1 - back)
}

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
  [0, 0, 0], // bottom casing stays on the desk; everything above lifts off it
].map((v) => new Vector3(...v))

export function partOffset(i, p, out) {
  out.copy(OFFSET[i]).multiplyScalar(partAmount(i, p))
  if (CHILD_OF_MB.has(i)) out.addScaledVector(OFFSET[MB], partAmount(MB, p))
  if (i !== N - 1) out.y += LIFT * partAmount(N - 1, p)
  // casing lock: the top case presses slightly past flush, then springs back
  if (i === 0) {
    const [c, d] = reWindow(0)
    const k = clamp01((p - (c + (d - c) * 0.85)) / ((d - c) * 0.15))
    if (k > 0 && k < 1) out.y -= Math.sin(k * Math.PI) * 0.035
  }
  return out
}

// Close-up framing for each part: seated centre, camera direction, distance.
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

const LIFT = 0.8 // how far the stack rises off the bottom casing in the last step
const PLAY = { pos: [1.0, 3.7, 11.4], tgt: [0.1, 1.0, -0.7] }

// Camera keyframes over p. `portrait` (aspect < 1) pulls everything back.
export function buildCameraKeys(aspect) {
  const fPlay = aspect < 1.5 ? Math.min(1.9, 1.5 / aspect) : 1
  const fPart = aspect < 1 ? Math.min(2.1, 0.95 / aspect) : 1
  const play = (p, zoom = 1) => ({
    p,
    tgt: new Vector3(...PLAY.tgt),
    pos: new Vector3(...PLAY.pos).sub(new Vector3(...PLAY.tgt)).multiplyScalar(fPlay * zoom).add(new Vector3(...PLAY.tgt)),
    shift: 0,
  })
  const keys = [play(0), play(TL.dim)]
  const tmp = new Vector3()
  FOCUS.forEach((f, i) => {
    const [a, b] = disWindow(i)
    const tgt = new Vector3(...f.c).add(OFFSET[i])
    if (CHILD_OF_MB.has(i)) tgt.add(OFFSET[MB])
    const pos = tmp.set(...f.dir).normalize().multiplyScalar(f.dist * fPart).add(tgt).clone()
    keys.push({ p: a + (b - a) * 0.42, tgt, pos, shift: 1 })
    keys.push({ p: a + (b - a) * 0.86, tgt, pos: pos.clone().add(new Vector3(f.dir[0] > 0 ? -0.35 : 0.35, 0.05, 0)), shift: 1 })
  })
  const over = (p, x, y, z) => ({ p, tgt: new Vector3(0, 2.7, 0), pos: new Vector3(x, y, z).multiplyScalar(aspect < 1 ? fPart * 1.15 : 1).add(new Vector3(0, 2.7, 0)), shift: 0 })
  keys.push(over(0.612, 8.0, 0.6, 12.6))
  keys.push(over(0.74, -7.0, 1.0, 13.0))
  keys.push({ p: TL.reEnd, tgt: new Vector3(0, 0.7, 0), pos: new Vector3(3.2, 2.9, 6.6).multiplyScalar(aspect < 1 ? fPart : 1), shift: 0 })
  keys.push(play(TL.bootStart + 0.01))
  keys.push(play(1, 0.94))
  return keys
}

export function sampleCamera(keys, p, pos, tgt) {
  let i = 0
  while (i < keys.length - 2 && p > keys[i + 1].p) i++
  const a = keys[i], b = keys[i + 1]
  const k = smooth(a.p, b.p, p)
  pos.lerpVectors(a.pos, b.pos, k)
  tgt.lerpVectors(a.tgt, b.tgt, k)
  return a.shift + (b.shift - a.shift) * k
}

// What the overlay UI should show at progress p.
export function stageAt(p) {
  if (p < TL.freeze) return { kind: 'play', idx: -1 }
  if (p < TL.disStart) return { kind: 'shutdown', idx: -1 }
  if (p < TL.disEnd) return { kind: 'part', idx: Math.min(N - 1, Math.floor((p - TL.disStart) / DW)) }
  if (p < TL.reStart) return { kind: 'overview', idx: -1 }
  if (p < TL.reEnd) return { kind: 'reassembly', idx: N - 1 - Math.min(N - 1, Math.floor((p - TL.reStart) / RW)) }
  if (p < TL.final) return { kind: 'boot', idx: -1 }
  return { kind: 'final', idx: -1 }
}

// Console/CRT electrical state derived from p. `time` only drives flicker noise.
export function powerAt(p, time) {
  const on = p < TL.off || p >= TL.on
  const noise = Math.sin(time * 47) * Math.sin(time * 31.7) > -0.15 ? 1 : 0.25
  let led = on ? 1 : 0
  if (p >= TL.flicker && p < TL.off) led = noise
  let brightness = 1, collapse = 0, mode = 'title', bootT = 0
  if (p >= TL.flicker && p < TL.dim) brightness = 0.55 + 0.45 * noise
  else if (p >= TL.dim && p < TL.collapse) brightness = 1 - 0.6 * smooth(TL.dim, TL.collapse, p)
  else if (p >= TL.collapse && p < TL.off) { brightness = 0.4 + 0.8 * smooth(TL.collapse, TL.off, p); collapse = smooth(TL.collapse, TL.off, p) }
  else if (p >= TL.off && p < TL.on) { brightness = 0; collapse = 1; mode = 'off' }
  else if (p >= TL.on && p < TL.bootEnd) {
    mode = 'boot'
    collapse = 1 - smooth(TL.on, TL.bootStart, p)
    bootT = clamp01((p - TL.bootStart) / (TL.bootEnd - TL.bootStart))
  }
  return {
    on,
    led,
    brightness,
    collapse,
    mode,
    bootT,
    frozen: p >= TL.freeze && p < TL.bootEnd,
    glitch: p < TL.off ? smooth(TL.freeze, TL.flicker, p) : 0,
    // cartridge seated (1) / ejected (0)
    cart: 1 - smooth(TL.off, TL.disStart + 0.006, p) + smooth(TL.reEnd - 0.004, TL.on - 0.002, p),
    // TV and game box slide out of the way while the console is in pieces
    away: smooth(TL.off, TL.disStart + 0.012, p) * (1 - smooth(0.84, 0.878, p)),
  }
}
