/**
 * Pricing plans shown on the Pricing block.
 *
 * Placeholders to confirm before publishing: plan names, what each includes and the
 * price. While `price` is null the page says "Price on request" — no invented numbers.
 */
export interface Plan {
  id: 'department' | 'company' | 'custom'
  name: string
  scope: string
  /** How many of the 100 elements light up in the plan's picture. */
  lit: 'row' | 'all' | 'all-plus'
  includes: string[]
  price: string | null
  featured?: boolean
}

/**
 * While AI employees are still being added (see release.ts), the block shows one subscription for
 * what is ready; its AI employees are listed from the open elements.
 */
export const SUBSCRIPTION = {
  name: 'Subscription',
  tag: 'Early access',
  includes: ['Shared business context', 'AI Superagent'],
  price: null as string | null,
}

export const PLANS: Plan[] = [
  {
    id: 'department',
    name: 'Department',
    scope: '10 AI employees of one department',
    lit: 'row',
    includes: ['Shared business context', 'AI Superagent', 'AI Governance'],
    price: null,
  },
  {
    id: 'company',
    name: 'Company',
    scope: '100 AI employees across all 10 departments',
    lit: 'all',
    includes: ['Everything in Department', 'Custom use cases', 'One task registry for the whole company'],
    price: null,
    featured: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    scope: 'Your own AI employees, from element 101',
    lit: 'all-plus',
    includes: ['Integrations through MCP', 'Your workflows and skills', 'Onboarding with our team'],
    price: null,
  },
]
