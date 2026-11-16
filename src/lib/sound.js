// All sound effects are synthesised with WebAudio: no audio files to load.
const KEY = 'bankdev:sound'
let ctx = null
let enabled = true
try { enabled = localStorage.getItem(KEY) !== 'off' } catch {}
const listeners = new Set()

export const isSoundEnabled = () => enabled
export function setSoundEnabled(v) {
  enabled = !!v
  try { localStorage.setItem(KEY, enabled ? 'on' : 'off') } catch {}
  listeners.forEach((fn) => fn(enabled))
}
export function onSoundChange(fn) { listeners.add(fn); return () => listeners.delete(fn) }

function audio() {
  if (!enabled) return null
  // Browsers block audio before the first click/tap/key press.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}

function tone(ac, { type = 'square', from, to = from, start = 0, dur = 0.1, gain = 0.06 }) {
  const t0 = ac.currentTime + start
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(ac, { start = 0, dur = 0.05, gain = 0.1, freq = 2000, q = 1 }) {
  const t0 = ac.currentTime + start
  const len = Math.max(1, Math.floor(ac.sampleRate * dur))
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ac.createBufferSource()
  src.buffer = buf
  const f = ac.createBiquadFilter()
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q
  const g = ac.createGain(); g.gain.value = gain
  src.connect(f).connect(g).connect(ac.destination)
  src.start(t0)
}

export const sfx = {
  // light plastic click (a part unclipping / seating)
  click() { const ac = audio(); if (!ac) return; noise(ac, { dur: 0.03, gain: 0.16, freq: 3200, q: 2 }); tone(ac, { type: 'triangle', from: 900, to: 500, dur: 0.04, gain: 0.03 }) },
  // softer contact (connector mating)
  connect() { const ac = audio(); if (!ac) return; noise(ac, { dur: 0.05, gain: 0.1, freq: 1400, q: 1.2 }); tone(ac, { type: 'sine', from: 420, to: 260, dur: 0.07, gain: 0.04 }) },
  // casing lock: two-stage clunk
  lock() { const ac = audio(); if (!ac) return; noise(ac, { dur: 0.06, gain: 0.2, freq: 700, q: 0.8 }); tone(ac, { type: 'sine', from: 160, to: 70, dur: 0.14, gain: 0.12 }); noise(ac, { start: 0.09, dur: 0.04, gain: 0.16, freq: 2600, q: 2 }) },
  // mechanical power switch
  switch() { const ac = audio(); if (!ac) return; noise(ac, { dur: 0.04, gain: 0.2, freq: 1800, q: 1 }); tone(ac, { type: 'sine', from: 220, to: 90, dur: 0.08, gain: 0.1 }) },
  // CRT degauss thump + rising whine
  crtOn() { const ac = audio(); if (!ac) return; tone(ac, { type: 'sine', from: 70, to: 45, dur: 0.35, gain: 0.14 }); tone(ac, { type: 'sine', from: 3000, to: 9000, start: 0.05, dur: 0.5, gain: 0.006 }) },
  crtOff() { const ac = audio(); if (!ac) return; tone(ac, { type: 'sawtooth', from: 900, to: 40, dur: 0.4, gain: 0.04 }); noise(ac, { dur: 0.08, gain: 0.08, freq: 500 }) },
  // original 8-bit boot jingle
  boot() { const ac = audio(); if (!ac) return; [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, { from: f, start: i * 0.09, dur: 0.12, gain: 0.05 })); tone(ac, { type: 'triangle', from: 130.81, start: 0, dur: 0.5, gain: 0.07 }) },
  // final assembly: warm resolved chord
  complete() { const ac = audio(); if (!ac) return; [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(ac, { type: 'triangle', from: f, start: i * 0.05, dur: 0.6, gain: 0.05 })) },
  // console bursting apart: a clatter of plastic and metal
  crash() { const ac = audio(); if (!ac) return; noise(ac, { dur: 0.22, gain: 0.26, freq: 900, q: 0.6 }); for (let i = 0; i < 6; i++) noise(ac, { start: 0.05 + i * 0.07, dur: 0.04, gain: 0.14, freq: 1400 + i * 420, q: 2 }); tone(ac, { type: 'sine', from: 140, to: 50, dur: 0.2, gain: 0.12 }) },
  // mascot chirp
  blip() { const ac = audio(); if (!ac) return; tone(ac, { from: 660, to: 990, dur: 0.07, gain: 0.05 }); tone(ac, { from: 990, to: 1320, start: 0.07, dur: 0.09, gain: 0.05 }) },
  // Konami easter egg fanfare
  secret() { const ac = audio(); if (!ac) return; [523.25, 659.25, 783.99, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(ac, { from: f, start: i * 0.075, dur: 0.1, gain: 0.05 })) },
}
