/**
 * External destinations for calls to action.
 *
 * No sign-up backend exists in this project, so nothing is faked:
 * - "Get Early Access" links default to the contact address published on andre.technology.
 * - "Start Free Trial" and "Contact sales" on the plans open a pre-filled email unless
 *   VITE_TRIAL_URL / VITE_SALES_URL point to a real page.
 * - The idea form on the last slide opens a pre-filled email to that address, or — when
 *   VITE_IDEA_ENDPOINT is set at build time — POSTs { idea, source } as JSON to that endpoint.
 */
export const CONTACT_EMAIL = 'admin@andre.technology'

export const EARLY_ACCESS_URL: string =
  import.meta.env.VITE_EARLY_ACCESS_URL || `mailto:${CONTACT_EMAIL}?subject=Neuronium%20Early%20Access`

/** “Start Free Trial” on a plan: VITE_TRIAL_URL (with ?plan=…) or a pre-filled email naming the plan. */
const TRIAL_URL: string | undefined = import.meta.env.VITE_TRIAL_URL || undefined
export const trialHref = (plan: string) =>
  TRIAL_URL
    ? `${TRIAL_URL}${TRIAL_URL.includes('?') ? '&' : '?'}plan=${encodeURIComponent(plan.toLowerCase())}`
    : `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Neuronium — free trial: ${plan}`)}`

/** “Contact sales” for Enterprise: VITE_SALES_URL or an email to the team. */
export const SALES_URL: string =
  import.meta.env.VITE_SALES_URL || `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Neuronium Enterprise')}`

export const IDEA_ENDPOINT: string | undefined = import.meta.env.VITE_IDEA_ENDPOINT || undefined

export const ideaMailto = (idea: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Neuronium — early access: my business task')}&body=${encodeURIComponent(
    `My business task:\n\n${idea}\n\n— sent from the Neuronium website`,
  )}`

export const COMPANY_URL = 'https://andre.technology/'
export const MEDIA_LABEL_URL = 'https://dataist.ai/'
