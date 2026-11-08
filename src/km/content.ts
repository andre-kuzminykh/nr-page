/**
 * The AI Knowledge Management page: what it says. Taken from the feature's description
 * (NR Management · feature M5 · “Knowledge & Insight”), in plain words. The example reports use the
 * product's demo workspace (its goals, tasks and people are samples).
 */

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
  /** progress against plan: value and the level expected by now */
  chart?: { label: string; value: number; expected: number }[]
  findings: Finding[]
  limits: string[]
  sources: string[]
  /** labels of the report's parts, in the language of the request */
  words: { findings: string; limits: string; sources: string; expected: string }
}

const EN = { findings: 'Findings', limits: 'Limitations', sources: 'Sources', expected: 'expected' }
const RU = { findings: 'Находки', limits: 'Ограничения', sources: 'Источники', expected: 'ожидается' }

export const SCENARIOS: Scenario[] = [
  {
    id: 'cause',
    template: 'Why is a goal at risk',
    query: 'Why is Cyprus AI market review at risk?',
    intent: 'cause',
    walked: 46,
    title: 'Root-cause report — Cyprus AI market review',
    prepared: 'Prepared for Operator — workspace owner · 07.11.2026',
    summary: 'Cyprus AI market review: at risk — 33% done against 60% expected by elapsed time (−27 pp).',
    figures: [
      { value: 33, unit: '%', label: 'Progress', tone: 'warn' },
      { value: -27, unit: ' pp', label: 'Against plan', tone: 'bad' },
      { value: 4, label: 'Days to deadline', tone: 'warn' },
      { value: 7, label: 'Sources', tone: 'plain' },
    ],
    chart: [{ label: 'Cyprus AI market review', value: 33, expected: 60 }],
    findings: [
      { status: 'Calculated', text: 'At risk: 33% done against 60% expected by elapsed time — by the goal rules of Goals.', cites: ['c1', 'c2'] },
      { status: 'Confirmed', text: 'Open work under the goal: Draft the article, Proofread & publish.', cites: ['c3', 'c4'] },
    ],
    limits: ['No Decision records: the Ideas & Decisions module is not connected yet.'],
    sources: ['Goal · Cyprus AI market review · progress', 'Rule · goal verdict', 'Task · Draft the article', 'Task · Proofread & publish'],
    words: EN,
  },
  {
    id: 'overview',
    template: 'Company overview',
    query: 'Company overview report',
    intent: 'overview',
    walked: 58,
    title: 'Company report — Neuronium',
    prepared: 'Prepared for Operator — workspace owner · 07.11.2026',
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
    limits: ['Not connected yet: team pulse (HR), market share, profit, bugs, uptime — their modules are not connected.'],
    sources: ['Goals · all', 'Tasks · by status', 'People · workspace'],
    words: EN,
  },
  {
    id: 'sum',
    template: 'Work in progress',
    query: 'How many tasks are in progress?',
    intent: 'sum',
    walked: 31,
    title: 'Calculation report',
    prepared: 'Prepared for Operator — workspace owner · 07.11.2026',
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
    template: 'Profit (not connected)',
    query: 'Какая прибыль за прошлый месяц?',
    intent: 'sum',
    walked: 12,
    title: 'Расчёт',
    prepared: 'Подготовлено для Operator — workspace owner · 07.11.2026',
    summary: 'Цифры нет: записи «Прибыль и маржа» приходят из модуля «Финансы», который ещё не подключён.',
    figures: [],
    findings: [],
    limits: ['Записи «Прибыль и маржа» приходят из модуля «Финансы», который ещё не подключён.'],
    sources: [],
    words: RU,
  },
]

/** The four stages a report goes through before it arrives. */
export const STAGES = ['Understanding the request', 'Walking the company graph', 'Calculating', 'Composing the report']

/** How it works: GraphRAG, step by step. */
export const PIPELINE = [
  { n: '01', title: 'Understand', text: 'What is asked: how much, why, what effect, how it is going, or what is linked.' },
  { n: '02', title: 'Link', text: 'The request is tied to records and entity types of your company’s ontology.' },
  { n: '03', title: 'Walk the graph', text: 'Through the typed knowledge graph — only through what the reader may see.' },
  { n: '04', title: 'Calculate', text: 'What needs counting is counted, by named rules.' },
  { n: '05', title: 'Compose', text: 'A report is written from what was found — with its sources.' },
]

