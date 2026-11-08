/**
 * The AI Knowledge Management page: what it says. Taken from the feature's description
 * (NR Management · feature M5 · “Knowledge & Insight”), in plain words. The example reports use the
 * product's demo workspace (its goals, tasks and people are samples).
 */

import { WORKFORCE_HOUR } from '../data/pricing'

export type Tone = 'ok' | 'warn' | 'bad' | 'plain'
export type Status = 'Calculated' | 'Confirmed' | 'Hypothesis'

export interface Figure {
  value: number
  /** shown after the number, e.g. “%” or “ pp” */
  unit?: string
  /** a sign in front of a positive number */
  plus?: boolean
  label: string
  tone: Tone
}

export interface Finding {
  status: Status
  text: string
  cites: string[]
}

export interface Scenario {
  id: string
  /** the template's name */
  template: string
  query: string
  intent: 'cause' | 'sum' | 'status' | 'lookup' | 'effect' | 'overview'
  /** how many records the walk through the company graph takes in */
  walked: number
  title: string
  prepared: string
  summary: string
  figures: Figure[]
  /** progress against plan: value and the level expected by now (one: a ring; more: bars) */
  chart?: { label: string; value: number; expected: number }[]
  findings: Finding[]
  limits: string[]
  sources: string[]
  /** labels of the report's parts, in the language of the request */
  words: { findings: string; limits: string; sources: string; expected: string }
  /** How it works plays it step by step: what it recognises in the words, the records it walks, what it counts */
  how?: {
    marks: { text: string; as: string }[]
    walk: string[]
    calc: { items: { v: string; l: string }[]; result: { v: string; l: string } }
  }
}

const EN = { findings: 'Findings', limits: 'Limitations', sources: 'Sources', expected: 'expected' }

export const SCENARIOS: Scenario[] = [
  {
    id: 'cause',
    template: 'Why is a goal at risk',
    query: 'Why is the Cyprus AI market review at risk?',
    intent: 'cause',
    walked: 46,
    title: 'Root-cause report — Cyprus AI market review',
    prepared: 'Prepared for Operator, workspace owner · Nov 7, 2026',
    summary: 'Cyprus AI market review is at risk: 33% done against 60% expected by elapsed time (−27 pp).',
    figures: [
      { value: -27, unit: ' pp', label: 'Against plan', tone: 'bad' },
      { value: 4, label: 'Days to deadline', tone: 'warn' },
      { value: 7, label: 'Sources', tone: 'plain' },
    ],
    chart: [{ label: 'Done', value: 33, expected: 60 }],
    findings: [
      { status: 'Calculated', text: 'At risk: 33% done against 60% expected by elapsed time, by the goal rules.', cites: ['c1', 'c2'] },
      { status: 'Confirmed', text: 'Open work under the goal: Draft the article, Proofread & publish.', cites: ['c3', 'c4'] },
    ],
    limits: ['No Decision records: the Ideas & Decisions module is not connected yet.'],
    sources: ['Goal · Cyprus AI market review · progress', 'Rule · goal verdict', 'Task · Draft the article', 'Task · Proofread & publish'],
    words: EN,
    how: {
      marks: [
        { text: 'Why', as: 'Root cause' },
        { text: 'Cyprus AI market review', as: 'Goal' },
        { text: 'at risk', as: 'Verdict' },
      ],
      walk: ['cyprus', 'draft', 'proof', 'sources'],
      calc: { items: [{ v: '33%', l: 'done' }, { v: '60%', l: 'expected by now' }], result: { v: '−27 pp', l: 'at risk' } },
    },
  },
  {
    id: 'overview',
    template: 'Company overview',
    query: 'Company overview report',
    intent: 'overview',
    walked: 58,
    title: 'Company report — Neuronium',
    prepared: 'Prepared for Operator, workspace owner · Nov 7, 2026',
    summary: '3 goals at 19% on average, 2 off plan; 11 open tasks; 4 people.',
    figures: [
      { value: 19, unit: '%', label: 'Average progress', tone: 'warn' },
      { value: 2, label: 'Goals off plan', tone: 'bad' },
      { value: 11, label: 'Open tasks', tone: 'plain' },
      { value: 4, label: 'People', tone: 'ok' },
    ],
    chart: [
      { label: 'Launch Neuronium 1.0', value: 25, expected: 29 },
      { label: 'Cyprus AI market review', value: 33, expected: 60 },
    ],
    findings: [
      { status: 'Calculated', text: 'Goals: 3, 19% on average; 2 off plan.', cites: ['c1'] },
      { status: 'Confirmed', text: 'Work: 11 open tasks across the board’s processes.', cites: ['c2', 'c3'] },
    ],
    limits: ['Not connected yet: team pulse (HR), market share, profit, bugs, uptime. Their modules come later.'],
    sources: ['Goals · all', 'Tasks · by status', 'People · workspace'],
    words: EN,
    how: {
      marks: [
        { text: 'Company', as: 'Whole workspace' },
        { text: 'overview report', as: 'Company report' },
      ],
      walk: ['launch', 'cyprus', 'demo', 'draft', 'proof', 'sources', 'am', 'mk', 'ls'],
      calc: { items: [{ v: '3', l: 'goals' }, { v: '19%', l: 'average progress' }], result: { v: '2', l: 'goals off plan' } },
    },
  },
  {
    id: 'sum',
    template: 'Work in progress',
    query: 'How many tasks are in progress?',
    intent: 'sum',
    walked: 31,
    title: 'Calculation report',
    prepared: 'Prepared for Operator, workspace owner · Nov 7, 2026',
    summary: 'Counted 3 task records with status in progress.',
    figures: [
      { value: 3, label: 'Records', tone: 'ok' },
      { value: 3, label: 'Sources', tone: 'plain' },
    ],
    findings: [
      { status: 'Calculated', text: 'In progress: Draft the article, Cyprus bank AI audit, Fund portfolio demo.', cites: ['c1', 'c2', 'c3'] },
    ],
    limits: [],
    sources: ['Task · Draft the article · status', 'Task · Cyprus bank AI audit · status', 'Task · Fund portfolio demo · status'],
    words: EN,
  },
  {
    id: 'gap',
    template: 'Profit',
    query: 'What was profit last month?',
    intent: 'sum',
    walked: 12,
    title: 'Calculation report',
    prepared: 'Prepared for Operator, workspace owner · Nov 7, 2026',
    summary: 'No figure: Profit & margin records come from the Finance module, which is not connected yet.',
    figures: [],
    findings: [],
    limits: ['Profit & margin records come from the Finance module, which is not connected yet. No number is made up in its place.'],
    sources: [],
    words: EN,
  },
  {
    id: 'owe',
    template: 'What we owe',
    query: 'How much do we owe Lena Stone?',
    intent: 'sum',
    walked: 12,
    title: 'Calculation report — Lena Stone',
    prepared: 'Prepared for Operator, workspace owner · Nov 7, 2026',
    summary: 'Sum of 1 accrual record linked to Lena Stone: 300.00 EUR to pay, nothing paid yet.',
    figures: [
      { value: 300, unit: ' EUR', label: 'To pay', tone: 'warn' },
      { value: 0, unit: ' EUR', label: 'Paid', tone: 'plain' },
      { value: 1, label: 'Accrual', tone: 'plain' },
    ],
    findings: [
      { status: 'Calculated', text: 'To pay: 300.00 EUR, summed per currency from 1 accrual record.', cites: ['c1'] },
      { status: 'Confirmed', text: 'The accrual is based on her booking as a designer.', cites: ['c1', 'c2'] },
    ],
    limits: [],
    sources: ['Accrual · 300.00 EUR', 'Booking · Lena Stone'],
    words: EN,
    how: {
      marks: [
        { text: 'How much', as: 'Sum' },
        { text: 'owe', as: 'Accruals' },
        { text: 'Lena Stone', as: 'Person' },
      ],
      walk: ['ls', 'book', 'acc'],
      calc: { items: [{ v: '300.00 EUR', l: 'to pay' }, { v: '0.00 EUR', l: 'paid' }], result: { v: '300.00 EUR', l: 'owed' } },
    },
  },
]

