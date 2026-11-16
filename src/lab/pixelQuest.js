// PIXEL QUEST — an original 8-bit title screen, drawn procedurally at 256x224.
import { drawMascot, drawText, rng } from '../lib/pixel.js'

export const GAME_W = 256
export const GAME_H = 224

const SKY = ['#0B1030', '#141A4A', '#1F2366', '#34307F', '#553A8C', '#874C8F', '#C4667F']
const stars = (() => {
  const r = rng(7)
  return Array.from({ length: 46 }, () => ({ x: Math.floor(r() * GAME_W), y: Math.floor(r() * 110), p: r() * 6 }))
})()

function ridge(x, seed, amp, base) {
  return Math.round(base - amp * (0.5 + 0.5 * Math.sin(x * 0.045 + seed)) - amp * 0.35 * Math.sin(x * 0.13 + seed * 2.1))
}

function scenery(ctx, t) {
  // banded sky
  const band = 140 / SKY.length
  SKY.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, Math.round(i * band), GAME_W, Math.ceil(band) + 1) })
  // dither between bands
  for (let i = 1; i < SKY.length; i++) {
    ctx.fillStyle = SKY[i]
    const y = Math.round(i * band) - 2
    for (let x = i % 2; x < GAME_W; x += 2) ctx.fillRect(x, y, 1, 1)
  }
  for (const s of stars) {
    if (Math.sin(t * 2 + s.p) > -0.4) { ctx.fillStyle = '#F4F7FC'; ctx.fillRect(s.x, s.y, 1, 1) }
  }
  // moon
  ctx.fillStyle = '#FCE9C8'
  for (let y = -11; y <= 11; y++) {
    const w = Math.round(Math.sqrt(121 - y * y))
    ctx.fillRect(214 - w, 30 + y, w * 2, 1)
  }
  ctx.fillStyle = '#E3C79A'; ctx.fillRect(208, 26, 4, 3); ctx.fillRect(218, 34, 3, 3); ctx.fillRect(211, 36, 2, 2)
  // far and near mountains
  for (let x = 0; x < GAME_W; x++) {
    const a = ridge(x, 1.3, 34, 150)
    ctx.fillStyle = '#2A2460'; ctx.fillRect(x, a, 1, 190 - a)
    const b = ridge(x, 4.1, 26, 172)
    ctx.fillStyle = '#17153F'; ctx.fillRect(x, b, 1, 190 - b)
  }
  // castle on the right
  ctx.fillStyle = '#0D0C2A'
  ctx.fillRect(196, 136, 44, 44); ctx.fillRect(190, 124, 12, 56); ctx.fillRect(234, 124, 12, 56); ctx.fillRect(212, 112, 12, 30)
  for (const x of [190, 195, 200, 234, 239, 244]) ctx.fillRect(x, 120, 3, 4)
  for (const x of [212, 217, 222]) ctx.fillRect(x, 108, 3, 4)
  ctx.fillStyle = '#FFB47A'
  ctx.fillRect(216, 120, 3, 5); ctx.fillRect(194, 134, 3, 5); ctx.fillRect(238, 134, 3, 5)
  ctx.fillStyle = '#17153F'; ctx.fillRect(213, 160, 10, 20)
  // ground: grass + bricks
  ctx.fillStyle = '#3BA55D'; ctx.fillRect(0, 180, GAME_W, 4)
  ctx.fillStyle = '#2B7A45'
  for (let x = 0; x < GAME_W; x += 4) ctx.fillRect(x + ((x / 4) % 2), 183, 2, 2)
  ctx.fillStyle = '#7A4A2A'; ctx.fillRect(0, 186, GAME_W, 38)
  ctx.fillStyle = '#4E2D18'
  for (let y = 0; y < 5; y++) {
    ctx.fillRect(0, 186 + y * 8, GAME_W, 1)
    for (let x = (y % 2) * 8; x < GAME_W; x += 16) ctx.fillRect(x, 186 + y * 8, 1, 8)
  }
}

