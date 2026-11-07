/**
 * Where the calls to action and the links go.
 *
 * The landing lives on neuronium.ai; the product is on its own subdomains:
 * - platform.neuronium.ai — the main call to action, the Platform block, every plan and the final block;
 * - management.neuronium.ai/km — Knowledge Management.
 * Each can be pointed elsewhere at build time (VITE_… variables, see .env.example).
 */
const env = import.meta.env

export const PLATFORM_URL: string = env.VITE_PLATFORM_URL || 'https://platform.neuronium.ai/'
export const KM_URL: string = env.VITE_KM_URL || 'https://management.neuronium.ai/km'

export const SUPPORT_EMAIL = 'support@neuronium.ai'

/** The final block: the business task travels to the platform as ?task=… */
export const taskHref = (task: string) => {
  const t = task.trim()
  if (!t) return PLATFORM_URL
  return `${PLATFORM_URL}${PLATFORM_URL.includes('?') ? '&' : '?'}task=${encodeURIComponent(t)}`
}

/** “Contact sales” on Enterprise. */
export const SALES_URL: string =
  env.VITE_SALES_URL || `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Neuronium Enterprise')}`

/** Created by Andre AI Technologies; its terms and privacy policy cover the site. */
export const COMPANY_URL = 'https://andre.technology/'
export const TERMS_URL: string = env.VITE_TERMS_URL || 'https://andre.technology/terms/'
export const PRIVACY_URL: string = env.VITE_PRIVACY_URL || 'https://andre.technology/privacy/'

/** The same profiles as on andre.technology; GitHub is where the code is open. */
export const SOCIAL: { brand: 'linkedin' | 'x' | 'instagram' | 'tiktok' | 'youtube' | 'github'; label: string; href: string }[] = [
  { brand: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/andre-kuzminykh/' },
  { brand: 'x', label: 'X', href: 'https://x.com/andre_dataist' },
  { brand: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/andre_dataist' },
  { brand: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@andre_dataist' },
  { brand: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@andre_dataist' },
  { brand: 'github', label: 'GitHub — open source', href: 'https://github.com/andre-kuzminykh' },
]
