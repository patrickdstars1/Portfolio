import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { sfx } from '../lib/sound.js'
import { drawText, HERO_SPRITE, drawSprite } from '../lib/pixel.js'

const SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export default function KonamiEgg() {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const canvasRef = useRef(null)
  const closeRef = useRef(null)

  // Listen passively: never preventDefault, and ignore typing in form fields.
  useEffect(() => {
    let pos = 0
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) { pos = 0; return }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      pos = key === SEQ[pos] ? pos + 1 : key === SEQ[0] ? 1 : 0
      if (pos === SEQ.length) { pos = 0; setOpen(true); sfx.secret() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)

    // Short pixel animation: the hero runs in while confetti blocks rain down.
    const ctx = canvasRef.current.getContext('2d')
    const W = 160, H = 72
    const bits = Array.from({ length: 46 }, (_, i) => ({ x: (i * 37) % W, y: -((i * 53) % 90), s: 0.6 + ((i * 7) % 5) / 5, c: ['#75CFFF', '#FFB47A', '#F4F7FC'][i % 3] }))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const start = performance.now()
    const frame = (now) => {
      const tt = reduced ? 3 : (now - start) / 1000
      ctx.fillStyle = '#080B12'; ctx.fillRect(0, 0, W, H)
      for (const b of bits) { ctx.fillStyle = b.c; ctx.fillRect(b.x, ((b.y + tt * 40 * b.s) % (H + 90)) - 10, 2, 2) }
      drawText(ctx, t.konami.title, W / 2, 10, { scale: 1, color: '#FFB47A', align: 'center' })
      const x = Math.min(W / 2 - 8, -16 + tt * 60)
      const hop = x >= W / 2 - 8 ? Math.abs(Math.sin(tt * 6)) * 6 : 0
      drawSprite(ctx, HERO_SPRITE, Math.round(x), Math.round(38 - hop), 1, Math.floor(tt * 8) % 2 === 1 && hop === 0)
      ctx.fillStyle = '#263447'; ctx.fillRect(0, 56, W, 2)
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(raf) }
  }, [open, t])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-5" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="konami-title" onClick={(e) => e.stopPropagation()} className="w-full max-w-md border-4 border-[#75CFFF] bg-[#080B12] p-5 shadow-[8px_8px_0_0_#000] text-center text-[#F4F7FC]">
        <canvas ref={canvasRef} width={160} height={72} className="pixelated w-full rounded" aria-hidden="true" />
        <h2 id="konami-title" className="mt-5 text-xs text-[#FFB47A]" style={{ fontFamily: "'Press Start 2P', monospace" }}>{t.konami.title}</h2>
        <p className="mt-3 text-lg">{t.konami.message}</p>
        <p className="mt-1 text-sm text-[#9BA9BA]">{t.konami.sub}</p>
        <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="mt-5 border-[3px] border-white bg-[#75CFFF] px-5 py-2.5 font-mono text-sm font-semibold text-[#06202F] shadow-[4px_4px_0_0_#000]">
          {t.konami.close}
        </button>
      </div>
    </div>
  )
}