function title(ctx, t) {
  scenery(ctx, t)
  const bob = Math.round(Math.sin(t * 3) * 1)
  drawText(ctx, 'PIXEL', GAME_W / 2, 22, { scale: 5, color: '#75CFFF', align: 'center', shadow: '#12306B' })
  drawText(ctx, 'QUEST', GAME_W / 2, 64, { scale: 5, color: '#FFB47A', align: 'center', shadow: '#7A2E12' })
  // highlight sweep across the logo
  const sx = ((t * 70) % 420) - 80
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  for (let y = 22; y < 99; y += 1) {
    const x = Math.round(sx + (99 - y) * 0.5)
    const d = ctx.getImageData(Math.max(0, Math.min(GAME_W - 1, x)), y, 1, 1).data
    if ((d[0] === 0x75 && d[1] === 0xcf) || (d[0] === 0xff && d[1] === 0xb4)) ctx.fillRect(x, y, 2, 1)
  }
  drawText(ctx, 'THE 8-BIT ADVENTURE', GAME_W / 2, 106, { color: '#F4F7FC', align: 'center', shadow: '#0B1030' })
  if (Math.floor(t * 2) % 2 === 0) drawText(ctx, 'PRESS START', GAME_W / 2, 126, { color: '#FCE9C8', align: 'center', shadow: '#0B1030' })
  drawText(ctx, '> 1 PLAYER', 98, 142, { color: '#F4F7FC', shadow: '#0B1030' })
  drawText(ctx, '  2 PLAYERS', 98, 153, { color: '#A9A6D6', shadow: '#0B1030' })
  drawMascot(ctx, 36, 165 + bob, 1, { mood: Math.floor(t * 0.7) % 4 === 3 ? 'blink' : 'idle', look: [1, 0] })
  // a slime that paces back and forth
  const px = 120 + Math.round(Math.sin(t * 0.8) * 26)
  const squish = Math.floor(t * 4) % 2
  ctx.fillStyle = '#B98CFF'; ctx.fillRect(px + 1, 174 + squish, 8, 6 - squish); ctx.fillRect(px, 176 + squish, 10, 4 - squish)
  ctx.fillStyle = '#10131A'; ctx.fillRect(px + 2, 176 + squish, 2, 2); ctx.fillRect(px + 6, 176 + squish, 2, 2)
  drawText(ctx, '(C) 198X BANK.DEV', GAME_W / 2, 208, { color: '#F4F7FC', align: 'center', shadow: '#2A1608' })
}

function boot(ctx, k) {
  ctx.fillStyle = '#05060C'; ctx.fillRect(0, 0, GAME_W, GAME_H)
  if (k < 0.08) return
  // logo drops in, then settles
  const drop = Math.min(1, (k - 0.08) / 0.3)
  const y = Math.round(-40 + (1 - Math.pow(1 - drop, 3)) * 118)
  const cycle = ['#75CFFF', '#A5E1FF', '#FFB47A', '#F4F7FC']
  const col = drop < 1 ? cycle[Math.floor(k * 40) % 4] : '#75CFFF'
  drawText(ctx, 'BK-8', GAME_W / 2, y, { scale: 6, color: col, align: 'center', shadow: '#12306B' })
  if (k > 0.42) drawText(ctx, 'ENTERTAINMENT COMPUTER', GAME_W / 2, 130, { color: '#F4F7FC', align: 'center' })
  if (k > 0.52) {
    const n = Math.min(12, Math.floor((k - 0.52) / 0.03))
    ctx.fillStyle = '#263447'; ctx.fillRect(80, 152, 96, 6)
    ctx.fillStyle = '#FFB47A'; ctx.fillRect(80, 152, n * 8, 6)
    drawText(ctx, n >= 12 ? 'RAM OK  2K' : 'CHECKING RAM', GAME_W / 2, 166, { color: '#9BA9BA', align: 'center' })
  }
  if (k > 0.92) { ctx.fillStyle = `rgba(255,255,255,${(k - 0.92) / 0.08})`; ctx.fillRect(0, 0, GAME_W, GAME_H) }
}

