// Original 5x7 bitmap font + sprite helpers shared by PIXEL QUEST, the box art and the easter egg.
const G = {
  A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110',
  C: '01110100011000010000100001000101110', D: '11110100011000110001100011000111110',
  E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001',
  I: '01110001000010000100001000010001110', J: '00111000100001000010000101001001100',
  K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001', N: '10001110011010110011100011000110001',
  O: '01110100011000110001100011000101110', P: '11110100011000111110100001000010000',
  Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100',
  U: '10001100011000110001100011000101110', V: '10001100011000110001100010101000100',
  W: '10001100011000110101101011101110001', X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
  0: '01110100011001110101110011000101110', 1: '00100011000010000100001000010001110',
  2: '01110100010000100010001000100011111', 3: '11110000010000101110000010000111110',
  4: '00010001100101010010111110001000010', 5: '11111100001111000001000011000101110',
  6: '00110010001000011110100011000101110', 7: '11111000010001000100010000100001000',
  8: '01110100011000101110100011000101110', 9: '01110100011000101111000010001001100',
  '.': '00000000000000000000000000110001100', ',': '00000000000000000000011000010001000',
  '!': '00100001000010000100001000000000100', '?': '01110100010000100010001000000000100',
  '-': '00000000000000011111000000000000000', ':': '00000011000110000000011000110000000',
  "'": '00100001000100000000000000000000000', '/': '00001000010001000100010001000010000',
  '+': '00000001000010011111001000010000000', '(': '00010001000100001000010000010000010',
  ')': '01000001000001000010000100010001000', '>': '01000001000001000001000100010001000',
  '*': '00000101010111011111011101010100000', ' ': '00000000000000000000000000000000000',
}

export function textWidth(str, scale = 1) {
  return str.length * 6 * scale - scale
}

export function drawText(ctx, str, x, y, { scale = 1, color = '#fff', align = 'left', shadow = null } = {}) {
  str = String(str).toUpperCase()
  const w = textWidth(str, scale)
  let x0 = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? x - w : x
  const pass = (ox, oy, c) => {
    ctx.fillStyle = c
    let cx = x0 + ox
    for (const ch of str) {
      const g = G[ch] || G['?']
      for (let i = 0; i < 35; i++) {
        if (g[i] === '1') ctx.fillRect(cx + (i % 5) * scale, y + oy + Math.floor(i / 5) * scale, scale, scale)
      }
      cx += 6 * scale
    }
  }
  if (shadow) pass(scale, scale, shadow)
  pass(0, 0, color)
}

// "Byte", the site mascot: a 16x16 round orange critter with big eyes.
// '.' is transparent; the eyes and mouth are drawn separately so they can move.
const MASCOT_PAL = { b: '#FFB47A', B: '#E08A4E', h: '#FFE0C2', e: '#FFE0C2', o: '#FF7A8A', k: '#5A2E14', w: '#FFFFFF', p: '#10131A' }
const MASCOT_BODY = [
  '................',
  '..bb........bb..',
  '.bebb......bbeb.',
  '.bbbbbbbbbbbbbb.',
  '.bhhbbbbbbbbbbb.',
  'bbhbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'boobbbbbbbbbboob',
  'boobbbbbbbbbboob',
  'bbbbbbbbbbbbbbbb',
  '.BbbbbbbbbbbbbB.',
  '..BBBBBBBBBBBB..',
]
const MASCOT_FEET = ['..kkk......kkk..', '...kkk....kkk...']

/**
 * @param o.frame 0 | 1   walk frame
 * @param o.look  [x, y]  each 0 or 1: where the pupils sit inside the eyes
 * @param o.mood  'idle' | 'blink' | 'happy'
 */
export function drawMascot(ctx, x, y, scale = 1, { frame = 0, look = [1, 1], mood = 'idle' } = {}) {
  const px = (cx, cy, w, h, c) => { ctx.fillStyle = MASCOT_PAL[c]; ctx.fillRect(x + cx * scale, y + cy * scale, w * scale, h * scale) }
  const rows = [...MASCOT_BODY, MASCOT_FEET[frame ? 1 : 0]]
  rows.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] !== '.') px(rx, ry, 1, 1, row[rx]) })
  for (const ex of [3, 10]) {
    if (mood === 'happy') { px(ex, 8, 1, 1, 'p'); px(ex + 1, 7, 1, 1, 'p'); px(ex + 2, 8, 1, 1, 'p') } // ^ ^
    else if (mood === 'blink') px(ex, 8, 3, 1, 'p')
    else { px(ex, 6, 3, 3, 'w'); px(ex + (look[0] ? 1 : 0), 6 + (look[1] ? 1 : 0), 2, 2, 'p') }
  }
  if (mood === 'happy') { px(7, 10, 2, 1, 'p'); px(7, 11, 2, 1, 'o') } // open mouth
  else px(7, 10, 2, 1, 'p')
}

// Small deterministic RNG so procedural art is identical on every load.
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
