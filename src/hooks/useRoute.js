import { useEffect, useState } from 'react'

export const LAB_ROUTE = '#/lab/retro-console'

const read = () => (window.location.hash.startsWith('#/lab') ? 'lab' : 'home')

// Tiny hash router: works on any static host without server rewrites.
export function useRoute() {
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const openLab = () => { window.location.hash = LAB_ROUTE }
export const closeLab = () => { window.location.hash = '#lab' }
