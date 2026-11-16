// Procedural canvas textures: no image downloads for the lab.
import { CanvasTexture, SRGBColorSpace, NearestFilter, RepeatWrapping } from 'three'
import { rng } from '../lib/pixel.js'
import { drawCoverArt } from './pixelQuest.js'

const MONO = '"JetBrains Mono Variable", ui-monospace, Menlo, Consolas, monospace'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  return [c, c.getContext('2d')]
}
function tex(c, { pixel = false } = {}) {
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  if (pixel) { t.magFilter = NearestFilter; t.minFilter = NearestFilter; t.generateMipmaps = false }
  return t
}

// Printed label: lines of text on a flat background.
export function labelTexture(lines, { w = 512, h = 128, bg = '#1b1c20', fg = '#c9ced6', size = 34, align = 'center', weight = 600, notch = false } = {}) {
  const [c, ctx] = canvas(w, h)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  if (notch) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(0, h / 2, h * 0.14, -Math.PI / 2, Math.PI / 2); ctx.fill() }
  ctx.fillStyle = fg
  ctx.font = `${weight} ${size}px ${MONO}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = align
  const lh = size * 1.25
  const y0 = h / 2 - ((lines.length - 1) * lh) / 2
  lines.forEach((l, i) => ctx.fillText(l, align === 'center' ? w / 2 : align === 'right' ? w - 24 : 24, y0 + i * lh))
  return tex(c)
}

// Motherboard: solder mask, hand-routed looking traces, pads and silkscreen.
// Layout coordinates match the board in RetroConsole.jsx (3.5 x 2.5 units).
export function pcbTexture() {
  const W = 1400, H = 1000
  const [c, ctx] = canvas(W, H)
  const r = rng(42)
  const X = (x) => ((x + 1.75) / 3.5) * W
  const Z = (z) => ((z + 1.25) / 2.5) * H
  ctx.fillStyle = '#1d5f3f'; ctx.fillRect(0, 0, W, H)
  // ground pour mottling
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.012 + r() * 0.02})`
    ctx.fillRect(r() * W, r() * H, 20 + r() * 80, 20 + r() * 80)
  }
  // traces: bundles of parallel Manhattan lines (address / data buses)
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  for (let b = 0; b < 26; b++) {
    const lanes = 3 + Math.floor(r() * 7)
    let x = 60 + r() * (W - 120), y = 60 + r() * (H - 120)
    const horiz = r() > 0.5
    const segs = 2 + Math.floor(r() * 3)
    const pts = [[x, y]]
    let hz = horiz
    for (let s = 0; s < segs; s++) {
      const len = (120 + r() * 360) * (r() > 0.5 ? 1 : -1)
      if (hz) x = Math.min(W - 40, Math.max(40, x + len)); else y = Math.min(H - 40, Math.max(40, y + len))
      pts.push([x, y]); hz = !hz
    }
    for (let l = 0; l < lanes; l++) {
      const o = l * 9
      ctx.strokeStyle = '#2f8a5c'; ctx.lineWidth = 4
      ctx.beginPath()
      pts.forEach(([px, py], i) => (i ? ctx.lineTo(px + o, py + o) : ctx.moveTo(px + o, py + o)))
      ctx.stroke()
      const [ex, ey] = pts[pts.length - 1]
      ctx.fillStyle = '#c9b46a'; ctx.beginPath(); ctx.arc(ex + o, ey + o, 5, 0, 7); ctx.fill()
      ctx.fillStyle = '#143f2a'; ctx.beginPath(); ctx.arc(ex + o, ey + o, 2, 0, 7); ctx.fill()
    }
  }
  // wide power rails
  ctx.strokeStyle = '#2f8a5c'; ctx.lineWidth = 16
  ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(W - 40, 40); ctx.lineTo(W - 40, H - 40); ctx.lineTo(40, H - 40); ctx.closePath(); ctx.stroke()
  // silkscreen outlines + reference designators
  ctx.strokeStyle = '#e8efe9'; ctx.fillStyle = '#e8efe9'; ctx.lineWidth = 3
  ctx.font = `600 22px ${MONO}`; ctx.textBaseline = 'alphabetic'
  const outline = (x, z, w, d, label) => {
    ctx.strokeRect(X(x - w / 2), Z(z - d / 2), (w / 3.5) * W, (d / 2.5) * H)
    ctx.fillText(label, X(x - w / 2), Z(z - d / 2) - 8)
  }
  outline(-0.8, 0.35, 1.42, 0.5, 'U1  CPU')
  outline(0.75, 0.35, 1.42, 0.5, 'U2  PPU')
  outline(-0.9, 0.9, 0.9, 0.4, 'U3  RAM')
  outline(0.1, 0.9, 0.9, 0.4, 'U4  VRAM')
  outline(0, -0.35, 2.4, 0.34, 'J1  CARTRIDGE 60P')
  outline(-1.2, -0.95, 0.95, 0.5, 'RF1')
  outline(1.3, -0.95, 0.5, 0.42, 'VR1')
  outline(0.5, 1.12, 0.52, 0.2, 'J2')
  outline(1.3, 1.12, 0.52, 0.2, 'J3')
  ctx.font = `700 34px ${MONO}`
  ctx.fillText('BK-8 MAIN BOARD', X(-1.62), Z(1.2) - 6)
  ctx.font = `600 22px ${MONO}`
  ctx.fillText('REV C   BANK.DEV', X(-0.45), Z(1.2) - 6)
  // mounting holes
  for (const [x, z] of [[-1.6, -1.1], [1.6, -1.1], [-1.6, 1.1], [1.6, 1.1]]) {
    ctx.fillStyle = '#c9b46a'; ctx.beginPath(); ctx.arc(X(x), Z(z), 22, 0, 7); ctx.fill()
    ctx.fillStyle = '#0c1410'; ctx.beginPath(); ctx.arc(X(x), Z(z), 11, 0, 7); ctx.fill()
  }
  return tex(c)
}

// Fine moulded-plastic grain, used as a bump map on the casing.
export function grainTexture() {
  const [c, ctx] = canvas(256, 256)
  const img = ctx.createImageData(256, 256)
  const r = rng(5)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + r() * 60
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(6, 6)
  return t
}

export function coverTexture(compact = false) {
  const [c, ctx] = compact ? canvas(320, 240) : canvas(512, 720)
  drawCoverArt(ctx, c.width, c.height, { compact })
  return tex(c, { pixel: true })
}

// Soft radial blob used as a cheap contact shadow.
export function shadowTexture() {
  const [c, ctx] = canvas(128, 128)
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(0.6, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128)
  return new CanvasTexture(c)
}
