// Layered pixel-art landscape (the PIXEL QUEST world) with scroll parallax.
// Night scene in the dark theme, day scene in the light theme.
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'
import { Parallax } from './Parallax.jsx'
import { castleSprite, groundTile, heroSprite, orbSprite, ridgeTile, skyTile, slimeSprite, TILE, treeSprite } from '../lib/pixelScene.js'

function usePixelScale() {
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
    hero: heroSprite(false),
    slime: slimeSprite(),
  }), [theme])
  const G = 40 * S // ground height
  const hero = variant === 'hero'

  return (
    <div aria-hidden="true" className="pixelated pointer-events-none absolute inset-0 overflow-hidden">
      {hero && (
        <>
          {/* stars / clouds drift slowly and barely move with scroll */}
          <Parallax speed={0.55} className="absolute inset-x-0 top-0 h-[70%]">
            <div className="h-full w-full" style={{ ...tile(art.sky, S, 160), backgroundPosition: 'left top', '--tile': `${TILE * S}px`, animation: theme === 'light' ? 'drift 90s linear infinite' : undefined }} />
          </Parallax>
          <Parallax speed={0.45} className="absolute right-[16%] top-[14%] hidden sm:block">
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
      <img src={art.hero} alt="" width={16 * S} height={16 * S} className="pixelated absolute left-[8%] block sm:left-[14%]" style={{ bottom: G - S, animation: 'bob 1.2s steps(2) infinite' }} />
      <img src={art.slime} alt="" width={10 * S} height={8 * S} className="pixelated absolute left-[46%] block" style={{ bottom: G - S, animation: 'bob 0.9s steps(2) infinite' }} />
    </div>
  )
}
