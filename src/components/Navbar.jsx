import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import { scrollToId } from '../lib/scroll.js'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { AchievementsButton } from './Achievements.jsx'

const SECTIONS = ['home', 'about', 'skills', 'experience', 'projects', 'lab', 'contact']

export function Logo() {
  const [a, b] = profile.brand.split('.')
  return (
    <span lang="en" className="text-[13px] leading-none" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      {a}<span className="text-sky">.{b}</span>
    </span>
  )
}

export default function Navbar() {
  const { t } = useLanguage()
  const active = useActiveSection(SECTIONS)
  const progressRef = useScrollProgress()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id === 'home' ? 'top' : id)
    history.replaceState(null, '', id === 'home' ? location.pathname + location.search : `#${id}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-4 border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href="#home" onClick={go('home')} aria-label={`${profile.brand} — ${t.nav.home}`}>
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  aria-current={active === id ? 'true' : undefined}
                  className={`px-3 py-2 text-sm transition-colors ${
                    active === id ? 'bg-sky text-on-accent' : 'text-muted hover:text-ink'
                  }`}
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <AchievementsButton />
          <button
            type="button"
            className="grid h-9 w-9 place-items-center border-2 border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t-4 border-line bg-bg lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-3">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={go(id)}
                  aria-current={active === id ? 'true' : undefined}
                  className={`block rounded-md px-2 py-3 text-base ${active === id ? 'text-sky' : 'text-ink'}`}
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* page progress, drawn as a segmented XP bar */}
      <div aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-1 overflow-hidden">
        <div ref={progressRef} className="h-full origin-left bg-orange" style={{ transform: 'scaleX(0)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, transparent 0 10px, var(--bg) 10px 12px)', backgroundSize: '12px 100%' }} />
      </div>
    </header>
  )
}
