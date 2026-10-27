import type { EmployeeId } from '../../data/employees'

/**
 * An illustrative end-to-end example of existing AI Employees working together.
 * Not a separate product module, and not a claim that every hand-off is automated today.
 * Function names are exact capability names from the catalog.
 */
export interface FlowStage {
  employee: EmployeeId
  functions: string[]
  caption: string
}

export const FLOW: FlowStage[] = [
  {
    employee: 'marketing',
    functions: ['Market Discovery', 'Competitor Analysis', 'Customer Discovery'],
    caption: 'Marketing studies the market, competitors and customers, and frames the opportunity.',
  },
  {
    employee: 'management',
    functions: ['Product Management', 'Goals Management', 'Task Management'],
    caption: 'Management turns the opportunity into a product, goals and tasks in the one shared registry.',
  },
  {
    employee: 'analytics',
    functions: ['Deep Research', 'PRD', 'BRD', 'TRD'],
    caption: 'Analytics researches deeper and defines the product, business and technical requirements.',
  },
  {
    employee: 'design',
    functions: ['Landing Page', 'Application Prototype'],
    caption: 'Design makes the idea tangible: a landing page and an application prototype.',
  },
  {
    employee: 'sales',
    functions: ['Audience Discovery', 'Lead Qualification'],
    caption: 'Sales finds the audience and qualifies early leads to test demand.',
  },
  {
    employee: 'development',
    functions: ['Frontend Development', 'Backend Development', 'AI Development'],
    caption: 'Development builds the frontend, backend and AI features.',
  },
  {
    employee: 'engineering',
    functions: ['CI/CD', 'System Monitoring'],
    caption: 'Engineering ships through CI/CD and monitors the running system.',
  },
]

export const SIDE: FlowStage[] = [
  {
    employee: 'smm',
    functions: ['Content Plan', 'Web Blog', 'Auto Posting'],
    caption: 'SMM plans content, runs the blog and publishes updates along the way.',
  },
  {
    employee: 'support',
    functions: ['Bug Reporting', 'Feature Request'],
    caption: 'Support turns user problems and ideas into bug reports and feature requests — new tasks for Management.',
  },
]
