import type { EmployeeId } from '../../data/employees'

/**
 * Illustrative data for the AI Manager demo. Not connected to a production Neuronium
 * workspace. Every view (Registry, Kanban, Gantt, Calendar) reads these same objects.
 */

export type Stage = 'backlog' | 'progress' | 'review' | 'done'
export type Priority = 'P1' | 'P2' | 'P3'

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'progress', label: 'In progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

export const GOALS = [
  { id: 'g1', label: 'Validate demand' },
  { id: 'g2', label: 'Launch MVP' },
] as const

export const PRODUCTS = [
  { id: 'p1', label: 'Mobile App' },
  { id: 'p2', label: 'Web Platform' },
] as const

export const PROJECTS = [
  { id: 'pr1', label: 'Discovery' },
  { id: 'pr2', label: 'MVP Release' },
  { id: 'pr3', label: 'Launch' },
] as const

export type GoalId = (typeof GOALS)[number]['id']
export type ProductId = (typeof PRODUCTS)[number]['id']
export type ProjectId = (typeof PROJECTS)[number]['id']

export interface DemoTask {
  id: string
  title: string
  /** AI Employee doing the work */
  employee: EmployeeId
  /** Accountable person (a role, not a real individual) */
  owner: string
  goal: GoalId
  product: ProductId
  project: ProjectId
  stage: Stage
  priority: Priority
  /** Working-day offsets on a two-week timeline (0–9) */
  start: number
  end: number
  dependsOn: string[]
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const INITIAL_TASKS: DemoTask[] = [
  { id: 'T-101', title: 'Competitor analysis', employee: 'marketing', owner: 'Growth lead', goal: 'g1', product: 'p1', project: 'pr1', stage: 'done', priority: 'P2', start: 0, end: 1, dependsOn: [] },
  { id: 'T-102', title: 'Customer discovery synthesis', employee: 'marketing', owner: 'Growth lead', goal: 'g1', product: 'p1', project: 'pr1', stage: 'done', priority: 'P1', start: 0, end: 2, dependsOn: [] },
  { id: 'T-103', title: 'PRD v1', employee: 'analytics', owner: 'Product lead', goal: 'g2', product: 'p1', project: 'pr2', stage: 'progress', priority: 'P1', start: 2, end: 4, dependsOn: ['T-101', 'T-102'] },
  { id: 'T-104', title: 'Application prototype', employee: 'design', owner: 'Product lead', goal: 'g2', product: 'p1', project: 'pr2', stage: 'backlog', priority: 'P1', start: 5, end: 6, dependsOn: ['T-103'] },
  { id: 'T-105', title: 'Pilot audience list', employee: 'sales', owner: 'Growth lead', goal: 'g1', product: 'p1', project: 'pr3', stage: 'progress', priority: 'P2', start: 3, end: 5, dependsOn: ['T-102'] },
  { id: 'T-106', title: 'Backend & API', employee: 'development', owner: 'Tech lead', goal: 'g2', product: 'p1', project: 'pr2', stage: 'backlog', priority: 'P1', start: 5, end: 8, dependsOn: ['T-103'] },
  { id: 'T-107', title: 'CI/CD pipeline', employee: 'engineering', owner: 'Tech lead', goal: 'g2', product: 'p2', project: 'pr2', stage: 'backlog', priority: 'P3', start: 7, end: 9, dependsOn: ['T-106'] },
  { id: 'T-108', title: 'Launch content plan', employee: 'smm', owner: 'Growth lead', goal: 'g1', product: 'p2', project: 'pr3', stage: 'backlog', priority: 'P3', start: 6, end: 8, dependsOn: [] },
  { id: 'T-109', title: 'Landing page', employee: 'design', owner: 'Growth lead', goal: 'g1', product: 'p2', project: 'pr3', stage: 'review', priority: 'P2', start: 3, end: 4, dependsOn: ['T-102'] },
]

/** Meetings shown next to tasks in the Calendar view. */
export const MEETINGS = [
  { day: 0, time: '10:00', title: 'Weekly review' },
  { day: 3, time: '15:00', title: 'Pilot call' },
  { day: 5, time: '10:00', title: 'Weekly review' },
  { day: 8, time: '12:00', title: 'Prototype demo' },
]

/** The scripted hand-off: analysis finishes → design starts. */
export const SCRIPT: { after: number; id: string; stage: Stage; log: string }[] = [
  { after: 2200, id: 'T-103', stage: 'review', log: 'PRD v1 sent for review' },
  { after: 1900, id: 'T-103', stage: 'done', log: 'PRD v1 approved' },
  { after: 900, id: 'T-104', stage: 'progress', log: 'Application prototype unblocked → Design' },
]
