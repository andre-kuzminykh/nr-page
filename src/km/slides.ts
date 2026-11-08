import type { SlideMeta } from '../data/slides'

/**
 * The AI Knowledge Management page: its blocks, in order, with the light for each and the menu
 * section it belongs to. (No imports with values: the validation scripts read this file.)
 */
export const KM_SLIDES: SlideMeta[] = [
  { id: 'overview', label: 'AI Knowledge Management', light: { x: 0.72, y: 0.4, radius: 0.58, energy: 1.05, spread: 1.0 } },
  { id: 'report', label: 'The report generator', nav: 'report', light: { x: 0.78, y: 0.55, radius: 0.55, energy: 0.9, spread: 1.05 } },
  { id: 'how', label: 'How it works', nav: 'how', light: { x: 0.2, y: 0.5, radius: 0.5, energy: 0.8, spread: 1.05 } },
  { id: 'rules', label: 'Three principles', nav: 'how', light: { x: 0.82, y: 0.6, radius: 0.5, energy: 0.78, spread: 1.1 } },
  { id: 'ask', label: 'Ask in your own words', nav: 'how', light: { x: 0.18, y: 0.38, radius: 0.5, energy: 0.8, spread: 1.0 } },
  { id: 'graph', label: 'The company knowledge graph', nav: 'graph', light: { x: 0.6, y: 0.62, radius: 0.56, energy: 0.85, spread: 1.15 } },
  { id: 'ontology', label: 'The company ontology', nav: 'graph', light: { x: 0.3, y: 0.3, radius: 0.55, energy: 0.8, spread: 1.1 } },
  { id: 'access', label: 'Access', nav: 'graph', light: { x: 0.8, y: 0.4, radius: 0.5, energy: 0.8, spread: 1.0 } },
  { id: 'gaps', label: 'Honesty', nav: 'graph', light: { x: 0.25, y: 0.65, radius: 0.5, energy: 0.78, spread: 1.05 } },
  { id: 'grow', label: 'It grows with Neuronium', nav: 'graph', light: { x: 0.5, y: 0.5, radius: 0.6, energy: 0.9, spread: 0.9 } },
  { id: 'cases', label: 'Use cases', nav: 'cases', light: { x: 0.24, y: 0.32, radius: 0.5, energy: 0.82, spread: 1.1 } },
  { id: 'pricing', label: 'Pricing', nav: 'pricing', light: { x: 0.5, y: 1.08, radius: 0.55, energy: 0.85, spread: 1.15 } },
  { id: 'faq', label: 'FAQ', nav: 'faq', light: { x: 0.14, y: 0.92, radius: 0.48, energy: 0.72, spread: 1.05 } },
  { id: 'start', label: 'Ask your company', nav: 'start', light: { x: 0.5, y: 0.56, radius: 0.62, energy: 1.25, spread: 0.78 } },
]

export const KM_NAV = [
  { key: 'report', label: 'Report', target: 'report' },
  { key: 'how', label: 'How it works', target: 'how' },
  { key: 'graph', label: 'Graph', target: 'graph' },
  { key: 'cases', label: 'Use cases', target: 'cases' },
  { key: 'pricing', label: 'Pricing', target: 'pricing' },
  { key: 'faq', label: 'FAQ', target: 'faq' },
  { key: 'start', label: 'Contacts', target: 'start' },
]
