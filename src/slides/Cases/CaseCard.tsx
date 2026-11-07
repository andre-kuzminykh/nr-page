import { ArrowUpRight } from 'lucide-react'
import type { CaseStudy } from '../../data/cases'
import { Art } from './Art'

/**
 * One case: its picture, and its title under it. With a link it opens the case; without one it
 * says “Soon” when reached. `hidden` marks the copy that closes a flowing row's loop.
 */
export function CaseCard({ c, hidden = false }: { c: CaseStudy; hidden?: boolean }) {
  const inner = (
    <>
      <span className={`cs-pic cs-pic--${c.tone}`}>
        <span className="cs-glow" />
        {c.image ? <img className="cs-img" src={c.image} alt="" loading="lazy" decoding="async" /> : <Art art={c.art} />}
      </span>
      <span className="cs-cap">
        <span className="cs-title">{c.title}</span>
        <span className="cs-go">{c.href ? <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" /> : 'Soon'}</span>
      </span>
    </>
  )
  const quiet = hidden ? { 'aria-hidden': true, tabIndex: -1 } : {}
  return c.href ? (
    <a className="cs-item" href={c.href} {...quiet}>
      {inner}
    </a>
  ) : (
    <article className="cs-item is-soon" tabIndex={hidden ? -1 : 0} aria-hidden={hidden || undefined} aria-label={hidden ? undefined : `${c.title} — soon`}>
      {inner}
    </article>
  )
}
