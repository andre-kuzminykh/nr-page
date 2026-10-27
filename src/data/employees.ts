/**
 * Neuronium — AI-First functional model.
 *
 * Canonical source: product brief, section 3 ("Precise functional responsibilities").
 * Exactly 10 AI Employees × exactly 10 capabilities = 100 capabilities.
 * Order matters: it drives the 2×5 grid (row 1: Management…Sales,
 * row 2: Support…Engineering) and the 1–100 numbering.
 *
 * These are AI Capabilities (functional scope), not necessarily 100 atomic AI Skills.
 * `availability` separates confirmed product functionality from planned scope.
 * Nothing is marked as released until it is confirmed — see README → "Availability".
 */

export type EmployeeId =
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

export interface Capability {
  /** Global number, 1–100 — its "atomic number". Neuronium itself (Nr) is element 0. */
  n: number
  /** Element symbol, unique across all 100 (never "Nr", which belongs to Neuronium). */
  symbol: string
  name: string
  description: string
  employee: EmployeeId
  availability: Availability
}

export interface Employee {
  id: EmployeeId
  name: string
  /** Optional named agent inside the workplace (only Management defines one). */
  agent?: string
  /** One-sentence responsibility summary shown on the AI Employees slide. */
  summary: string
  capabilities: Capability[]
}

type Row = [symbol: string, name: string, description: string]

const define = (
  index: number,
  id: EmployeeId,
  name: string,
  summary: string,
  rows: Row[],
  agent?: string,
): Employee => {
  if (rows.length !== 10) throw new Error(`${name} must define exactly 10 capabilities`)
  return {
    id,
    name,
    agent,
    summary,
    capabilities: rows.map(([symbol, capName, description], i) => ({
      n: index * 10 + i + 1,
      symbol,
      name: capName,
      description,
      employee: id,
      availability: 'scope',
    })),
  }
}

export const EMPLOYEES: Employee[] = [
  define(
    0,
    'management',
    'Management',
    'AI Manager is the single control center for all work in the AI Business — one registry of every task across directions, products, projects and assignees.',
    [
      ['Km', 'Knowledge Management', 'Search company knowledge, including connected Google Drive, and get help during live Google Meet calls.'],
      ['Nt', 'Note Taking', 'Turn meetings into notes, decisions and follow-up tasks, organized in Google Docs, Keep and Drive.'],
      ['Gm', 'Goals Management', 'Set and track goals for business directions, products and projects.'],
      ['Tm', 'Task Management', 'Keep every company task linked to a goal; prioritize with the Eisenhower Matrix, focus with Pomodoro, sync with Google Tasks and Sheets.'],
      ['Ps', 'Process Management', 'Run Kanban stages with owners and filters by product and goal, plus daily, weekly and monthly reports.'],
      ['Pj', 'Project Management', 'Plan projects on a Gantt timeline with dependencies and deadlines.'],
      ['Pd', 'Product Management', 'Hold each product’s customers, problems, solutions, business model, strategy and knowledge.'],
      ['Cl', 'Calendar Management', 'One calendar for tasks and meetings, synchronized with Google Calendar.'],
      ['Cm', 'Communication Management', 'Connect email, Telegram, Slack and WhatsApp; extract tasks and status reports from conversations.'],
      ['Te', 'Team Management', 'Manage roles and assignees, process KPIs, project OKRs and the evaluation of results.'],
    ],
    'AI Manager',
  ),
  define(
    1,
    'hr',
    'HR',
    'Hiring and people operations — from role definition and candidate search to onboarding, wellbeing, development and performance reviews.',
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
    'Researches markets, competitors and customers — and turns that knowledge into positioning, business model, brand, go-to-market and the customer journey.',
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
    'Prepares and publishes content — channel analysis, content plan, blog, text, image and video production, posting, comments and audience insights.',
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
    'Runs the sales cycle — offers and catalog, prospect discovery and research, personalized outreach, conversations, qualification, meetings and one funnel.',
    [
      ['Of', 'Offers & Product Catalog', 'Product cards with offers, prices, segments, use cases and FAQs.'],
      ['Ad', 'Audience Discovery', 'Find potential customers through Apollo and uploaded lists, then filter and deduplicate them.'],
      ['Pr', 'Prospect Research', 'Research a specific company and its needs, keeping sources and relevant facts.'],
      ['Sq', 'Personalized Sequences', 'Draft personalized email sequences — first touch and follow-ups — for each prospect and offer.'],
      ['Eo', 'Email Outreach', 'Send through connected mailboxes; stop on a reply, an unsubscribe or an invalid address.'],
      ['Sc', 'Sales Conversations', 'Assist conversations over email, Telegram and WhatsApp, including objections and hand-offs to people.'],
      ['Lq', 'Lead Qualification', 'Sort leads into classes you define — for example Small Business and Medium Business — and match each class to specific products.'],
      ['Li', 'LinkedIn Outreach Assistant', 'Prepare personalized messages and replies; the salesperson sends them manually.'],
      ['Ms', 'Meeting Scheduling', 'Offer available Google Calendar slots and agree on a meeting time.'],
      ['Sa', 'Sales Analytics', 'One funnel across contacts, sends, replies, qualified leads, meetings and purchases.'],
    ],
  ),
  define(
    5,
    'support',
    'Support',
    'Serves product users — answers questions, manages and classifies requests, and turns problems and ideas into bug reports and feature requests that can become tasks in AI Manager.',
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
    'Deep research, business analysis and product documentation — PRD, BRD, TRD — together with data analysis, risk analysis and decision support.',
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
    'Shapes how the business and its products look and work — creative, design system, presentations, landing pages, flows, interfaces, prototypes and usability.',
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
    'Builds and maintains software — codebase analysis, frontend, backend, data, AI and integrations, with testing, debugging, refactoring and code review.',
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
    'Operates the technical foundation — access, infrastructure, platform, security, network and performance, delivery pipelines, backups, monitoring and incidents.',
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

export const CAPABILITIES: Capability[] = EMPLOYEES.flatMap((e) => e.capabilities)

export const employeeById = (id: EmployeeId): Employee => {
  const found = EMPLOYEES.find((e) => e.id === id)
  if (!found) throw new Error(`Unknown employee ${id}`)
  return found
}

/** First grid row: Management | HR | Marketing | SMM | Sales. Second: Support … Engineering. */
export const EMPLOYEE_ROWS: Employee[][] = [EMPLOYEES.slice(0, 5), EMPLOYEES.slice(5, 10)]

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: 'Available',
  'in-development': 'In development',
  planned: 'Planned',
  scope: 'Product scope',
}
