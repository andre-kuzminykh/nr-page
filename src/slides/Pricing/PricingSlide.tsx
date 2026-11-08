import { Check, MessageCircle, Sparkles } from 'lucide-react'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { SALES_URL, trialHref } from '../../config/links'
import { PLANS, TIERS, WORKFORCE_HOUR, includesAt, tiersOf, type Plan, type Tier } from '../../data/pricing'
import { openContact } from '../../lib/events'
import './Pricing.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
/**
 * A model level's mark: three bars of a meter, one lit for Low, two for Medium, all three for High.
 * The unlit bars stay faintly drawn, so every mark has the same width and sits right by its word.
 */
function Level({ n }: { n: number }) {
  return (
    <svg className="pr-meter" width="13" height="12" viewBox="0 0 13 12" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect key={i} className={i < n ? 'is-lit' : ''} x={i * 5} y={8 - i * 4} width="3" height={4 + i * 4} rx="1" />
      ))}
    </svg>
  )
}

/** A plan: its name, its price at the chosen model level, who it is for, the levels, what it includes, one button. */
function PlanCard({ p, k }: { p: Plan; k: number }) {
  const tiers = tiersOf(p)
  const [tier, setTier] = useState<Tier | undefined>(p.first ?? tiers[0])
  const price = tier ? p.prices?.[tier] : p.price
  const at = tier ? tiers.indexOf(tier) : 0

  // ← → move between the levels, as in any group of options
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = tiers[(at + step + tiers.length) % tiers.length]
    setTier(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-tier="${next}"]`)?.focus()
  }

  return (
    <article className={`pr-plan rv ${p.featured ? 'is-featured' : ''}`} style={d(220 + k * 90)}>
      <h3 className="pr-plan__name">{p.name}</h3>
      <p className="pr-plan__price" aria-live="polite">
        {price === undefined ? (
          <span className="pr-plan__num pr-plan__num--word">Contact us</span>
        ) : (
          <>
            <span className="pr-plan__cur">$</span>
            <span key={price} className="pr-plan__num">
              {price}
            </span>
            <span className="pr-plan__per">/ month</span>
          </>
        )}
      </p>
      <p className="pr-plan__line">{p.line}</p>

      {tiers.length ? (
        <div className="pr-level">
          <div
            className="pr-tiers"
            role="radiogroup"
            aria-label={`${p.name}: model`}
            style={{ '--n': tiers.length, '--i': at } as CSSProperties}
            onKeyDown={onKey}
            data-own-keys
          >
            <span className="pr-tiers__ink" aria-hidden="true" />
            {tiers.map((t) => {
              const label = TIERS.find((x) => x.id === t)!.label
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  data-tier={t}
                  aria-checked={t === tier}
                  tabIndex={t === tier ? 0 : -1}
                  className={`pr-tiers__opt ${t === tier ? 'is-on' : ''}`}
                  onClick={() => setTier(t)}
                >
                  <Level n={tiers.indexOf(t) + 1} />
                  <span className="pr-tiers__l">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        // keeps the cards' lists level with each other
        <div className="pr-level is-blank" aria-hidden="true" />
      )}

      <ul className="pr-plan__list">
        {includesAt(p, tier).map((item) => (
          <li key={item} title={/AI Workforce hours$/.test(item) ? `One AI Workforce hour: ${WORKFORCE_HOUR.toLowerCase()}` : undefined}>
            <Check size={14} strokeWidth={2.2} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      {p.cta === 'trial' ? (
        <a className="btn pr-plan__cta" href={trialHref(p.id, tier)}>
          <Sparkles size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Start Free Trial</span>
        </a>
      ) : SALES_URL ? (
        <a className="btn pr-plan__cta" href={SALES_URL}>
          <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Contact sales</span>
        </a>
      ) : (
        // no sales page: the widget in the corner opens, already about this plan
        <button type="button" className="btn pr-plan__cta" onClick={() => openContact(`${p.name} plan`)}>
          <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Contact sales</span>
        </button>
      )}
    </article>
  )
}

/** Own model; Solo and Team, each at the model level chosen inside the card; and Scale, priced with you. */
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
          <PlanCard key={p.id} p={p} k={k} />
        ))}
      </div>
    </div>
  )
}
