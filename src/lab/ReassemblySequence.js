// Sound cues tied to scroll progress. Each cue fires when progress crosses its
// threshold; reassembly cues only fire scrolling forward, so nothing double-plays.
import { sfx } from '../lib/sound.js'
import { disWindow, PART_IDS, reWindow, TL } from './ExplodedView.js'

export function createSequenceSounds() {
  const cues = []
  PART_IDS.forEach((id, i) => {
    const [a] = disWindow(i)
    cues.push({ p: a + 0.002, dir: 0, play: i === 0 || i === 10 ? sfx.lock : sfx.click })
    const [c, d] = reWindow(i)
    const seat = c + (d - c) * 0.85
    // connectors and socketed chips mate softly; plastics click; the top case locks
    const soft = ['cartSlot', 'cpu', 'gpu', 'ram', 'ports'].includes(id)
    cues.push({ p: seat, dir: 1, play: i === 0 ? sfx.lock : soft ? sfx.connect : sfx.click })
  })
  cues.push({ p: TL.collapse, dir: 1, play: sfx.crtOff })
  cues.push({ p: TL.off, dir: 1, play: sfx.switch })
  cues.push({ p: TL.reEnd + 0.004, dir: 1, play: sfx.complete })
  cues.push({ p: TL.on - 0.004, dir: 1, play: sfx.connect }) // cartridge seats
  cues.push({ p: TL.on, dir: 1, play: () => { sfx.switch(); sfx.crtOn() } })
  cues.push({ p: TL.bootStart, dir: 1, play: sfx.boot })

  let prev = 0
  return (p) => {
    if (Math.abs(p - prev) < 0.2) { // ignore jumps (e.g. "start over")
      for (const c of cues) {
        if (prev < c.p && p >= c.p) c.play()
        else if (c.dir === 0 && prev > c.p && p <= c.p) c.play()
      }
    }
    prev = p
  }
}
