// Procedural pixel-art scenery for the parallax layers. Everything is drawn at
// 1:1 pixels into small canvases, exported as data URLs and scaled up with
// `image-rendering: pixelated`. Tiles are 256px wide and repeat seamlessly.
import { drawSprite, HERO_SPRITE, rng } from './pixel.js'

export const TILE = 256

export const PALETTES = {
  dark: {
    sky: ['#0B1030', '#141A4A', '#1F2366', '#34307F', '#553A8C', '#874C8F', '#C4667F'],
    far: ['#2A2460', '#3A3380'],
    near: ['#17153F', '#221F58'],
    castle: '#0D0C2A', window: '#FFB47A',
    grass: ['#3BA55D', '#2B7A45'], brick: ['#7A4A2A', '#4E2D18'],
    orb: ['#FCE9C8', '#E3C79A'], // moon
    tree: ['#0D0C2A', '#17153F'],
  },
  light: {
    sky: ['#5DB6F0', '#76C4F5', '#8FD1F9', '#A9DDFB', '#C3E8FD', '#DDF2FE', '#F3FAFF'],
    far: ['#9CC8EE', '#B5D8F5'],
    near: ['#5E9BD6', '#79AEE0'],
    castle: '#3D5E8C', window: '#FFE08A',
    grass: ['#4FBF6A', '#379A51'], brick: ['#B9764A', '#8A5230'],
    orb: ['#FFD84D', '#FFB02E'], // sun
    tree: ['#2E7D46', '#3F9A58'],
  },
}

function make(w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return [c, ctx]
}

// Hard-stepped sky as a CSS gradient.
export function skyGradient(theme) {
  const s = PALETTES[theme].sky
  const step = 100 / s.length
  return `linear-gradient(to bottom, ${s.map((c, i) => `${c} ${i * step}%, ${c} ${(i + 1) * step}%`).join(', ')})`
}

// Mountain ridge, periodic over TILE so it tiles horizontally.
export function ridgeTile(theme, which, height, seed) {
  const [c, ctx] = make(TILE, height)
  const [body, lit] = PALETTES[theme][which]
  const w = (2 * Math.PI) / TILE
  for (let x = 0; x < TILE; x += 2) {
    const v = 0.5 + 0.28 * Math.sin(x * w * 2 + seed) + 0.14 * Math.sin(x * w * 5 + seed * 2.3) + 0.08 * Math.sin(x * w * 11 + seed * 0.7)
    const top = Math.round((height * (1 - v * 0.9)) / 2) * 2
    ctx.fillStyle = body; ctx.fillRect(x, top, 2, height - top)
    ctx.fillStyle = lit; ctx.fillRect(x, top, 2, 2)
    // lit left faces
    const next = 0.5 + 0.28 * Math.sin((x + 2) * w * 2 + seed) + 0.14 * Math.sin((x + 2) * w * 5 + seed * 2.3) + 0.08 * Math.sin((x + 2) * w * 11 + seed * 0.7)
    if (next > v) { ctx.fillStyle = lit; ctx.fillRect(x, top + 2, 2, Math.min(10, height - top)) }
  }
  return c.toDataURL()
}

// Night: stars. Day: clouds.
export function skyTile(theme) {
  const [c, ctx] = make(TILE, 160)
  const r = rng(theme === 'dark' ? 11 : 23)
  if (theme === 'dark') {
    for (let i = 0; i < 34; i++) {
      ctx.fillStyle = i % 7 === 0 ? '#FFB47A' : i % 3 === 0 ? '#A5E1FF' : '#F4F7FC'
      const x = Math.floor(r() * TILE), y = Math.floor(r() * 150), big = r() > 0.85
      ctx.fillRect(x, y, 1, 1)
      if (big) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3) }
    }
  } else {
    for (let i = 0; i < 5; i++) cloud(ctx, 10 + Math.floor(r() * (TILE - 70)), 8 + Math.floor(r() * 110), '#FFFFFF', '#D6ECFB')
  }
  return c.toDataURL()
}

function cloud(ctx, x, y, a, b) {
  ctx.fillStyle = a
  ctx.fillRect(x + 8, y, 20, 4); ctx.fillRect(x + 4, y + 4, 34, 4); ctx.fillRect(x, y + 8, 46, 6)
  ctx.fillStyle = b
  ctx.fillRect(x + 2, y + 12, 42, 2)
}

export function groundTile(theme) {
  const [c, ctx] = make(32, 40)
  const p = PALETTES[theme]
  ctx.fillStyle = p.grass[0]; ctx.fillRect(0, 0, 32, 5)
  ctx.fillStyle = p.grass[1]
  for (let x = 0; x < 32; x += 4) ctx.fillRect(x + ((x / 4) % 2), 4, 2, 2)
  ctx.fillStyle = p.brick[0]; ctx.fillRect(0, 6, 32, 34)
  ctx.fillStyle = p.brick[1]
  for (let y = 0; y < 5; y++) {
    ctx.fillRect(0, 6 + y * 8, 32, 1)
    for (let x = (y % 2) * 8; x < 32; x += 16) ctx.fillRect(x, 6 + y * 8, 1, 8)
  }
  return c.toDataURL()
}

