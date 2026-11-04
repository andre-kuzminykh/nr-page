import { ArrowUpRight, Check } from 'lucide-react'
import type { CSSProperties } from 'react'
import { FAMILY } from '../../components/Element/Element'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { PLANS, type Plan } from '../../data/pricing'
import './Pricing.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** The plan's scope drawn as the periodic table: lit elements are included. */
function Scope({ lit }: { lit: Plan['lit'] }) {
  return (
    <span className={`pr-grid pr-grid--${lit}`} aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => {
        const row = Math.floor(i / 10)
        const on = lit !== 'row' || row === 4
        return <i key={i} className={on ? 'is-on' : ''} style={{ '--fam': FAMILY[row], '--w': row + (i % 10) } as CSSProperties} />
      })}
      {lit === 'all-plus' && <b className="pr-grid__plus">101</b>}
    </span>
  )
}

export function PricingSlide(_: SlideProps) {
  const { goTo } = useDeck()
  return (
    <div className="slide__frame pr">
      <header className="pr__head">
        <h2 className="h2 pr__title">
          <span className="mask" style={d(40)}>
            <span>One department.</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>Or all one hundred.</span>
          </span>
        </h2>
        <p className="pr__copy rv" style={d(240)}>
          Neuronium is in early access. Pricing is agreed with each team — tell us what you need and we’ll
          come back with a proposal.
        </p>
      </header>

      <div className="pr__plans">
        {PLANS.map((p, k) => (
          <article key={p.id} className={`pr-plan rv ${p.featured ? 'is-featured' : ''}`} style={d(300 + k * 110)}>
            <Scope lit={p.lit} />
            <div className="pr-plan__top">
              <h3 className="pr-plan__name">{p.name}</h3>
              {p.featured && <span className="pr-plan__tag mono">Most complete</span>}
            </div>
            <p className="pr-plan__scope">{p.scope}</p>
            <ul className="pr-plan__list">
              {p.includes.map((item) => (
                <li key={item}>
                  <Check size={13} strokeWidth={2} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pr-plan__foot">
              <p className="pr-plan__price">{p.price ?? 'Price on request'}</p>
              <button type="button" className={`btn ${p.featured ? 'btn--primary' : 'btn--ghost'} pr-plan__cta`} onClick={() => goTo('start')}>
                Get Early Access
                <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="btn btn--primary pr__cta-m rv" style={d(640)} onClick={() => goTo('start')}>
        Get Early Access
        <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <p className="pr__note rv" style={d(700)}>
        Plans describe the intended early-access packages. Scope and price are confirmed individually.
      </p>
    </div>
  )
}
