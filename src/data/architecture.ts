/**
 * Neuronium — strict product architecture.
 *
 * Level 1  Neuronium · AI Operating System · Run AI Workplaces.
 *          AI Governance is a function of the OS itself (Policy, Access, Oversight, Control).
 * Level 2  AI Business · AI Identity | AI Knowledge Graph | AI Superagent
 *          Types: AI-Native (shown first) and AI-First (10 AI Employees).
 */

export const OS = {
  name: 'Neuronium',
  category: 'AI Operating System',
  tagline: 'Run AI Workplaces.',
  governance: {
    name: 'AI Governance',
    functions: ['Policy', 'Access', 'Oversight', 'Control'],
  },
} as const

export interface BusinessComponent {
  id: 'identity' | 'knowledge' | 'superagent'
  name: string
  short: string
  description: string
}

export const BUSINESS_COMPONENTS: BusinessComponent[] = [
  {
    id: 'identity',
    name: 'AI Identity',
    short: 'Who the business is',
    description: 'Business identity, goals and operating context.',
  },
  {
    id: 'knowledge',
    name: 'AI Knowledge Graph',
    short: 'What the business knows',
    description:
      'Connected business knowledge — people, products, documents, tasks, decisions and the relationships between them.',
  },
  {
    id: 'superagent',
    name: 'AI Superagent',
    short: 'How complex work gets done',
    description:
      'Orchestration of complex work across agents, workflows, tools and business context.',
  },
]

export interface BusinessType {
  id: 'native' | 'first'
  name: 'AI-Native' | 'AI-First'
  icon: 'robot' | 'person'
  promise: string
  definition: string
}

/** AI-Native is always presented above / before AI-First. */
export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'native',
    name: 'AI-Native',
    icon: 'robot',
    promise: 'Build autonomous AI products.',
    definition:
      'An autonomous AI product with AI built directly into how value is created. The standard process can run on its own, while people oversee exceptions and important decisions and remain accountable.',
  },
  {
    id: 'first',
    name: 'AI-First',
    icon: 'person',
    promise: 'Run AI-powered businesses with people in control.',
    definition:
      'A business with people in the loop. AI performs the core operational work, while people manage decisions and control the results.',
  },
]

export interface ExecutionUnit {
  id: 'agents' | 'workflows' | 'skills'
  name: string
  definition: string
}

/** Every AI Employee uses these three. Rendered as one slim line with icons. */
export const EXECUTION: ExecutionUnit[] = [
  {
    id: 'agents',
    name: 'AI Agents',
    definition: 'Intelligent units that execute tasks using relevant models, context and tools.',
  },
  {
    id: 'workflows',
    name: 'AI Workflows',
    definition:
      'Structured, executable processes that may combine deterministic operations and adaptive planning.',
  },
  {
    id: 'skills',
    name: 'AI Skills',
    definition: 'Reusable executable capabilities that can be created and refined through experience.',
  },
]
