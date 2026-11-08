import { DEPARTMENTS, type DepartmentId } from './departments.ts'
import { OPEN_BLOCKS, OPEN_EMPLOYEES } from './release.ts'

/**
 * All full-screen blocks, in order. Only the open ones are shown (see release.ts).
 * `light` sets the composition of the shared background light for that block:
 *   x, y      — midpoint of the two fields, as a fraction of the viewport (0–1, y from top)
 *   radius    — field size, relative to the smaller viewport side
 *   energy    — overall intensity (1 = hero; the final block is the most intense)
 *   spread    — how far the two fields drift apart (they always keep overlapping)
 * `nav` is the top-menu item the block belongs to.
 */

export interface LightPreset {
  x: number
  y: number
  radius: number
  energy: number
  spread: number
}

export type NavGroup = 'platform' | 'employees' | 'departments' | 'custom' | 'cases' | 'pricing' | 'faq' | 'start'

export interface SlideMeta {
  id: string
  label: string
  /** the top-menu section it belongs to (a NavGroup on the landing) */
  nav?: string
  department?: DepartmentId
  light: LightPreset
}

const dept = (id: DepartmentId, label: string, x: number, y: number): SlideMeta => ({
  id,
  label,
  nav: 'departments',
  department: id,
  light: { x, y, radius: 0.46, energy: 0.78, spread: 1.05 },
})

export const ALL_SLIDES: SlideMeta[] = [
  { id: 'hero', label: 'Neuronium', light: { x: 0.7, y: 0.42, radius: 0.56, energy: 1.05, spread: 1.0 } },
  { id: 'context', label: 'AI Superagent in your business', nav: 'platform', light: { x: 0.12, y: 0.56, radius: 0.46, energy: 0.8, spread: 1.0 } },
  { id: 'employees', label: '100 AI employees', nav: 'employees', light: { x: 0.5, y: 0.62, radius: 0.55, energy: 0.8, spread: 1.15 } },
  dept('management', 'Management', 0.82, 0.42),
  dept('hr', 'HR', 0.78, 0.66),
  dept('marketing', 'Marketing', 0.86, 0.3),
  dept('smm', 'SMM', 0.76, 0.6),
  dept('sales', 'Sales', 0.84, 0.4),
  dept('support', 'Support', 0.78, 0.7),
  dept('analytics', 'Analytics', 0.86, 0.34),
  dept('design', 'Design', 0.76, 0.58),
  dept('development', 'Development', 0.84, 0.44),
  dept('engineering', 'Engineering', 0.8, 0.68),
  { id: 'custom', label: 'Custom use cases', nav: 'custom', light: { x: 0.76, y: 0.52, radius: 0.5, energy: 0.85, spread: 1.05 } },
  { id: 'cases', label: 'Cases', nav: 'cases', light: { x: 0.24, y: 0.3, radius: 0.5, energy: 0.6, spread: 1.1 } },
  { id: 'pricing', label: 'Pricing', nav: 'pricing', light: { x: 0.5, y: 1.08, radius: 0.55, energy: 0.6, spread: 1.15 } },
  { id: 'faq', label: 'FAQ', nav: 'faq', light: { x: 0.14, y: 0.92, radius: 0.48, energy: 0.56, spread: 1.05 } },
  { id: 'start', label: 'Run your AI business', nav: 'start', light: { x: 0.5, y: 0.56, radius: 0.62, energy: 1.25, spread: 0.78 } },
]

const ALWAYS_OPEN = new Set(['hero', 'context', 'start'])

function isOpen(s: SlideMeta): boolean {
  if (ALWAYS_OPEN.has(s.id)) return true
  // a department opens with its first open AI employee
  if (s.department) return DEPARTMENTS.some((d) => d.id === s.department && d.members.some((m) => OPEN_EMPLOYEES.includes(m.n)))
  return OPEN_BLOCKS[s.id as keyof typeof OPEN_BLOCKS] === true
}

/** The blocks shown on the site right now. */
export const SLIDES: SlideMeta[] = ALL_SLIDES.filter(isOpen)

export const isSlideOpen = (id: string): boolean => SLIDES.some((s) => s.id === id)

export const slideIndex = (id: string): number => SLIDES.findIndex((s) => s.id === id)
