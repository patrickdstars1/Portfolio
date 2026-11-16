// Procedural pixel-art scenery for the parallax layers. Everything is drawn at
// 1:1 pixels into small canvases, exported as data URLs and scaled up with
// `image-rendering: pixelated`. Tiles are 256px wide and repeat seamlessly.
import { rng } from './pixel.js'

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

export function slimeSprite() {
  const [c, ctx] = make(10, 8)
  ctx.fillStyle = '#B98CFF'; ctx.fillRect(1, 2, 8, 6); ctx.fillRect(0, 4, 10, 4); ctx.fillRect(2, 1, 6, 1)
  ctx.fillStyle = '#10131A'; ctx.fillRect(2, 4, 2, 2); ctx.fillRect(6, 4, 2, 2)
  return c.toDataURL()
}

// Item icons shown beside each section (16x16, drawn with rectangles).
const ICONS = {
  chip: (R, c) => { R(4, 4, 8, 8, c.o); R(5, 5, 6, 6, c.sky); R(7, 7, 2, 2, c.orange); for (const i of [5, 7, 9]) { R(i, 2, 1, 2, c.o); R(i, 12, 1, 2, c.o); R(2, i, 2, 1, c.o); R(12, i, 2, 1, c.o) } },
  floppy: (R, c) => { R(3, 2, 10, 12, c.o); R(4, 3, 8, 10, c.sky); R(6, 3, 4, 3, c.white); R(8, 3, 1, 2, c.o); R(5, 8, 6, 5, c.white); R(6, 10, 4, 1, c.orange) },
  cartridge: (R, c) => { R(2, 2, 12, 11, c.o); R(3, 3, 10, 9, c.grey); R(4, 5, 8, 5, c.sky); R(5, 6, 6, 1, c.white); R(5, 8, 4, 1, c.orange); R(4, 13, 8, 2, c.o); R(5, 13, 6, 1, c.orange) },
  gamepad: (R, c) => { R(1, 5, 14, 7, c.o); R(2, 6, 12, 5, c.light); R(3, 8, 3, 1, c.o); R(4, 7, 1, 3, c.o); R(11, 7, 2, 2, c.orange); R(9, 9, 2, 2, c.sky) },
  mail: (R, c) => { R(2, 4, 12, 9, c.o); R(3, 5, 10, 7, c.white); for (let i = 0; i < 5; i++) { R(3 + i, 5 + i, 1, 1, c.o); R(12 - i, 5 + i, 1, 1, c.o) } R(7, 9, 2, 2, c.orange) },
  chat: (R, c) => { R(2, 3, 12, 8, c.o); R(3, 4, 10, 6, c.white); R(4, 11, 3, 1, c.o); R(4, 12, 2, 1, c.o); R(4, 13, 1, 1, c.o); R(4, 6, 2, 2, c.sky); R(7, 6, 2, 2, c.orange); R(10, 6, 2, 2, c.sky) },
  briefcase: (R, c) => { R(6, 2, 4, 1, c.o); R(5, 3, 1, 2, c.o); R(10, 3, 1, 2, c.o); R(2, 5, 12, 8, c.o); R(3, 6, 10, 6, c.orange); R(3, 8, 10, 1, c.o); R(7, 8, 2, 2, c.white) },
  terminal: (R, c) => { R(1, 3, 14, 10, c.o); R(2, 4, 12, 8, c.dark); R(2, 4, 12, 2, c.sky); R(4, 8, 1, 1, c.white); R(5, 9, 1, 1, c.white); R(4, 10, 1, 1, c.white); R(7, 10, 3, 1, c.orange) },
  code: (R, c) => {
    for (const [x, y] of [[5, 4], [4, 5], [3, 6], [2, 7], [3, 8], [4, 9], [5, 10]]) { R(x, y, 2, 2, c.sky); R(14 - x, y, 2, 2, c.sky) }
    for (const [x, y] of [[9, 3], [8, 5], [8, 7], [7, 9], [7, 11]]) R(x, y, 1, 2, c.orange)
  },
  heart: (R, c) => {
    const rows = ['.oo...oo.', 'orro.orro', 'orwrorrro', 'orrrrrrro', '.orrrrro.', '..orrro..', '...oro...', '....o....']
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') R(x + 3, y + 4, 1, 1, ch === 'o' ? c.o : ch === 'w' ? c.white : '#E2543E') }))
  },
}

export function iconSprite(kind, theme) {
  const [c, ctx] = make(16, 16)
  const col = {
    o: theme === 'dark' ? '#F4F7FC' : '#10131A', // outline
    sky: '#75CFFF', orange: '#FFB47A', white: theme === 'dark' ? '#10131A' : '#FFFFFF',
    grey: '#5B6676', light: '#C9CED6', dark: '#10131A',
  }
  if (kind === 'code' && theme === 'light') { col.sky = '#0A6EA8'; col.orange = '#B4551A' }
  ICONS[kind]((x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h) }, col)
  return c.toDataURL()
}