function glitch(ctx, amount) {
  const r = rng(99)
  const n = Math.floor(amount * 14)
  for (let i = 0; i < n; i++) {
    const y = Math.floor(r() * (GAME_H - 8))
    const h = 2 + Math.floor(r() * 8)
    const shift = Math.floor((r() - 0.5) * 60)
    ctx.drawImage(ctx.canvas, 0, y, GAME_W, h, shift, y, GAME_W, h)
  }
  const cols = ['#FFB47A', '#75CFFF', '#F4F7FC', '#C8452C']
  for (let i = 0; i < n * 2; i++) {
    ctx.fillStyle = cols[Math.floor(r() * cols.length)]
    ctx.fillRect(Math.floor(r() * 32) * 8, Math.floor(r() * 28) * 8, 8, 8)
  }
}

/**
 * @param state { mode: 'off' | 'boot' | 'title', bootT: 0..1, time: seconds, glitch: 0..1 }
 */
export function drawGame(ctx, state) {
  ctx.imageSmoothingEnabled = false
  if (state.mode === 'off') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, GAME_W, GAME_H); return }
  if (state.mode === 'boot') { boot(ctx, state.bootT); return }
  title(ctx, state.time)
  if (state.glitch > 0) glitch(ctx, state.glitch)
}

// Static art for the game box and cartridge label, built from the same pieces.
export function drawCoverArt(ctx, w, h, { compact = false } = {}) {
  ctx.imageSmoothingEnabled = false
  const tmp = document.createElement('canvas')
  tmp.width = GAME_W; tmp.height = GAME_H
  const tc = tmp.getContext('2d', { willReadFrequently: true })
  scenery(tc, 1.2)
  ctx.fillStyle = '#0B1030'; ctx.fillRect(0, 0, w, h)
  if (compact) {
    // cartridge label
    ctx.drawImage(tmp, 20, 60, 216, 130, 0, 0, w, h)
    ctx.fillStyle = 'rgba(11,16,48,0.55)'; ctx.fillRect(0, 0, w, h)
    const s = Math.floor(w / 80)
    drawText(ctx, 'PIXEL', w / 2, h * 0.14, { scale: s * 2, color: '#75CFFF', align: 'center', shadow: '#12306B' })
    drawText(ctx, 'QUEST', w / 2, h * 0.14 + s * 17, { scale: s * 2, color: '#FFB47A', align: 'center', shadow: '#7A2E12' })
    drawText(ctx, 'FOR BK-8', w / 2, h - s * 11, { scale: s, color: '#F4F7FC', align: 'center' })
    ctx.strokeStyle = '#F4F7FC'; ctx.lineWidth = s; ctx.strokeRect(s, s, w - 2 * s, h - 2 * s)
    return
  }
  // box front: scenery fills the lower two thirds
  const s = Math.floor(w / 128)
  const artH = Math.round(h * 0.62)
  ctx.drawImage(tmp, 28, 40, 200, 184, 0, h - artH, w, artH)
  drawMascot(ctx, Math.round(w * 0.14), h - artH + Math.round(artH * 0.41), s * 3, { mood: 'happy' })
  // title block
  ctx.fillStyle = '#0B1030'; ctx.fillRect(0, 0, w, h - artH)
  ctx.fillStyle = '#FFB47A'; ctx.fillRect(0, h - artH, w, s * 2)
  drawText(ctx, 'PIXEL', w / 2, s * 22, { scale: s * 3, color: '#75CFFF', align: 'center', shadow: '#12306B' })
  drawText(ctx, 'QUEST', w / 2, s * 48, { scale: s * 3, color: '#FFB47A', align: 'center', shadow: '#7A2E12' })
  drawText(ctx, 'THE 8-BIT ADVENTURE', w / 2, s * 76, { scale: s, color: '#F4F7FC', align: 'center' })
  // top strip + seal
  ctx.fillStyle = '#F4F7FC'; ctx.fillRect(0, 0, w, s * 13)
  drawText(ctx, 'BK-8', s * 5, s * 3, { scale: s, color: '#0B1030' })
  drawText(ctx, '1-2 PLAYERS', w - s * 5, s * 3, { scale: s, color: '#0B1030', align: 'right' })
  drawText(ctx, 'BANK.DEV', w - s * 5, h - s * 11, { scale: s, color: '#F4F7FC', align: 'right', shadow: '#2A1608' })
}
