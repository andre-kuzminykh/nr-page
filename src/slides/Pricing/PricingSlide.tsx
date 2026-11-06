import { ArrowUpRight, Check } from 'lucide-react'
import type { CSSProperties } from 'react'
import { FAMILY } from '../../components/Element/Element'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { PLANS, SUBSCRIPTION, type Plan } from '../../data/pricing'
import { READY, readyList } from '../../data/ready.ts'
import { ALL_EMPLOYEES_OPEN, isEmployeeOpen } from '../../data/release.ts'
import './Pricing.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const countWord = (n: number) => (n < WORDS.length ? WORDS[n] : String(n))

const LIT: Record<Plan['lit'], (n: number) => boolean> = {
  row: (n) => Math.floor((n - 1) / 10) === 4,
  all: () => true,
  'all-plus': () => true,
}

/** The plan's scope drawn as the periodic table: lit elements are included. */
function Scope({ on, plus = false }: { on: (n: number) => boolean; plus?: boolean }) {
  return (
    <span className="pr-grid" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => {
        const row = Math.floor(i / 10)
        return <i key={i} className={on(i + 1) ? 'is-on' : ''} style={{ '--fam': FAMILY[row], '--w': row + (i % 10) } as CSSProperties} />
      })}
      {plus && <b className="pr-grid__plus">101</b>}
    </span>
  )
}

/** One subscription for what is ready today; its table lights only those elements. */
function Subscription({ onStart }: { onStart: () => void }) {
  return (
    <article className="pr-plan pr-plan--one is-featured rv" style={d(300)}>
      <Scope on={isEmployeeOpen} />
      <div className="pr-plan__top">
        <h3 className="pr-plan__name">{SUBSCRIPTION.name}</h3>
        <span className="pr-plan__tag mono">{SUBSCRIPTION.tag}</span>
      </div>
      <p className="pr-plan__scope">Today: {readyList(READY)}. New AI employees join as they are ready.</p>
      <ul className="pr-plan__list">
        {SUBSCRIPTION.includes.map((item) => (
          <li key={item}>
            <Check size={13} strokeWidth={2} aria-hidden="true" />
            {item}
          </li>
        ))}
        {READY.length > 4 ? (
          <li>
            <Check size={13} strokeWidth={2} aria-hidden="true" />
            {READY.length} AI employees
          </li>
        ) : (
          READY.map((e) => (
            <li key={e.n}>
              <Check size={13} strokeWidth={2} aria-hidden="true" />
              <span className="pr-plan__no mono">
                {e.n} · {e.symbol}
              </span>
              {e.name}
            </li>
          ))
        )}
      </ul>
      <div className="pr-plan__foot">
        <p className="pr-plan__price">{SUBSCRIPTION.price ?? 'Price on request'}</p>
        <button type="button" className="btn btn--primary pr-plan__cta" onClick={onStart}>
          Get Early Access
          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export function PricingSlide(_: SlideProps) {
  const { goTo } = useDeck()
  return (
    <div className="slide__frame pr">
      <header className="pr__head">
        <h2 className="h2 pr__title">
          <span className="mask" style={d(40)}>
            <span>{ALL_EMPLOYEES_OPEN ? 'One department.' : `${countWord(READY.length)} AI employee${READY.length === 1 ? '' : 's'} today.`}</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>{ALL_EMPLOYEES_OPEN ? 'Or all one hundred.' : 'A hundred to come.'}</span>
          </span>
        </h2>
        <p className="pr__copy rv" style={d(240)}>
          Neuronium is in early access. Pricing is agreed with each team — tell us what you need and we’ll
          come back with a proposal.
        </p>
      </header>

      <div className={`pr__plans ${ALL_EMPLOYEES_OPEN ? '' : 'pr__plans--one'}`}>
        {!ALL_EMPLOYEES_OPEN && <Subscription onStart={() => goTo('start')} />}
        {ALL_EMPLOYEES_OPEN && PLANS.map((p, k) => (
          <article key={p.id} className={`pr-plan rv ${p.featured ? 'is-featured' : ''}`} style={d(300 + k * 110)}>
            <Scope on={LIT[p.lit]} plus={p.lit === 'all-plus'} />
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
    </div>
  )
}
