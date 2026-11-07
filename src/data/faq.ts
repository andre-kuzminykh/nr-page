import type { AIEmployee } from './departments.ts'
import { READY, readyList } from './ready.ts'
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
      `An AI Operating System for running a business with AI: one shared business context, the AI Superagent, and AI employees, each for one job. They are added one by one — ready today: ${readyList(ready)}.`,
  },
  {
    q: 'What does the AI Superagent do?',
    a: 'You give it a task in plain words, and it carries the task through the tools it needs, inside your business context. AI employees take on the specialised jobs; the Superagent brings them together.',
  },
  {
    q: 'What is an AI employee?',
    a: 'A ready AI specialist for one job — for example Lead Qualification or Code Review. Each one works with AI Agents, AI Workflows and AI Skills, inside your business context.',
    now: 'A ready AI specialist for one job, working inside your business context. The first, Knowledge Management, answers from a search across your knowledge base — including Google Drive, and live during a Google Meet call — and shows where each answer was found.',
  },
  {
    q: 'Who stays in control?',
    a: 'You do. AI Governance is part of the system: policies, access rights, oversight and control over what AI employees may do. Important decisions and approvals stay with people.',
  },
  {
    q: 'AI-First or AI-Native?',
    a: 'AI-First: AI does the core operational work of a business while people manage decisions and results. AI-Native: an autonomous AI product where people oversee exceptions and key decisions. Neuronium is built for both.',
    full: true,
  },
  {
    q: 'Which tools does it connect to?',
    a: 'Sources connect through MCP and integrations — for example Google Workspace, email and messengers, Apollo and code repositories. Availability varies by release and integration.',
    now: 'Knowledge Management works with Google Drive and Google Meet. More tools connect as new AI employees are added.',
  },
  {
    q: 'Can I create my own AI employees?',
    a: 'That is what custom use cases are for: combine AI Agents, AI Workflows and AI Skills on top of your context. Your own AI employees continue the table from element 101.',
    needs: 'custom',
  },
  {
    q: 'Is it open source?',
    a: 'Yes. The code is open on GitHub — the link is at the top of the page.',
  },
  {
    q: 'Is it available today?',
    a: 'Neuronium is in early access. The 100 AI employees describe the intended product scope; what is available can vary by release and integration.',
    now: (ready) =>
      `Yes, in early access. Ready today: ${readyList(ready)}; new AI employees are added one by one. Every plan starts with a free trial on the platform.`,
  },
  {
    q: 'How much does it cost?',
    a: 'Solo is $59, $99 or $190 a month for a Low, Medium or High model — or $19 with your own model. Team, for up to 10 people, is $290, $490 or $990. Each starts with a free trial. For more than 10 people, Scale is priced with you — write to us from the corner of the page.',
  },
  {
    q: 'What are Low, Medium and High?',
    a: 'The level of the AI model your plan runs on — you pick it inside the plan. On Solo you can also run on your own model for $19 a month: you connect your AI provider’s key, and the AI usage is billed to you by that provider.',
  },
]

/** The questions asked on the site right now, with the answers for this stage. */
export const QUESTIONS: { q: string; a: string }[] = FAQ.filter((f) => (!f.needs || isSlideOpen(f.needs)) && (!f.full || ALL_EMPLOYEES_OPEN)).map((f) => ({
  q: f.q,
  a: ALL_EMPLOYEES_OPEN || f.now === undefined ? f.a : typeof f.now === 'function' ? f.now(READY) : f.now,
}))
