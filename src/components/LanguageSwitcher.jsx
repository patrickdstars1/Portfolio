import { useLanguage } from '../hooks/useLanguage.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div role="group" aria-label={t.lang.label} className="flex items-center border-2 border-line">
      {['th', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang="en"
          style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10 }}
          className={`px-2.5 py-2 uppercase leading-none transition-colors ${lang === l ? 'bg-sky text-on-accent' : 'text-muted hover:text-ink'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
