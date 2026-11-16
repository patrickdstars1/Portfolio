import {
  siPython, siJavascript, siPhp, siHtml5, siCss, siReact, siNextdotjs, siWix, siMysql,
  siPostgresql, siPostman, siGithub, siGitlab, siDocker, siFigma, siClaude, siVite, siFastapi, siSqlalchemy,
} from 'simple-icons'

// Official brand marks (simple-icons). Add a key here to make it available in data/skills.js.
const ICONS = {
  python: siPython, javascript: siJavascript, php: siPhp, html: siHtml5, css: siCss, react: siReact,
  nextjs: siNextdotjs, wix: siWix, mysql: siMysql, postgresql: siPostgresql, postman: siPostman,
  github: siGithub, gitlab: siGitlab, docker: siDocker, figma: siFigma, claude: siClaude,
  vite: siVite, fastapi: siFastapi, sqlalchemy: siSqlalchemy,
}

export default function TechIcon({ name, className = 'h-4 w-4' }) {
  const icon = ICONS[name]
  if (!icon) return <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-orange" />
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}

export function GithubIcon({ className = 'h-5 w-5' }) {
  return <TechIcon name="github" className={className} />
}

export function LinkedinIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zm6.5 0h3.8v1.6h.06c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.75V21h-4v-5.2c0-1.24-.02-2.84-1.83-2.84-1.83 0-2.11 1.35-2.11 2.75V21h-4V9.75z" />
    </svg>
  )
}
