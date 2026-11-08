import type { AIEmployee } from './departments.ts'
import { READY, readyList } from './ready.ts'
import { WORKFORCE_HOUR } from './pricing.ts'
import { ALL_EMPLOYEES_OPEN } from './release.ts'
import { isSlideOpen } from './slides.ts'

interface Question {
  q: string
  /** the answer for the whole product */
  a: string
  /** the answer while AI employees are still being added one by one (see release.ts) */
  now?: string | ((ready: AIEmployee[]) => string)
  /** asked only once this block is open */
  needs?: string
  /** asked only once the whole product is on the site */
  full?: boolean
}

/** Questions and answers for the FAQ block. Answers stay within confirmed product scope. */
export const FAQ: Question[] = [
  {
    q: 'What is Neuronium?',
    a: 'An AI Operating System for creating and running AI businesses. It brings one shared business context, an AI Superagent and 100 AI employees across ten departments into a single system.',
    now: (ready) =>
      `An AI Operating System for your business. You give the AI Superagent tasks in plain words; AI employees each do one job, all in one shared business context. Ready today: ${readyList(ready)}. More arrive one by one.`,
  },
  {
    q: 'Is it available today?',
    a: 'Neuronium is in early access. The 100 AI employees describe the intended product scope; what is available can vary by release and integration.',
    now: (ready) =>
      `Yes, in early access. Ready today: ${readyList(ready)}. New AI employees are added one by one, and every plan starts with a free trial.`,
  },
  {
    q: 'What does the AI Superagent do?',
    a: 'You give it a task in plain words. It works through the tools the task needs, using what your company already knows. AI employees take the specialised jobs.',
  },
  {
    q: 'What is an AI employee?',
    a: 'A ready AI specialist for one job — for example Lead Qualification or Code Review. Each one works with AI Agents, AI Workflows and AI Skills, inside your business context.',
    now: 'An AI specialist for one job. The first is Knowledge Management: ask a question and get the answer from your Drive files, your Meet calls and your company’s records, even live in a call, with its sources.',
  },
  {
    q: 'Who stays in control?',
    a: 'You do. AI Governance is part of the system: policies, access rights, oversight and control over what AI employees may do. Important decisions and approvals stay with people.',
    now: 'You do. Access is set per person, team or role, and Knowledge Management only reads what that reader may see. Decisions and approvals stay with people.',
  },
  {
    q: 'AI-First or AI-Native?',
    a: 'AI-First: AI does the core operational work of a business while people manage decisions and results. AI-Native: an autonomous AI product where people oversee exceptions and key decisions. Neuronium is built for both.',
    full: true,
  },
  {
    q: 'Which tools does it connect to?',
    a: 'Sources connect through MCP and integrations — for example Google Workspace, email and messengers, Apollo and code repositories. Availability varies by release and integration.',
    now: 'Knowledge Management reads your Google Drive files, your Google Meet calls and the goals, tasks, people and money kept in Management. The other tools on the Platform block connect as their AI employees are released.',
  },
  {
    q: 'Can I create my own AI employees?',
    a: 'That is what custom use cases are for: combine AI Agents, AI Workflows and AI Skills on top of your context. Your own AI employees continue the table from element 101.',
    needs: 'custom',
  },
  {
    q: 'Is it open source?',
    a: 'Yes. The code is on GitHub: “Open source” at the top of the page.',
  },
  {
    q: 'How much does it cost?',
    a: 'From $19 a month, and every plan starts with a free trial. Solo starts at $59 and Team, for up to 10 people, at $290; both come in Low, Medium and High. For more than 10 people, Scale is priced with you: press Contact sales.',
  },
  {
    q: 'What are Low, Medium and High?',
    a: 'The level of the AI model Solo or Team runs on, picked inside the plan. Higher levels come with more AI Workforce hours. With Own model you connect your AI provider’s key instead, and that provider bills you for the AI usage.',
  },
  {
    q: 'What is an AI Workforce hour?',
    a: `${WORKFORCE_HOUR} Solo comes with 300, 500 or 1\u00a0000 of them, Team with 3\u00a0000, 5\u00a0000 or 10\u00a0000, depending on the model level.`,
  },
]

/** The questions asked on the site right now, with the answers for this stage. */
export const QUESTIONS: { q: string; a: string }[] = FAQ.filter((f) => (!f.needs || isSlideOpen(f.needs)) && (!f.full || ALL_EMPLOYEES_OPEN)).map((f) => ({
  q: f.q,
  a: ALL_EMPLOYEES_OPEN || f.now === undefined ? f.a : typeof f.now === 'function' ? f.now(READY) : f.now,
}))
