/**
 * The plans on the Pricing block. Prices are per month, in US dollars; Enterprise is priced with sales.
 * Standard, Solo and Business start with a free trial.
 */
export interface Plan {
  id: 'standard' | 'solo' | 'business' | 'enterprise'
  name: string
  /** Per month, USD; null: priced with sales. */
  price: number | null
  /** One line: who it is for. */
  line: string
  /** What it includes. */
  includes: string[]
  cta: 'trial' | 'sales'
  featured?: boolean
}

export const PLANS: Plan[] = [
  { id: 'standard', name: 'Standard', price: 59, line: 'Bring your own Provider Key', includes: ['AI Superagent', 'AI Management', 'Your AI Costs'], cta: 'trial' },
  { id: 'solo', name: 'Solo', price: 190, line: 'For a solo builder', includes: ['AI Superagent', 'AI Management', '1 000 AI Work Hours'], cta: 'trial' },
  { id: 'business', name: 'Business', price: 890, line: 'Up to 10 people', includes: ['AI Superagent', 'AI Management', '10 000 AI Work Hours'], cta: 'trial', featured: true },
  { id: 'enterprise', name: 'Enterprise', price: null, line: 'More than 10 people', includes: ['AI Superagent', 'AI Management', 'Custom AI Work Hours'], cta: 'sales' },
]
