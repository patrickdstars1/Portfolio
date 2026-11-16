import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../data/translations'

const KEY = 'bankdev:lang'
const LanguageContext = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'th' || saved === 'en') return saved
  } catch {}
  return 'en' // default language
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(KEY, lang) } catch {}
  }, [lang])

  const setLang = useCallback((l) => setLangState(l === 'th' ? 'th' : 'en'), [])

  const value = useMemo(() => ({
    lang,
    setLang,
    t: translations[lang],
    // pick({en, th}) -> localized value; plain values pass through.
    pick: (v) => (v && typeof v === 'object' && !Array.isArray(v) && 'en' in v ? v[lang] ?? v.en : v),
  }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