/** Ask in your own words: what kind of question becomes what kind of report. */
export const INTENTS = [
  { ask: 'Why is Triage inbox paused?', ru: 'Почему задача на паузе?', report: 'Root-cause report', note: 'stored reasons, the rule behind a verdict, the open work' },
  { ask: 'How much do we owe Lena Stone?', ru: 'Сколько мы должны исполнителям?', report: 'Calculation report', note: 'a count, or money summed per currency' },
  { ask: 'What is the progress of the goals?', ru: 'Какой прогресс у цели?', report: 'Status report', note: 'progress, verdict, deviation, days to deadline' },
  { ask: 'What tasks does MK own?', ru: 'Кто держит роль Designer?', report: 'Records report', note: 'what is linked, and the field the link lives in' },
  { ask: 'What effect did the campaign have?', ru: 'Какой эффект дала задача?', report: 'Effect assessment', note: 'never claimed without measurements' },
  { ask: 'Company overview', ru: 'Отчёт по компании', report: 'Company report', note: 'goals, work, people, bookings, money, processes' },
]

export const TEMPLATES = ['Company overview', 'Goals status', 'Why is a goal at risk', 'Work in progress', 'Bookings', 'What we owe', 'Process steps', 'Profit (not connected)']

/** The company ontology: 27 domains (0–26). */
export const DOMAINS: { name: string; types: string }[] = [
  { name: 'Company & counterparties', types: 'Company, Legal entity, Direction, Team, Person, Organisation, Counterparty, Client' },
  { name: 'People, roles & responsibility', types: 'Executor, Role, Role assignment, Responsibility' },
  { name: 'Market', types: 'Market, Market share, Segment, Buyer persona, User class, Need, Research, Competitor, Comparison' },
  { name: 'Product', types: 'Product, Feature, Use case, Value proposition' },
  { name: 'Commercial offer', types: 'Offer, Plan, Price, Terms revision' },
  { name: 'Goals & metrics', types: 'Goal, Key result, Metric, Measurement, KPI' },
  { name: 'Ideas, hypotheses & decisions', types: 'Observation, Insight, Idea, Hypothesis, Decision, Experiment' },
  { name: 'Requirements', types: 'Requirement, PRD / BRD / TRD, Client request, Acceptance criteria' },
  { name: 'Projects & tasks', types: 'Project, Assignment, Project stage, Task, Work session, Risk, Budget' },
  { name: 'Processes', types: 'Process, Stage, Process version, Operation, Process run, Operation run' },
  { name: 'Marketing', types: 'Strategy, Campaign, Customer journey, Touchpoint' },
  { name: 'SMM & content', types: 'Content plan, Material, Publication, Channel, Subscriber' },
  { name: 'Sales', types: 'Prospect, Lead, Qualification, Outreach sequence, Deal' },
  { name: 'Communication & meetings', types: 'Conversation, Message, Calendar event, Booking, Meeting, Minutes' },
  { name: 'Design', types: 'Design, Prototype, Landing page, Usability check, Design system' },
  { name: 'Development', types: 'System, Specification, Code change, Review, Test case, Test run, Build, Release, Deployment, Feature release, User, Usage event' },
  { name: 'Engineering', types: 'Environment, Component, Pipeline, Alert, SLO, Availability, Vulnerability, Incident, Backup, Restore check' },
  { name: 'Support', types: 'Ticket, Bug, Feature request, FAQ' },
  { name: 'HR', types: 'Position, Invitation, Vacancy, Candidate, Employment, Absence, Development plan, Course, Skill assessment, Performance review, Wellbeing survey' },
  { name: 'Partnerships', types: 'Partnership, Referral, Commission, Payout' },
  { name: 'Procurement', types: 'Purchase request, Supplier, Supplier offer, Purchase order, Receipt, Supplier invoice' },
  { name: 'Contracts, orders & subscriptions', types: 'Contract, Order, Subscription, Entitlement' },
  { name: 'Finance', types: 'Accrual, Invoice, Payment, Revenue, Costs, Profit & margin, Refund' },
  { name: 'Data', types: 'Data source, Dataset, Processing, Data asset, Forecast' },
  { name: 'Documents, knowledge & reports', types: 'Document, Revision, Source fragment, Report, Regulation, Signature, Note' },
  { name: 'Automation', types: 'Event, Rule, Automation run, Approval' },
  { name: 'Graph rules', types: 'Identifiers, links, statuses, access, answers — built into how the graph behaves' },
]

