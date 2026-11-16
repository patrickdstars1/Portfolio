import { useInView } from '../hooks/useInView.js'

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView({ once: true, rootMargin: '0px 0px -8% 0px' })
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

// Row of square "pixels" used as a divider under section labels.
export function PixelRule({ className = '' }) {
  return (
    <span aria-hidden="true" className={`flex gap-1 ${className}`}>
      <span className="h-2 w-8 bg-sky" /><span className="h-2 w-2 bg-sky" /><span className="h-2 w-2 bg-orange" />
    </span>
  )
}

/** `level` is the stage number shown above the title, e.g. "01". `deco` renders floating parallax sprites. */
export default function Section({ id, level, title, subtitle, children, className = '', deco = null }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative overflow-clip border-t-4 border-line py-20 md:py-28 ${className}`}>
      {deco}
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mb-10 max-w-2xl md:mb-14">
          {level && <p className="font-pixel text-[10px] text-orange" lang="en">STAGE {level}</p>}
          <h2 id={`${id}-title`} className="text-pop mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
            {title}
          </h2>
          <PixelRule className="mt-5" />
          {subtitle && <p className="mt-5 text-lg text-muted">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
