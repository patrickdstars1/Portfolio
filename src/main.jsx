import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { LanguageProvider } from './hooks/useLanguage.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'

// ?embed=tv is the copy of the site shown on the TV in the lab.
if (new URLSearchParams(window.location.search).get('embed') === 'tv') document.documentElement.classList.add('embed')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
