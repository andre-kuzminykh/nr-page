import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { SALES_URL, trialHref } from '../../config/links'
import { PLANS } from '../../data/pricing'
import './Pricing.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** Four plans: a name, a price, who it is for and one button. */
export function PricingSlide(_: SlideProps) {
  return (
    <div className="slide__frame pr">
      <h2 className="h2 pr__title">
        <span className="mask" style={d(40)}>
          <span>Pricing</span>
        </span>
      </h2>

      <div className="pr__plans">
        {PLANS.map((p, k) => (
          <article key={p.id} className={`pr-plan rv ${p.featured ? 'is-featured' : ''}`} style={d(220 + k * 90)}>
            <h3 className="pr-plan__name">{p.name}</h3>
            <p className="pr-plan__price">
              {p.price === null ? (
                <span className="pr-plan__num">Custom</span>
              ) : (
                <>
                  <span className="pr-plan__cur">$</span>
                  <span className="pr-plan__num">{p.price}</span>
                  <span className="pr-plan__per">/ month</span>
                </>
              )}
            </p>
            <p className="pr-plan__line">{p.line}</p>
            <a
              className={`btn ${p.featured ? 'btn--primary' : 'btn--ghost'} pr-plan__cta`}
              href={p.cta === 'trial' ? trialHref(p.name) : SALES_URL}
            >
              {p.cta === 'trial' ? 'Start Free Trial' : 'Contact sales'}
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
