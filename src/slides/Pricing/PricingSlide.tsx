import { Check, MessageCircle, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { PLATFORM_URL, SALES_URL } from '../../config/links'
import { PLANS } from '../../data/pricing'
import './Pricing.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** Four plans: a name, a price, who it is for, what it includes and one button. */
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
                <span className="pr-plan__num pr-plan__num--word">Contact us</span>
              ) : (
                <>
                  <span className="pr-plan__cur">$</span>
                  <span className="pr-plan__num">{p.price}</span>
                  <span className="pr-plan__per">/ month</span>
                </>
              )}
            </p>
            <p className="pr-plan__line">{p.line}</p>
            {p.includes.length > 0 && (
              <ul className="pr-plan__list">
                {p.includes.map((item) => (
                  <li key={item}>
                    <Check size={14} strokeWidth={2.2} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <a className="btn pr-plan__cta" href={p.cta === 'trial' ? PLATFORM_URL : SALES_URL}>
              {p.cta === 'trial' ? (
                <Sparkles size={16} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
              )}
              <span>{p.cta === 'trial' ? 'Start Free Trial' : 'Contact sales'}</span>
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
