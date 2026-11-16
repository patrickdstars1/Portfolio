import { ArrowUp, Mail } from 'lucide-react'
import { profile } from '../data/profile.js'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { scrollToId } from '../lib/scroll.js'
import { Logo } from './Navbar.jsx'
import { GithubIcon, LinkedinIcon } from './TechIcon.jsx'

export default function Footer() {
  const { t, pick } = useLanguage()
  const year = new Date().getFullYear()
  const social = [
    { label: 'GitHub', href: profile.links.github, Icon: GithubIcon, ext: true },
    { label: 'LinkedIn', href: profile.links.linkedin, Icon: LinkedinIcon, ext: true },
    { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
  ]
  return (
    <footer className="relative border-t border-line">
      {/* small animated accent */}
      <div aria-hidden="true" className="absolute inset-x-0 -top-px h-px overflow-hidden">
        <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-sky to-transparent" style={{ animation: 'sweep 7s linear infinite' }} />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted">{t.footer.tagline}</p>
        </div>
        <div className="flex items-center gap-1">
          {social.map(({ label, href, Icon, ext }) => (
            <a key={label} href={href} aria-label={label} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})} className="grid h-11 w-11 place-items-center rounded-lg text-muted transition-colors hover:text-sky">
              <Icon className="h-5 w-5" />
            </a>
          ))}
          <button type="button" onClick={() => scrollToId('top')} className="ml-3 inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2.5 text-sm transition-colors hover:border-sky hover:text-sky">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />{t.footer.top}
          </button>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-5 font-mono text-xs text-muted md:px-8">
          © {year} {t.footer.rights} {pick(profile.name)}
        </p>
      </div>
    </footer>
  )
}