export function castleSprite(theme) {
  const [c, ctx] = make(60, 76)
  const p = PALETTES[theme]
  ctx.fillStyle = p.castle
  ctx.fillRect(8, 30, 44, 46); ctx.fillRect(2, 18, 12, 58); ctx.fillRect(46, 18, 12, 58); ctx.fillRect(24, 6, 12, 30)
  for (const x of [2, 7, 12, 46, 51, 56]) ctx.fillRect(x - (x > 40 ? 0 : 0), 14, 3, 4)
  for (const x of [24, 29, 34]) ctx.fillRect(x, 2, 3, 4)
  ctx.fillStyle = p.window
  ctx.fillRect(28, 14, 3, 5); ctx.fillRect(6, 28, 3, 5); ctx.fillRect(50, 28, 3, 5)
  ctx.fillStyle = theme === 'dark' ? '#17153F' : '#2B4467'
  ctx.fillRect(25, 56, 10, 20)
  return c.toDataURL()
}

export function orbSprite(theme) {
  const [c, ctx] = make(28, 28)
  const p = PALETTES[theme]
  ctx.fillStyle = p.orb[0]
  for (let y = -11; y <= 11; y++) { const w = Math.round(Math.sqrt(121 - y * y)); ctx.fillRect(14 - w, 14 + y, w * 2, 1) }
  ctx.fillStyle = p.orb[1]
  if (theme === 'dark') { ctx.fillRect(8, 9, 4, 3); ctx.fillRect(17, 17, 3, 3); ctx.fillRect(11, 19, 2, 2) }
  else { ctx.fillRect(6, 20, 14, 2); ctx.fillRect(9, 22, 10, 2) }
  return c.toDataURL()
}

export function treeSprite(theme) {
  const [c, ctx] = make(18, 30)
  const [a, b] = PALETTES[theme].tree
  ctx.fillStyle = a
  ctx.fillRect(7, 0, 4, 4); ctx.fillRect(5, 4, 8, 5); ctx.fillRect(3, 9, 12, 6); ctx.fillRect(1, 15, 16, 7); ctx.fillRect(7, 22, 4, 8)
  ctx.fillStyle = b
  ctx.fillRect(5, 6, 3, 2); ctx.fillRect(3, 12, 4, 2); ctx.fillRect(1, 18, 5, 2)
  return c.toDataURL()
}

export function heroSprite(alt = false) {
  const [c, ctx] = make(16, 16)
  drawSprite(ctx, HERO_SPRITE, 0, 0, 1, alt)
  return c.toDataURL()
}

export function slimeSprite() {
  const [c, ctx] = make(10, 8)
  ctx.fillStyle = '#FFB47A'; ctx.fillRect(1, 2, 8, 6); ctx.fillRect(0, 4, 10, 4); ctx.fillRect(2, 1, 6, 1)
  ctx.fillStyle = '#10131A'; ctx.fillRect(2, 4, 2, 2); ctx.fillRect(6, 4, 2, 2)
  return c.toDataURL()
}

// Small floating decorations used between sections.
const DECO = {
  coin: { w: 8, h: 8, rows: ['..oooo..', '.oyyyyo.', 'oyyoyyyo', 'oyyoyyyo', 'oyyoyyyo', 'oyyoyyyo', '.oyyyyo.', '..oooo..'], pal: { o: '#B4551A', y: '#FFD84D' } },
  heart: { w: 9, h: 8, rows: ['.rr...rr.', 'rrrr.rrrr', 'rwrrrrrrr', 'rrrrrrrrr', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'], pal: { r: '#E2543E', w: '#FFC9BF' } },
  star: { w: 9, h: 9, rows: ['....s....', '....s....', '...sss...', 'sssssssss', '.sssssss.', '..sssss..', '..ss.ss..', '.ss...ss.', '.s.....s.'], pal: { s: '#75CFFF' } },
  block: { w: 10, h: 10, rows: ['bbbbbbbbbb', 'boooooooob', 'booqqqooob', 'boqooqooob', 'boooqqooob', 'boooqoooob', 'boooooooob', 'boooqoooob', 'boooooooob', 'bbbbbbbbbb'], pal: { b: '#7A4A2A', o: '#FFB47A', q: '#10131A' } },
  cloud: null,
}
export function decoSprite(kind, theme) {
  if (kind === 'cloud') {
    const [c, ctx] = make(46, 14)
    cloud(ctx, 0, 0, theme === 'dark' ? '#2A3A55' : '#FFFFFF', theme === 'dark' ? '#1C2940' : '#C9E3F6')
    return { url: c.toDataURL(), w: 46, h: 14 }
  }
  const d = DECO[kind]
  const [c, ctx] = make(d.w, d.h)
  d.rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const col = d.pal[row[x]]; if (col) { ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1) } } })
  return { url: c.toDataURL(), w: d.w, h: d.h }
}
