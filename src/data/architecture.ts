/**
 * Neuronium — strict product architecture.
 *
 * Level 1  Neuronium · AI Operating System · Run AI Business.
 *          AI Governance is a function of the OS itself (Policy, Access, Oversight, Control).
 * Level 2  AI Business · AI Identity | AI Knowledge Graph | AI Superagent — one shared
 *          business context, orchestrated by the Superagent across 100 AI employees.
 */

export const OS = {
  name: 'Neuronium',
  category: 'AI Operating System',
  tagline: 'Run AI Business with AI Operating System.',
  governance: {
    name: 'AI Governance',
    functions: ['Policy', 'Access', 'Oversight', 'Control'],
  },
} as const

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
