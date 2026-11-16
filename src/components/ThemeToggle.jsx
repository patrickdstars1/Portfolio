import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.jsx'
import { useLanguage } from '../hooks/useLanguage.jsx'

// Black button, white symbol: sun while the light theme is on, moon while dark is on.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useLanguage()
  const label = theme === 'dark' ? t.theme.toLight : t.theme.toDark
  const Icon = theme === 'dark' ? Moon : Sun
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-black text-white transition-transform hover:scale-105 active:scale-95"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
