import { useEffect, useRef, useState } from 'react'

export function useInView({ once = false, rootMargin = '0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting)
      if (e.isIntersecting && once) io.disconnect()
    }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [once, rootMargin])
  return [ref, inView]
}