/** The page's own questions. */
export const KM_FAQ: { q: string; a: string }[] = [
  {
    q: 'What is AI Knowledge Management?',
    a: 'A report generator over your company’s knowledge. Ask in your own words or pick a template, and get a document: a summary, key figures, a chart against plan, findings, limitations and numbered sources.',
  },
  { q: 'Which languages can I ask in?', a: 'English and Russian. The report comes in the language you asked in.' },
  {
    q: 'Where do the numbers come from?',
    a: 'From your company’s knowledge graph: goals, tasks, processes, people, bookings and money records. Counts follow named rules, and every confirmed claim links to its source.',
  },
  {
    q: 'What if the data is not there?',
    a: 'The report says so. A missing module, record, link or measurement becomes a limitation with its reason. It never makes up a number.',
  },
  {
    q: 'Who sees what?',
    a: 'Rights are given to a person, a team or a role. Records outside a reader’s rights never enter their graph: they cannot be found, counted or quoted.',
  },
  {
    q: 'What can it answer today?',
    a: 'Everything Management keeps: goals, tasks, directions, processes and their stages, people and roles, bookings, accruals and payments. The other entity types are recognised and answered with an honest gap until their module connects.',
  },
  { q: 'Can I print a report?', a: 'Yes. Every report has Print, and the printed copy leaves out shadows and frames.' },
  {
    q: 'How much does it cost?',
    a: 'It comes with every plan: Own model at $19 a month, Solo from $59, Team from $290, each with a free trial. For more than 10 people, Scale is priced with you.',
  },
  {
    q: 'What is an AI Workforce hour?',
    a: `${WORKFORCE_HOUR} Solo comes with 300, 500 or 1\u00a0000 of them, Team with 3\u00a0000, 5\u00a0000 or 10\u00a0000, depending on the model level.`,
  },
]
