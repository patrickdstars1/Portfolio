import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'

// Minimal pixel icons, drawn on an 11x11 grid.
const MOON = ['....####...', '..####.....', '.####......', '.###.......', '####.......', '####.......', '####.......', '.####....#.', '.#########.', '..#######..', '....###....']
const SUN = ['.....#.....', '.#...#...#.', '..#.....#..', '....###....', '...#####...', '##.#####.##', '...#####...', '....###....', '..#.....#..', '.#...#...#.', '.....#.....']

function PixelIcon({ rows }) {
  return (
    <svg viewBox="0 0 11 11" className="h-[18px] w-[18px]" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
      {rows.flatMap((row, y) => [...row].map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
  )
}

// Black button, white symbol: sun while the light theme is on, moon while dark is on.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()
  const label = theme === 'dark' ? t.theme.toLight : t.theme.toDark
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center border-2 border-white/40 bg-black text-white transition-transform hover:translate-y-0.5 active:translate-y-1"
    >
      <PixelIcon rows={theme === 'dark' ? MOON : SUN} />
    </button>
  )
}
