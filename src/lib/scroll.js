// Holds the active Lenis instance (if any) so any component can request a smooth scroll.
// True inside the TV in the lab, where the site runs in an iframe.
export const isEmbed = () => typeof document !== 'undefined' && document.documentElement.classList.contains('embed')

let lenis = null
export const setLenis = (l) => { lenis = l }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToId(id) {
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el)
  else if (id === 'top') window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
}
