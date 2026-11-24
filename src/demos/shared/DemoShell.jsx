import { ArrowLeft } from 'lucide-react'
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx'
import ThemeToggle from '../../components/ThemeToggle.jsx'
import { PixelRule } from '../../components/Section.jsx'
import { useLanguage } from '../../hooks/useLanguage.jsx'

const TEXT = {
  en: {
    back: 'Back to portfolio',
    disclosure: 'Demo project made for this portfolio with AI-assisted development. It uses sample data only and runs entirely in your browser: nothing is uploaded or stored.',
  },
  th: {
    back: 'กลับไปที่ Portfolio',
    disclosure: 'โปรเจกต์เดโมที่ทำขึ้นสำหรับ portfolio นี้ด้วย AI-assisted development ใช้ข้อมูลตัวอย่างเท่านั้น และทำงานในเบราว์เซอร์ของคุณทั้งหมด ไม่มีการอัปโหลดหรือเก็บข้อมูล',
  },
}

// Shared frame for the stand-alone demo pages: header, title, disclosure footer.
export default function DemoShell({ title, subtitle, children }) {
  const { lang } = useLanguage()
  const T = TEXT[lang]
  return (
    <div className="min-h-svh bg-bg text-ink">
      <header className="border-b-4 border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
          <a href="../../" className="inline-flex min-h-9 items-center gap-2 text-sm transition-colors hover:text-sky">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{T.back}</span>
          </a>
          <div className="flex items-center gap-2.5"><LanguageSwitcher /><ThemeToggle /></div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <p lang="en" className="font-pixel text-[10px] text-orange">DEMO</p>
        <h1 className="text-pop mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <PixelRule className="mt-5" />
        <p className="mt-5 max-w-2xl text-lg text-muted">{subtitle}</p>
        <div className="mt-10">{children}</div>
      </main>
      <footer className="border-t-4 border-line">
        <p className="mx-auto max-w-5xl px-5 py-5 text-sm text-muted">{T.disclosure}</p>
      </footer>
    </div>
  )
}
