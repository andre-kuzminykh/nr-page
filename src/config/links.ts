/**
 * External destinations for calls to action.
 *
 * No sign-up backend exists in this project, so nothing is faked:
 * - "Get Early Access" links default to the contact address published on andre.technology.
 * - The idea form on the last slide opens a pre-filled email to that address, or — when
 *   VITE_IDEA_ENDPOINT is set at build time — POSTs { idea, source } as JSON to that endpoint.
 */
export const CONTACT_EMAIL = 'admin@andre.technology'

export const EARLY_ACCESS_URL: string =
  import.meta.env.VITE_EARLY_ACCESS_URL || `mailto:${CONTACT_EMAIL}?subject=Neuronium%20Early%20Access`

export const IDEA_ENDPOINT: string | undefined = import.meta.env.VITE_IDEA_ENDPOINT || undefined

export const ideaMailto = (idea: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Neuronium — early access: my idea')}&body=${encodeURIComponent(
    `My idea:\n\n${idea}\n\n— sent from the Neuronium website`,
  )}`

export const COMPANY_URL = 'https://andre.technology/'
export const MEDIA_LABEL_URL = 'https://dataist.ai/'
