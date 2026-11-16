import { useEffect, useMemo, useRef } from 'react'
import { registerParallax } from '../lib/parallax.js'
import { decoSprite } from '../lib/pixelScene.js'
import { useTheme } from '../hooks/useTheme.jsx'

// Wraps children in a layer that scrolls at a different speed from the page.
// speed > 0: lags behind (looks further away). speed < 0: moves ahead (looks closer).
export function Parallax({ speed = 0.2, className = '', style, children }) {
  const anchor = useRef(null)
  const inner = useRef(null)
  useEffect(() => registerParallax(inner.current, anchor.current, speed), [speed])
  return (
    <div ref={anchor} className={className} style={style} aria-hidden="true">
      <div ref={inner} className="h-full w-full will-change-transform">{children}</div>
    </div>
  )
}

// Floating pixel decoration (coin, heart, star, block, cloud) with its own parallax speed.
export function Deco({ kind, scale = 4, speed = 0.3, className = '', bob = false }) {
  const { theme } = useTheme()
  const s = useMemo(() => decoSprite(kind, theme), [kind, theme])
  return (
    <Parallax speed={speed} className={`pointer-events-none absolute hidden xl:block ${className}`}>
      <img src={s.url} alt="" width={s.w * scale} height={s.h * scale} className="pixelated block" style={bob ? { animation: 'bob 2.4s steps(4) infinite' } : undefined} />
    </Parallax>
  )
}
