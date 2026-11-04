/**
 * Neuronium — 10 departments × 10 AI employees = 100 AI employees.
 *
 * Each AI employee is drawn as a chemical element: its number (1–100) is its
 * "atomic number" and it has a unique symbol. Neuronium itself is element 0 (Nr).
 * Order matters: it drives the periodic table rows and the 1–100 numbering.
 *
 * `availability` separates confirmed product functionality from planned scope.
 * Nothing is marked as released until it is confirmed — see README → "Availability".
 */

export type DepartmentId =
  | 'management'
  | 'hr'
  | 'marketing'
  | 'smm'
  | 'sales'
  | 'support'
  | 'analytics'
  | 'design'
  | 'development'
  | 'engineering'

/**
 * - `available`       — confirmed, released functionality
 * - `in-development`  — confirmed as being built
 * - `planned`         — confirmed as planned
 * - `scope`           — part of the intended product scope; release status not confirmed
 */
export type Availability = 'available' | 'in-development' | 'planned' | 'scope'

export interface AIEmployee {
  /** 1–100 — the element's atomic number. */
  n: number
  /** Unique element symbol (never "Nr", which belongs to Neuronium). */
  symbol: string
  name: string
  description: string
  department: DepartmentId
  availability: Availability
}

export interface Department {
  id: DepartmentId
  name: string
  /** Two-line headline of the department's block. */
  headline: [string, string]
  description: string
  members: AIEmployee[]
}

type Row = [symbol: string, name: string, description: string]

const define = (
  index: number,
  id: DepartmentId,
  name: string,
  headline: [string, string],
  description: string,
  rows: Row[],
): Department => {
  if (rows.length !== 10) throw new Error(`${name} must define exactly 10 AI employees`)
  return {
    id,
    name,
    headline,
    description,
    members: rows.map(([symbol, roleName, text], i) => ({
      n: index * 10 + i + 1,
      symbol,
      name: roleName,
      description: text,
      department: id,
      availability: 'scope',
    })),
  }
}

