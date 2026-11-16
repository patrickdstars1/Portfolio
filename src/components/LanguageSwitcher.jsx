import { useLanguage } from '../hooks/useLanguage.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div role="group" aria-label={t.lang.label} className="flex items-center rounded-full border border-line p-0.5 font-mono text-xs">
      {['th', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            lang === l ? 'bg-sky text-on-accent' : 'text-muted hover:text-ink'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
