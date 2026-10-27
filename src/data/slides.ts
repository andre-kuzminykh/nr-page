/**
 * The 12 full-screen modules, in order.
 * `light` sets the composition of the shared background light for that slide:
 *   x, y      — midpoint of the two fields, as a fraction of the viewport (0–1, y from top)
 *   radius    — field size, relative to the smaller viewport side
 *   energy    — overall intensity (1 = hero; the final slide is the most intense)
 *   spread    — how far the two fields drift apart (they always keep overlapping)
 */

export interface LightPreset {
  x: number
  y: number
  radius: number
  energy: number
  spread: number
}

export interface SlideMeta {
  id: string
  label: string
  light: LightPreset
}

export const SLIDES: SlideMeta[] = [
  { id: 'hero', label: 'Run AI Workplaces', light: { x: 0.76, y: 0.46, radius: 0.5, energy: 1, spread: 1.05 } },
  { id: 'what', label: 'What is Neuronium', light: { x: 0.82, y: 0.6, radius: 0.42, energy: 0.78, spread: 1.05 } },
  { id: 'architecture', label: 'Architecture', light: { x: 0.03, y: -0.06, radius: 0.42, energy: 0.7, spread: 1.1 } },
  { id: 'business-types', label: 'AI Business types', light: { x: 0.5, y: 1.1, radius: 0.46, energy: 0.8, spread: 1.15 } },
  { id: 'employees', label: 'AI Employees', light: { x: 1.04, y: -0.12, radius: 0.42, energy: 0.72, spread: 1.05 } },
  { id: 'management', label: 'Management', light: { x: 0.04, y: 0.12, radius: 0.4, energy: 0.66, spread: 1.05 } },
  { id: 'workflow', label: 'How work moves', light: { x: 0.5, y: -0.04, radius: 0.46, energy: 0.72, spread: 1.25 } },
  { id: 'execution', label: 'Execution', light: { x: 0.94, y: 0.86, radius: 0.42, energy: 0.76, spread: 1.05 } },
  { id: 'context', label: 'Business context', light: { x: 0.97, y: 1.08, radius: 0.42, energy: 0.7, spread: 1.05 } },
  { id: 'capabilities', label: 'Capabilities', light: { x: 0.97, y: 0.5, radius: 0.4, energy: 0.6, spread: 1.05 } },
  { id: 'configuration', label: 'Business configuration', light: { x: 0.0, y: 1.1, radius: 0.42, energy: 0.68, spread: 1.05 } },
  { id: 'start', label: 'Turn your idea into reality', light: { x: 0.5, y: 0.56, radius: 0.62, energy: 1.25, spread: 0.78 } },
]

export const slideIndex = (id: string): number => SLIDES.findIndex((s) => s.id === id)
