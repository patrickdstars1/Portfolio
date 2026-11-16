// Layered pixel-art landscape (the PIXEL QUEST world) with scroll parallax.
// Night scene in the dark theme, day scene in the light theme.
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'
import { Parallax } from './Parallax.jsx'
import { bushSprite, castleSprite, flowerSprite, groundTile, lampSprite, orbSprite, ridgeTile, signSprite, skyTile, slimeSprite, TILE, treeSprite } from '../lib/pixelScene.js'
import Critters from './Critters.jsx'
import Mascot from './Mascot.jsx'

export function usePixelScale() {
  const get = () => (window.innerWidth < 640 ? 3 : window.innerWidth < 1536 ? 4 : 5)
  const [s, setS] = useState(get)
  useEffect(() => {
    const on = () => setS(get())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

const tile = (url, S, h) => ({
  backgroundImage: `url(${url})`,
  backgroundRepeat: 'repeat-x',
  backgroundPosition: 'left bottom',
  backgroundSize: `${TILE * S}px ${h * S}px`,
})

// Every few seconds a pixel meteor crosses the night sky.
function ShootingStars({ px }) {
  const [stars, setStars] = useState([])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let id = 0, timer
    const spawn = () => {
      if (!document.hidden) {
        const star = { id: ++id, left: 30 + Math.random() * 65, top: Math.random() * 28, travel: 160 + Math.random() * 200, dur: 0.9 + Math.random() * 0.6 }
        setStars((s) => [...s.slice(-3), star])
      }
      timer = setTimeout(spawn, 2600 + Math.random() * 4200)
    }
    timer = setTimeout(spawn, 1200)
    return () => clearTimeout(timer)
  }, [])
  return stars.map((s) => (
    <span
      key={s.id}
      className="shooting-star"
      style={{ left: `${s.left}%`, top: `${s.top}%`, '--px': `${px}px`, '--travel': `${s.travel}px`, '--dur': `${s.dur}s` }}
      onAnimationEnd={() => setStars((list) => list.filter((x) => x.id !== s.id))}
    />
  ))
}

/** variant "hero": full scene with sky objects. variant "footer": ground, hills and characters only. */
export default function PixelScene({ variant = 'hero' }) {
  const { theme } = useTheme()
  const S = usePixelScale()
  const art = useMemo(() => ({
    sky: skyTile(theme),
    far: ridgeTile(theme, 'far', 110, 1.3),
    near: ridgeTile(theme, 'near', 80, 4.1),
    ground: groundTile(theme),
    castle: castleSprite(theme),
    orb: orbSprite(theme),
    tree: treeSprite(theme),
    slime: slimeSprite(),
    sign: signSprite(),
    bush: bushSprite(theme),
    lamp: lampSprite(theme),
    flowers: [0, 1, 2].map(flowerSprite),
  }), [theme])
  const G = 40 * S // ground height
  const hero = variant === 'hero'

  return (
    <>
    <div aria-hidden="true" className="pixelated pointer-events-none absolute inset-0 overflow-hidden">
      {hero && (
        <>
          {/* stars / clouds drift slowly and barely move with scroll */}
          <Parallax speed={0.55} className="absolute inset-x-0 top-0 h-[70%]">
            <div className="h-full w-full" style={{ ...tile(art.sky, S, 160), backgroundPosition: 'left top', '--tile': `${TILE * S}px`, animation: theme === 'light' ? 'drift 90s linear infinite' : undefined }} />
          </Parallax>
          {theme === 'dark' && <ShootingStars px={S} />}
          <Parallax speed={0.45} className="absolute right-[12%] top-[16%] sm:right-[16%]">
            <img src={art.orb} alt="" width={28 * S} height={28 * S} className="pixelated block" />
          </Parallax>
        </>
      )}
      <Parallax speed={hero ? 0.34 : 0.12} className="absolute inset-x-0" style={{ bottom: G - S * 2, height: 110 * S }}>
        <div className="h-full w-full" style={tile(art.far, S, 110)} />
      </Parallax>
      <Parallax speed={hero ? 0.2 : 0.06} className="absolute inset-x-0" style={{ bottom: G - S * 2, height: 80 * S }}>
        <div className="h-full w-full" style={tile(art.near, S, 80)} />
      </Parallax>
      <Parallax speed={hero ? 0.1 : 0.03} className="absolute inset-x-0" style={{ bottom: G - S * 2, height: 76 * S }}>
        <img src={art.castle} alt="" width={60 * S} height={76 * S} className="pixelated absolute bottom-0 right-[6%] block sm:right-[10%]" />
        <img src={art.tree} alt="" width={18 * S} height={30 * S} className="pixelated absolute bottom-0 left-[4%] block" />
        <img src={art.tree} alt="" width={18 * S} height={30 * S} className="pixelated absolute bottom-0 left-[38%] hidden sm:block" />
        <img src={art.tree} alt="" width={18 * S} height={30 * S} className="pixelated absolute bottom-0 right-[30%] block" />
      </Parallax>
      {/* ground moves with the page */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: G, backgroundImage: `url(${art.ground})`, backgroundSize: `${32 * S}px ${40 * S}px`, backgroundRepeat: 'repeat-x' }} />
      {hero ? (
        <>
          {/* props standing on the ground */}
          <img src={art.sign.url} alt="" width={art.sign.w * S} height={art.sign.h * S} className="pixelated absolute left-[14%] block sm:left-[20%]" style={{ bottom: G - S }} />
          <img src={art.lamp.url} alt="" width={art.lamp.w * S} height={art.lamp.h * S} className="pixelated absolute left-[52%] hidden sm:block" style={{ bottom: G - S }} />
          <img src={art.bush.url} alt="" width={art.bush.w * S} height={art.bush.h * S} className="pixelated absolute left-[2%] block" style={{ bottom: G - S }} />
          <img src={art.bush.url} alt="" width={art.bush.w * S} height={art.bush.h * S} className="pixelated absolute left-[74%] block" style={{ bottom: G - S }} />
          {[8, 33, 45, 67, 88].map((left, i) => (
            <img key={left} src={art.flowers[i % 3].url} alt="" width={3 * S} height={6 * S} className="pixelated absolute block" style={{ left: `${left}%`, bottom: G - S }} />
          ))}
        </>
      ) : (
        <img src={art.slime} alt="" width={10 * S} height={8 * S} className="pixelated absolute left-[62%] block" style={{ bottom: G - S, animation: 'bob 0.9s steps(2) infinite' }} />
      )}
    </div>
    {hero && <Critters scale={S} ground={G} />}
    {/* the mascot sits above the page content so it can be clicked */}
    <Mascot scale={S} bottom={G - S} start={hero ? 0.12 : 0.3} />
    </>
  )
}
