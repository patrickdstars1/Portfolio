// Achievement UI: a tracker for section visits, pop-up toasts, and the trophy
// panel opened from the navbar.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { ACHIEVEMENTS, getState, mark, onUnlock, resetAchievements, subscribe, visit } from '../lib/achievements.js'
import { iconSprite } from '../lib/pixelScene.js'
import { isEmbed } from '../lib/scroll.js'
import { sfx } from '../lib/sound.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useTheme } from '../hooks/useTheme.jsx'

const pixelFont = { fontFamily: "'Press Start 2P', monospace" }
export const useAchievements = () => useSyncExternalStore(subscribe, getState, getState)

function Icon({ kind, size = 32, dim = false }) {
  const { theme } = useTheme()
  const url = useMemo(() => iconSprite(kind, theme), [kind, theme])
  return <img src={url} alt="" width={size} height={size} className={`pixelated block shrink-0 ${dim ? 'opacity-25 grayscale' : ''}`} />
}

// Watches which sections have been seen, and the current language and theme.
function Tracker() {
  const { lang } = useLanguage()
  const { theme } = useTheme()
  useEffect(() => { mark(`lang_${lang}`) }, [lang])
  useEffect(() => { mark(`theme_${theme}`) }, [theme])
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) visit(e.target.id)
    }, { rootMargin: '-40% 0px -40% 0px' })
    document.querySelectorAll('main section[id]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}

// One toast at a time; the rest wait in a queue.
function Toasts() {
  const { t, pick } = useLanguage()
  const [queue, setQueue] = useState([])
  useEffect(() => onUnlock((id) => setQueue((q) => [...q, id])), [])
  const current = queue[0]
  // when several unlock at once, move through them faster
  const duration = queue.length > 1 ? 1900 : 3400
  useEffect(() => {
    if (!current) return
    sfx.achieve()
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), duration)
    return () => clearTimeout(timer)
  }, [current]) // eslint-disable-line react-hooks/exhaustive-deps
  const a = ACHIEVEMENTS.find((x) => x.id === current)
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[150] w-[min(92vw,22rem)] -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0">
      {a && (
        <div key={a.id} style={{ animationDuration: `${duration}ms` }} className="toast-in flex items-center gap-3.5 border-[3px] border-[#F4F7FC] bg-[#10131A] p-3.5 text-[#F4F7FC] shadow-[5px_5px_0_0_#000]">
          <span className="grid h-12 w-12 shrink-0 place-items-center border-2 border-[#FFB47A] bg-[#080B12]"><Icon kind={a.icon} /></span>
          <span className="min-w-0">
            <span className="block text-[8px] leading-none text-[#FFB47A]" style={pixelFont} lang="en">{t.achievements.unlockedToast}</span>
            <span className="mt-2 block truncate font-display text-lg font-semibold leading-tight">{pick(a.title)}</span>
            <span className="block truncate text-xs text-[#9BA9BA]">{pick(a.desc)}</span>
          </span>
        </div>
      )}
    </div>
  )
}

// Mounted once in App.
export function AchievementLayer() {
  if (isEmbed()) return null
  return <><Tracker /><Toasts /></>
}

// 11x11 trophy for the navbar button.
const TROPHY = ['...........', '.#########.', '###########', '#.#######.#', '#.#######.#', '.#.#####.#.', '...#####...', '....###....', '.....#.....', '....###....', '..#######..']

export function AchievementsButton() {
  const { t, pick } = useLanguage()
  const A = t.achievements
  const state = useAchievements()
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)
  const count = ACHIEVEMENTS.filter((a) => state.unlocked[a.id]).length

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (isEmbed()) return null
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${A.title}: ${count}/${ACHIEVEMENTS.length}`}
        title={A.title}
        className="relative flex h-9 shrink-0 items-center gap-1.5 border-2 border-line px-2 text-orange transition-colors hover:border-orange"
      >
        <svg viewBox="0 0 11 11" className="h-[16px] w-[16px]" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true">
          {TROPHY.flatMap((row, y) => [...row].map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
        </svg>
        <span className="text-[9px] leading-none text-ink" style={pixelFont}>{count}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[160] grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="ach-title" onClick={(e) => e.stopPropagation()} data-lenis-prevent
            className="flex max-h-[86svh] w-full max-w-2xl flex-col border-4 border-line bg-bg text-ink shadow-[8px_8px_0_0_var(--shadow)]">
            <div className="flex items-center justify-between gap-4 border-b-4 border-line px-5 py-4">
              <div>
                <h2 id="ach-title" className="font-display text-2xl font-semibold">{A.title}</h2>
                <p className="mt-1.5 text-[9px] leading-none text-orange" style={pixelFont} lang="en">{count} / {ACHIEVEMENTS.length} · {A.coins} {state.coins}</p>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="px-btn bg-card px-3 py-2 text-sm">{A.close}</button>
            </div>
            {/* progress bar, one segment per achievement */}
            <div aria-hidden="true" className="flex gap-1 border-b-2 border-dashed border-line px-5 py-3">
              {ACHIEVEMENTS.map((a) => <span key={a.id} className={`h-2 flex-1 ${state.unlocked[a.id] ? 'bg-orange' : 'bg-line'}`} />)}
            </div>
            <ul className="grid gap-2 overflow-y-auto p-4 sm:grid-cols-2">
              {ACHIEVEMENTS.map((a) => {
                const got = !!state.unlocked[a.id]
                const hidden = a.secret && !got
                return (
                  <li key={a.id} className={`flex items-center gap-3 border-2 p-3 ${got ? 'border-orange bg-card' : 'border-line'}`}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-line bg-bg-2"><Icon kind={hidden ? 'lock' : a.icon} size={28} dim={!got} /></span>
                    <span className="min-w-0">
                      <span className={`block font-semibold leading-tight ${got ? '' : 'text-muted'}`}>{hidden ? '???' : pick(a.title)}</span>
                      <span className="block text-[13px] leading-snug text-muted">{hidden ? A.secret : pick(a.desc)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="border-t-2 border-dashed border-line px-5 py-3 text-right">
              <button type="button" onClick={resetAchievements} className="text-xs text-muted underline underline-offset-4 hover:text-orange">{A.reset}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