/** Honest gaps: instead of a made-up number, the report says what is missing and why. */
export const GAPS = [
  { code: 'Module not connected', text: '“What was profit last month?” — Profit & margin records come from the Finance module, which is not connected yet.' },
  { code: 'No records', text: 'The type is kept, but there are no records you can see.' },
  { code: 'No links', text: 'The record is there, but not the link the question needs.' },
  { code: 'No decisions', text: 'A “why” with no Decision records says so instead of guessing.' },
  { code: 'No measurements', text: 'An effect is never claimed without measurements and a way to compare.' },
  { code: 'Not recognised', text: 'No record, type or filter in the request — it asks again rather than invents.' },
]

/** Who is reading changes what the graph holds. */
export const VIEWERS = [
  {
    id: 'operator',
    name: 'Operator',
    role: 'workspace owner',
    sees: 'Everything.',
    answer: { kind: 'sum' as const, text: 'Sum of 1 accrual record linked to Lena Stone: 300.00 EUR — to pay 300.00 EUR, paid 0.' },
  },
  {
    id: 'delivery',
    name: 'Delivery team member',
    role: 'workspace and the Delivery process',
    sees: 'People, but not bookings, prices or money.',
    answer: { kind: 'gap' as const, text: 'No amount: money records are outside what you may see, so they never entered your graph.' },
  },
  {
    id: 'sales',
    name: 'Sales — MK',
    role: 'workspace and the Sales funnel',
    sees: 'The workspace and the Sales funnel process.',
    answer: { kind: 'gap' as const, text: 'No amount: accruals and payments are outside your access.' },
  },
]

/** Who uses it for what — each a request and the report it gets (from the product's examples). */
export const USE_CASES = [
  { who: 'Monday review', ask: 'Company overview report', report: 'Company report', result: '3 goals at 19% on average, 2 off plan; 11 open tasks; 4 people' },
  { who: 'A goal slips', ask: 'Why is Cyprus AI market review at risk?', report: 'Root-cause report', result: '−27 pp against plan, 4 days to deadline, and the open work under it' },
  { who: 'Paying executors', ask: 'How much do we owe Lena Stone?', report: 'Calculation report', result: '300.00 EUR to pay, 0 paid — summed per currency' },
  { who: 'Daily stand-up', ask: 'How many tasks are in progress?', report: 'Calculation report', result: '3 tasks in progress, each with its source' },
  { who: 'Who does what', ask: 'What tasks does MK own?', report: 'Records report', result: 'Maria Kovacs → owns → Cyprus bank AI audit, Fund portfolio demo' },
  { who: 'Before a decision', ask: 'What effect did Collect market sources have?', report: 'Effect assessment', result: 'Execution is recorded, not a measured result — no effect is claimed' },
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
    a: 'From your company’s knowledge graph — goals, tasks, processes, people, bookings and money records. What is counted is counted by named rules, and every confirmed claim links to its source.',
  },
  {
    q: 'What if the data is not there?',
    a: 'The report says so. A missing module, record, link or measurement becomes a limitation with its reason — never a made-up number.',
  },
  {
    q: 'Who sees what?',
    a: 'Rights are given to a person, a team or a role. Records outside a reader’s rights never enter their graph: they cannot be found, counted or quoted.',
  },
  {
    q: 'What can it answer today?',
    a: 'Everything Management keeps: goals, tasks, directions, processes and their stages, people and roles, bookings, accruals and payments. The other entity types are recognised and answered with an honest gap until their module connects.',
  },
  { q: 'Can I print a report?', a: 'Yes — every report has Print; the printed copy leaves out shadows and frames.' },
  {
    q: 'How much does it cost?',
    a: 'It comes with every plan: Own model $19 a month, Solo from $59, Team from $290 — each with a free trial. For more than 10 people, Scale is priced with you.',
  },
]
