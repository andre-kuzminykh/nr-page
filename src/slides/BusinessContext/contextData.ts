/**
 * Illustrative knowledge-graph slice and retrieval trails for the Business Context slide.
 * Sample entities only — not data from a real workspace.
 */
export interface KNode {
  id: string
  type: string
  label: string
  x: number
  y: number
}

export interface KEdge {
  from: string
  to: string
  label: string
}

export const K_NODES: KNode[] = [
  { id: 'goal', type: 'Goal', label: 'Launch MVP', x: 262, y: 44 },
  { id: 'product', type: 'Product', label: 'Mobile App', x: 440, y: 78 },
  { id: 'segment', type: 'Customers', label: 'Small Business', x: 452, y: 196 },
  { id: 'project', type: 'Project', label: 'MVP Release', x: 96, y: 112 },
  { id: 'task', type: 'Task', label: 'Backend & API', x: 250, y: 176 },
  { id: 'person', type: 'Person', label: 'Tech lead', x: 70, y: 252 },
  { id: 'doc', type: 'Document', label: 'PRD v1', x: 392, y: 300 },
  { id: 'decision', type: 'Decision', label: 'Payments after v1', x: 220, y: 330 },
  { id: 'meeting', type: 'Meeting', label: 'Weekly review', x: 60, y: 356 },
]

export const K_EDGES: KEdge[] = [
  { from: 'project', to: 'goal', label: 'advances' },
  { from: 'goal', to: 'product', label: 'for' },
  { from: 'product', to: 'segment', label: 'serves' },
  { from: 'task', to: 'project', label: 'part of' },
  { from: 'person', to: 'task', label: 'owns' },
  { from: 'task', to: 'doc', label: 'specified in' },
  { from: 'decision', to: 'doc', label: 'changes' },
  { from: 'decision', to: 'meeting', label: 'made in' },
]

export interface Trail {
  question: string
  nodes: string[]
  answer: string
}

export const TRAILS: Trail[] = [
  {
    question: 'What is the MVP launch waiting on?',
    nodes: ['goal', 'project', 'task', 'doc', 'decision'],
    answer: 'Backend & API — specified in PRD v1, which changed after the decision “Payments after v1”.',
  },
  {
    question: 'Who owns the backend work?',
    nodes: ['task', 'person'],
    answer: 'The Tech lead owns Backend & API.',
  },
  {
    question: 'Who is the product for?',
    nodes: ['goal', 'product', 'segment'],
    answer: 'Launch MVP is for the Mobile App, which serves Small Business customers.',
  },
  {
    question: 'Where was the payments decision made?',
    nodes: ['decision', 'meeting'],
    answer: 'In the Weekly review.',
  },
]

/** Integration surfaces referenced in the capability scope. Examples, not a list of shipped connectors. */
export const SOURCES: { group: string; items: string }[] = [
  { group: 'Google Workspace', items: 'Drive · Docs · Sheets · Calendar · Meet' },
  { group: 'Conversations', items: 'Email · Telegram · Slack · WhatsApp' },
  { group: 'Sales data', items: 'Apollo · uploaded lists' },
  { group: 'Engineering', items: 'Code repositories' },
  { group: 'Your systems', items: 'APIs · files · other MCP servers' },
]
