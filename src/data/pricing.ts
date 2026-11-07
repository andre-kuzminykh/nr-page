/**
 * The plans on the Pricing block. Prices are per month, in US dollars.
 * Solo and Team each come at three model levels — Low, Medium, High — chosen inside the card;
 * Solo can also run on the customer's own model. Scale (more than 10 people) is priced with sales.
 * Solo and Team start with a free trial.
 */
export type Tier = 'own' | 'low' | 'medium' | 'high'

export const TIERS: { id: Tier; label: string }[] = [
  { id: 'own', label: 'Own model' },
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
]

export interface Plan {
  id: 'solo' | 'team' | 'scale'
  name: string
  /** One line: who it is for. */
  line: string
  /** Per month, USD, by model level; none: priced with sales. */
  prices?: Partial<Record<Tier, number>>
  /** The level the card opens on. */
  first?: Tier
  /** What it includes; the last item names the model level when there is one. */
  includes: string[]
  cta: 'trial' | 'sales'
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    line: 'For a solo builder',
    prices: { own: 19, low: 59, medium: 99, high: 190 },
    first: 'medium',
    includes: ['AI Superagent', 'AI Management'],
    cta: 'trial',
  },
  {
    id: 'team',
    name: 'Team',
    line: 'Up to 10 people',
    prices: { low: 290, medium: 490, high: 990 },
    first: 'medium',
    includes: ['AI Superagent', 'AI Management'],
    cta: 'trial',
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    line: 'More than 10 people',
    includes: ['AI Superagent', 'AI Management', 'Custom AI Work Hours'],
    cta: 'sales',
  },
]

/** The levels a plan comes at, in order. */
export const tiersOf = (p: Plan): Tier[] => TIERS.map((t) => t.id).filter((t) => p.prices?.[t] !== undefined)

/** What a plan includes at a level: its own items, then the model. */
export const includesAt = (p: Plan, tier?: Tier): string[] =>
  tier ? [...p.includes, tier === 'own' ? 'Your own model' : `${TIERS.find((t) => t.id === tier)!.label} model`] : p.includes
