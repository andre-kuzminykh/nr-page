// Checks the 100 AI employees against the canonical Neuronium list.
// Every one must exist exactly once, in the right department and order, with a unique symbol.
// Run: npm run validate:data
import { AI_EMPLOYEES as CAPABILITIES, DEPARTMENTS as EMPLOYEES } from '../src/data/departments.ts'

const CANON = {
  Management: ['Knowledge Management', 'Note Taking', 'Goals Management', 'Task Management', 'Process Management', 'Project Management', 'Product Management', 'Calendar Management', 'Communication Management', 'Team Management'],
  HR: ['Job Description', 'Candidates Search', 'CV Screening', 'Candidate Interview', 'Employee Onboarding', 'Employee Support', 'Employee Schedule', 'Employee Wellbeing', 'Employee Development', 'Performance Review'],
  Marketing: ['Market Discovery', 'Competitor Analysis', 'Customer Discovery', 'Product Positioning', 'Business Model', 'Brand Book', 'Go-to-Market Strategy', 'Customer Journey Map', 'Marketing Analytics', 'Voice of Customer'],
  SMM: ['Channels Analysis', 'Content Plan', 'Web Blog', 'Text Generation', 'Image Generation', 'Video Generation', 'Video Creation', 'Auto Posting', 'Comments Management', 'Audience Insights'],
  Sales: ['Offers & Product Catalog', 'Audience Discovery', 'Prospect Research', 'Personalized Sequences', 'Email Outreach', 'Sales Conversations', 'Lead Qualification', 'LinkedIn Outreach Assistant', 'Meeting Scheduling', 'Sales Analytics'],
  Support: ['FAQ Answers', 'Email Support', 'Web Support', 'Messenger Support', 'Ticket Management', 'Classification', 'Bug Reporting', 'Feature Request', 'Second-Line Escalation', 'Support Analysis'],
  Analytics: ['Deep Research', 'Business Analysis', 'PRD', 'BRD', 'TRD', 'Backlog Refinement', 'Risk Analysis', 'Data Analysis', 'Analytical Report', 'Decision Intelligence'],
  Design: ['Creative Generation', 'Design System', 'Presentation Creation', 'Landing Page', 'User Flow', 'User Experience', 'User Interface', 'Application Prototype', 'User Simulation', 'Usability Analysis'],
  Development: ['Codebase Analysis', 'Frontend Development', 'Backend Development', 'Database Development', 'AI Development', 'Integration Development', 'Automated Testing', 'Debugging', 'Refactoring', 'Code Review'],
  Engineering: ['Access Management', 'Infrastructure Engineering', 'Platform Engineering', 'Security Engineering', 'Network Engineering', 'Performance Engineering', 'CI/CD', 'Backup & Recovery', 'System Monitoring', 'Incident Management'],
}

const FORBIDDEN = /market intelligence|product intelligence|media intelligence/i
const errors = []
const order = Object.keys(CANON)

if (EMPLOYEES.length !== 10) errors.push(`Expected 10 departments, found ${EMPLOYEES.length}`)
EMPLOYEES.forEach((e, i) => {
  if (e.name !== order[i]) errors.push(`Department #${i + 1} should be ${order[i]}, found ${e.name}`)
  const expected = CANON[e.name] ?? []
  if (e.members.length !== 10) errors.push(`${e.name}: expected 10 AI employees, found ${e.members.length}`)
  if (!e.headline?.[0] || !e.headline?.[1] || !e.description) errors.push(`${e.name}: missing headline or description`)
  e.members.forEach((c, j) => {
    if (c.name !== expected[j]) errors.push(`${e.name} #${j + 1}: expected "${expected[j]}", found "${c.name}"`)
    if (c.n !== i * 10 + j + 1) errors.push(`${c.name}: expected number ${i * 10 + j + 1}, found ${c.n}`)
    if (!c.description || c.description.length < 20) errors.push(`${c.name}: missing description`)
    if (c.availability === 'available') console.warn(`note: ${c.name} is marked as available — confirm before publishing`)
  })
})

const symbols = CAPABILITIES.map((c) => c.symbol)
for (const c of CAPABILITIES) if (!/^[A-Z][a-z]{1,2}$/.test(c.symbol)) errors.push(`${c.name}: bad element symbol "${c.symbol}"`)
if (new Set(symbols).size !== symbols.length) errors.push('Element symbols must be unique')
if (symbols.includes('Nr')) errors.push('"Nr" is reserved for Neuronium (element 0)')

const names = CAPABILITIES.map((c) => c.name)
const dupes = names.filter((n, i) => names.indexOf(n) !== i)
if (dupes.length) errors.push(`Duplicate capability names: ${dupes.join(', ')}`)
const descs = CAPABILITIES.map((c) => c.description)
if (new Set(descs).size !== descs.length) errors.push('Descriptions must be unique')
if (CAPABILITIES.length !== 100) errors.push(`Expected 100 AI employees, found ${CAPABILITIES.length}`)
for (const c of CAPABILITIES) if (FORBIDDEN.test(c.name + c.description)) errors.push(`Forbidden term in ${c.name}`)

if (errors.length) {
  console.error(`✗ AI employee data: ${errors.length} problem(s)\n  ` + errors.join('\n  '))
  process.exit(1)
}
console.log(`✓ AI employee data: 10 departments × 10 = ${CAPABILITIES.length} AI employees (elements 1–100), exact names, order, numbering and unique symbols`)
