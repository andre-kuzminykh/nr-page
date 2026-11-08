/**
 * The plans on the Pricing block. Prices are per month, in US dollars.
 * Own model runs on the customer's own AI provider key. Solo and Team each come at three model
 * levels — Low, Medium, High — chosen inside the card; each level comes with its hours of AI
 * Workforce (High: 1 000 on Solo, 10 000 on Team; the lower levels in proportion to their price).
 * Team works in a shared workspace. Scale (more than 10 people) is priced with sales.
 * Own model, Solo and Team start with a free trial.
 */
export type Tier = 'low' | 'medium' | 'high'

export const TIERS: { id: Tier; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
]

export interface Plan {
  id: 'own' | 'solo' | 'team' | 'scale'
  name: string
  /** One line: who it is for. */
  line: string
  /** Per month, USD: one price, or one per model level; neither: priced with sales. */
  price?: number
  prices?: Partial<Record<Tier, number>>
  /** Hours of AI Workforce a month, by model level. */
  hours?: Partial<Record<Tier, number>>
  /** The level the card opens on. */
  first?: Tier
  /** What it includes; at a model level, its AI Workforce hours follow. */
  includes: string[]
  cta: 'trial' | 'sales'
  featured?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'own',
    name: 'Own model',
    line: 'Bring your own Provider Key',
    price: 19,
    includes: ['AI Superagent', 'AI Management', 'Your AI Costs'],
    cta: 'trial',
  },
  {
    id: 'solo',
    name: 'Solo',
    line: 'For a solo builder',
    prices: { low: 59, medium: 99, high: 190 },
    hours: { low: 300, medium: 500, high: 1000 },
    first: 'medium',
    includes: ['AI Superagent', 'AI Management'],
    cta: 'trial',
  },
  {
    id: 'team',
    name: 'Team',
    line: 'Up to 10 people',
    prices: { low: 290, medium: 490, high: 990 },
    hours: { low: 3000, medium: 5000, high: 10000 },
    first: 'medium',
    includes: ['AI Superagent', 'AI Management', 'Shared workspace'],
    cta: 'trial',
    featured: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    line: 'More than 10 people',
    includes: ['AI Superagent', 'AI Management', 'Shared workspace', 'Custom AI Workforce'],
    cta: 'sales',
  },
]

/** The levels a plan comes at, in order. */
export const tiersOf = (p: Plan): Tier[] => TIERS.map((t) => t.id).filter((t) => p.prices?.[t] !== undefined)

/** 10000 → “10 000” (the space does not break). */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')

/** What one AI Workforce hour is, in the product owner's words (the FAQ and the pricing list say it). */
export const WORKFORCE_HOUR = 'About one hour of work by one person.'

/** What a plan includes at a level: its own items, then its hours of AI Workforce (the level itself is the switch). */
export const includesAt = (p: Plan, tier?: Tier): string[] => {
  if (!tier) return p.includes
  const hours = p.hours?.[tier]
  return [...p.includes, ...(hours ? [`${thousands(hours)} AI Workforce hours`] : [])]
}

/** How many times the plan's lowest level a level gives in AI Workforce hours: 1 → “×1”, 1.67 → “×1.7”. */
export const gainOf = (p: Plan, tier: Tier): string => {
  const base = p.hours?.[tiersOf(p)[0]]
  const hours = p.hours?.[tier]
  if (!base || !hours) return ''
  return `×${String(Math.round((hours / base) * 10) / 10)}`
}
