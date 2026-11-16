import { useInView } from '../hooks/useInView.js'

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView({ once: true, rootMargin: '0px 0px -8% 0px' })
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'is-in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

export default function Section({ id, title, subtitle, children, className = '' }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`border-t border-line py-20 md:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mb-10 max-w-2xl md:mb-14">
          <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.15]">
            {title}
          </h2>
          {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
