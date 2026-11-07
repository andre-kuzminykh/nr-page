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
  cta: 'trial' | 'sales'
  featured?: boolean
}

export const PLANS: Plan[] = [
  { id: 'standard', name: 'Standard', price: 59, line: 'Bring your own LLM key', cta: 'trial' },
  { id: 'solo', name: 'Solo', price: 190, line: 'For a solo builder', cta: 'trial', featured: true },
  { id: 'business', name: 'Business', price: 890, line: 'Up to 10 people', cta: 'trial' },
  { id: 'enterprise', name: 'Enterprise', price: null, line: 'More than 10 people', cta: 'sales' },
]