export const DEPARTMENTS: Department[] = [
  define(
    0,
    'management',
    'Management',
    ['From goals and tasks', 'to your calendar.'],
    'Goals, tasks, projects, meetings and the team in one registry — synced with your Google tools.',
    [
      ['Km', 'Knowledge Management', 'Answers from a search across your knowledge base, including Google Drive — and live, during a Google Meet call.'],
      ['Nt', 'Note Taking', 'After a Google Meet, collects notes with decisions and a task list — in Google Drive, as Google Keep notes and Google Docs.'],
      ['Gm', 'Goals Management', 'Sets goals from your products, business directions and projects.'],
      ['Tm', 'Task Management', 'Keeps the task list by goal, with Pomodoro and the Eisenhower Matrix — as Google Tasks and Google Sheets.'],
      ['Ps', 'Process Management', 'A Kanban board with your own stages, tasks and assignees, filters by goal and product, and daily, weekly and monthly reports.'],
      ['Pj', 'Project Management', 'A Gantt chart that tracks projects by goal and product, shows their tasks, filters by assignee and reports daily, weekly and monthly.'],
      ['Pd', 'Product Management', 'Defines customers, their problems and solutions with a business model, builds a knowledge base for each product and a strategy across products — with daily, weekly and monthly reports.'],
      ['Cl', 'Calendar Management', 'An endless calendar with every meeting and task, also in Google Calendar.'],
      ['Cm', 'Communication Management', 'Connects email (including Gmail), Telegram, Slack and WhatsApp to build daily reports and task lists.'],
      ['Te', 'Team Management', 'People profiles with roles and role-based tasks, KPIs for processes and OKRs for projects — with daily, weekly and monthly reports.'],
    ],
  ),
  define(
    1,
    'hr',
    'HR',
    ['The skills you need.', 'Grown or hired.'],
    'Define the role and its skills, find and interview candidates, onboard them — and keep developing the team.',
    [
      ['Jd', 'Job Description', 'Define roles, responsibilities, expected outcomes and requirements.'],
      ['Cs', 'Candidates Search', 'Find candidates that match role requirements and talent profiles.'],
      ['Cv', 'CV Screening', 'Review CVs for role alignment, experience and relevant qualifications.'],
      ['Iv', 'Candidate Interview', 'Prepare and conduct structured candidate interviews.'],
      ['Ob', 'Employee Onboarding', 'Create personalized introductions, checklists and onboarding plans.'],
      ['Es', 'Employee Support', 'Answer questions and support employees in their day-to-day work.'],
      ['Sh', 'Employee Schedule', 'Coordinate working schedules, availability and workloads.'],
      ['We', 'Employee Wellbeing', 'Support work-life balance and surface workload-related concerns.'],
      ['Ed', 'Employee Development', 'Identify growth areas and build personalized learning plans.'],
      ['Rv', 'Performance Review', 'Review results and performance against defined expectations.'],
    ],
  ),
  define(
    2,
    'marketing',
    'Marketing',
    ['From a business idea', 'to a product concept.'],
    'Research the market, competitors and customers — then shape positioning, the business model, brand and go-to-market.',
    [
      ['Md', 'Market Discovery', 'Explore markets, product categories, existing offers, alternatives and opportunities.'],
      ['Ca', 'Competitor Analysis', 'Analyze specific competitors’ products, features, positioning, changes and strategies — once, or regularly for chosen competitors and categories.'],
      ['Cd', 'Customer Discovery', 'Study customers and segments — their needs, problems, motivations and potential demand.'],
      ['Pp', 'Product Positioning', 'Connect customer pain, jobs to be done and competitive context into a differentiated value proposition.'],
      ['Bm', 'Business Model', 'Structure value creation, delivery, monetization and business assumptions.'],
      ['Bb', 'Brand Book', 'Establish identity, messaging, archetypes, visuals and brand voice.'],
      ['Gt', 'Go-to-Market Strategy', 'Define priority segments, channels, launches, campaigns and distribution logic.'],
      ['Cj', 'Customer Journey Map', 'Map the full customer journey and find friction across touchpoints.'],
      ['Ma', 'Marketing Analytics', 'Measure campaigns, engagement and acquisition, and find room to improve.'],
      ['Vc', 'Voice of Customer', 'Structure customer feedback and observations into actionable insights.'],
    ],
  ),
  define(
    3,
    'smm',
    'SMM',
    ['Content for every', 'social channel.'],
    'Plan, write, design, film and publish — then answer comments and learn from the audience.',
    [
      ['Ch', 'Channels Analysis', 'Audit channel performance, formats, audiences and publishing patterns.'],
      ['Cp', 'Content Plan', 'Build an editorial calendar with campaigns, formats, audiences and schedules.'],
      ['Bl', 'Web Blog', 'Produce and manage editorial articles and website publications.'],
      ['Tg', 'Text Generation', 'Write channel-specific copy, headlines, summaries and calls to action.'],
      ['Ig', 'Image Generation', 'Generate original, on-brand visual assets for published content.'],
      ['Vg', 'Video Generation', 'Generate video assets for product stories and campaigns.'],
      ['Vd', 'Video Creation', 'Assemble videos and shorts from scripts, footage, voice and visual materials.'],
      ['Ap', 'Auto Posting', 'Schedule and publish to connected channels under configured rules.'],
      ['Ct', 'Comments Management', 'Moderate, classify and answer audience comments, escalating when needed.'],
      ['Au', 'Audience Insights', 'Analyze reactions and engagement to strengthen the next content.'],
    ],
  ),
  define(
    4,
    'sales',
    'Sales',
    ['Sales, organized.', 'First contact to purchase.'],
    'Find the right companies, write to each one personally, qualify, book meetings — and see the whole funnel.',
    [
      ['Of', 'Offers & Product Catalog', 'Creates product cards — description, price, value, target segments, cases and FAQ — and base offers for each audience.'],
      ['Ad', 'Audience Discovery', 'Finds companies and contacts in Apollo by your criteria, takes your own lists and removes duplicates and poor fits.'],
      ['Pr', 'Prospect Research', 'Studies the company’s website and available data, finds its needs and where your product fits. Keeps facts and sources.'],
      ['Sq', 'Personalized Sequences', 'Writes the subject and first email, then every follow-up, for each prospect and offer. Each email can be checked and edited.'],
      ['Eo', 'Email Outreach', 'Sends on schedule through connected mailboxes, spreads the load, and stops a sequence on a reply, an unsubscribe or an invalid address.'],
      ['Sc', 'Sales Conversations', 'Handles replies in email, Telegram and WhatsApp: answers questions and objections, keeps the history and hands over to a person when needed.'],
      ['Lq', 'Lead Qualification', 'Finds out the class of business, then the segment, the right product and the next step. You define the classes — for example small and medium business — and the products for each.'],
      ['Li', 'LinkedIn Outreach Assistant', 'Prepares personal invitations, messages, follow-ups and replies with the prospect’s context. The salesperson pastes their reply, gets an answer drafted and sends it manually.'],
      ['Ms', 'Meeting Scheduling', 'Sends a calendar of open Google Calendar slots in the prospect’s time zone, books a Google Meet and handles reschedules and cancellations.'],
      ['Sa', 'Sales Analytics', 'A funnel by channel, segment and offer — contacts, sends, replies, qualification, meetings, purchases — with costs, acquisition cost and revenue once payments are connected.'],
    ],
  ),
  define(
    5,
    'support',
    'Support',
    ['Support', 'on every channel.'],
    'Answers from verified knowledge on email, web and messengers — and every problem turned into a bug report or feature request.',
    [
      ['Fq', 'FAQ Answers', 'Resolve common questions using verified product knowledge.'],
      ['Em', 'Email Support', 'Handle support email with contextual answers and follow-ups.'],
      ['Ws', 'Web Support', 'Assist users on the website and route unresolved requests.'],
      ['Mg', 'Messenger Support', 'Answer questions across connected messaging channels.'],
      ['Tk', 'Ticket Management', 'Track ticket owners, priorities, states, history and resolutions.'],
      ['Cf', 'Classification', 'Classify requests by intent, urgency, issue type and destination.'],
      ['Bg', 'Bug Reporting', 'Turn reported problems into structured, reproducible bug reports.'],
      ['Fr', 'Feature Request', 'Capture customer ideas with context, demand and expected benefit.'],
      ['Sl', 'Second-Line Escalation', 'Pass difficult cases to the right human or technical specialist.'],
      ['Sp', 'Support Analysis', 'Analyze recurring issues, satisfaction signals and opportunities to improve.'],
    ],
  ),
  define(
    6,
    'analytics',
    'Analytics',
    ['Research, requirements', 'and decisions.'],
    'Deep research and business analysis, written up as PRD, BRD and TRD — with data, risks and options to decide on.',
    [
      ['Dr', 'Deep Research', 'Synthesize sourced information, evidence and findings about a domain.'],
      ['Ba', 'Business Analysis', 'Study current work, stakeholders, processes and the change that is needed.'],
      ['Prd', 'PRD', 'Define product goals, functionality, constraints and success criteria.'],
      ['Brd', 'BRD', 'Formalize business requirements, policies and acceptance expectations.'],
      ['Trd', 'TRD', 'Translate business goals into technical and non-functional requirements.'],
      ['Bk', 'Backlog Refinement', 'Break work into clear, prioritized, testable backlog items.'],
      ['Rk', 'Risk Analysis', 'Identify risks, assumptions, dependencies and mitigation actions.'],
      ['Da', 'Data Analysis', 'Explore business data and uncover useful patterns and relationships.'],
      ['Ar', 'Analytical Report', 'Deliver structured, evidence-based reports and visual summaries.'],
      ['Di', 'Decision Intelligence', 'Compare options and trade-offs to support better business decisions.'],
    ],
  ),
  define(
    7,
    'design',
    'Design',
    ['From design system', 'to tested prototype.'],
    'Creative directions, design systems, presentations and landing pages — then flows, interfaces and prototypes tested with simulated users.',
    [
      ['Cg', 'Creative Generation', 'Produce creative directions and visual assets for a brand or product.'],
      ['Ds', 'Design System', 'Build reusable design tokens, components and interaction rules.'],
      ['Pt', 'Presentation Creation', 'Turn business narratives and evidence into coherent presentations.'],
      ['Lp', 'Landing Page', 'Design landing pages grounded in positioning and customer needs.'],
      ['Uf', 'User Flow', 'Map steps, decisions, edge cases and transitions across journeys.'],
      ['Ux', 'User Experience', 'Design useful, understandable end-to-end product experiences.'],
      ['Ui', 'User Interface', 'Design interaction patterns and screen-level UI.'],
      ['Pa', 'Application Prototype', 'Create interactive prototypes for user and business validation.'],
      ['Us', 'User Simulation', 'Simulate representative journeys to find friction before launch.'],
      ['Ua', 'Usability Analysis', 'Find usability issues and prioritize improvements from observed or tested use.'],
    ],
  ),
  define(
    8,
    'development',
    'Development',
    ['Code written,', 'tested and reviewed.'],
    'Frontend, backend, data, AI features and integrations — with automated tests, debugging, refactoring and code review.',
    [
      ['Cb', 'Codebase Analysis', 'Inspect architecture, dependencies, quality and the impact of code changes.'],
      ['Fe', 'Frontend Development', 'Build and maintain user-facing web application interfaces.'],
      ['Be', 'Backend Development', 'Implement application logic, APIs and business services.'],
      ['Db', 'Database Development', 'Design and evolve data models, storage and queries.'],
      ['Ai', 'AI Development', 'Create AI-driven features, agents and model integrations.'],
      ['In', 'Integration Development', 'Connect internal and external services, APIs and event flows.'],
      ['At', 'Automated Testing', 'Generate and run tests that check correctness and prevent regressions.'],
      ['Dg', 'Debugging', 'Investigate errors, reproduce defects and fix their underlying causes.'],
      ['Rf', 'Refactoring', 'Improve code structure without changing intended behavior.'],
      ['Cr', 'Code Review', 'Review code for quality, security, maintainability and architecture.'],
    ],
  ),
  define(
    9,
    'engineering',
    'Engineering',
    ['Ship safely.', 'Stay up.'],
    'Access, infrastructure, platform, security, network and performance — with CI/CD, backups, monitoring and incident response.',
    [
      ['Ac', 'Access Management', 'Manage permissions, identities and least-privilege service access.'],
      ['If', 'Infrastructure Engineering', 'Provision and manage infrastructure as code.'],
      ['Pl', 'Platform Engineering', 'Maintain application environments, runtime platforms and services.'],
      ['Se', 'Security Engineering', 'Apply technical safeguards, secrets handling and security controls.'],
      ['Ne', 'Network Engineering', 'Configure and monitor network connectivity and boundaries.'],
      ['Pe', 'Performance Engineering', 'Measure performance and capacity, and remove efficiency bottlenecks.'],
      ['Ci', 'CI/CD', 'Automate verified builds, delivery pipelines and deployment workflows.'],
      ['Bu', 'Backup & Recovery', 'Define backups, restore procedures and recovery readiness.'],
      ['Sm', 'System Monitoring', 'Observe uptime, service health, logs, metrics and anomalies.'],
      ['Im', 'Incident Management', 'Detect, triage, resolve and learn from operational incidents.'],
    ],
  ),
]

export const AI_EMPLOYEES: AIEmployee[] = DEPARTMENTS.flatMap((d) => d.members)

export const departmentById = (id: DepartmentId): Department => {
  const found = DEPARTMENTS.find((d) => d.id === id)
  if (!found) throw new Error(`Unknown department ${id}`)
  return found
}

export const employeeByN = (n: number): AIEmployee => {
  const found = AI_EMPLOYEES[n - 1]
  if (!found) throw new Error(`Unknown AI employee ${n}`)
  return found
}

/** Department row (0–9) of an AI employee. */
export const rowOf = (n: number) => Math.floor((n - 1) / 10)

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
  scope: 'Product scope',
}
