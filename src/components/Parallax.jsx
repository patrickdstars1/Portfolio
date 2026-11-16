import { useEffect, useMemo, useRef } from 'react'
import { registerParallax } from '../lib/parallax.js'
import { iconSprite } from '../lib/pixelScene.js'
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

// Item box beside a section: a pixel icon in a framed tile that floats and
// drifts at its own parallax speed. Icons: chip, floppy, cartridge, gamepad,
// mail, chat, briefcase, terminal, code, heart.
export function Deco({ kind, speed = 0.25, className = '', delay = 0, tilt = 0 }) {
  const { theme } = useTheme()
  const url = useMemo(() => iconSprite(kind, theme), [kind, theme])
  return (
    <Parallax speed={speed} className={`pointer-events-none absolute hidden xl:block ${className}`}>
      <div style={{ transform: `rotate(${tilt}deg)` }}>
        <div className="item-box grid h-[76px] w-[76px] place-items-center border-[3px] border-line bg-card shadow-[5px_5px_0_0_var(--shadow)]" style={{ animationDelay: `${delay}s` }}>
          <img src={url} alt="" width={48} height={48} className="pixelated block" />
        </div>
      </div>
    </Parallax>
  )
}
