import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../styles/globals.css'
import { ThemeProvider } from '../../hooks/useTheme.jsx'
import { LanguageProvider } from '../../hooks/useLanguage.jsx'

// Every demo page uses the portfolio's theme and language providers.
export function mountDemo(node) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ThemeProvider>
        <LanguageProvider>{node}</LanguageProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}
