/**
 * Articles for the Cases block. They are being written: until an article has an `href`, its card
 * says “Soon” and leads nowhere. Add the link (and a date) when it is published.
 */
export interface CaseArticle {
  id: string
  /** what the article is about: an AI employee or the AI Superagent */
  kind: string
  title: string
  /** the tools the work runs through */
  tools: string[]
  /** the cover drawing */
  cover: 'knowledge' | 'calls' | 'leads'
  href?: string
  date?: string
}

export const CASES: CaseArticle[] = [
  {
    id: 'knowledge',
    kind: 'Knowledge Management',
    title: 'One question, the whole business context',
    tools: ['Drive', 'Meet', 'Docs'],
    cover: 'knowledge',
  },
  {
    id: 'calls',
    kind: 'AI Superagent',
    title: 'From today’s calls to the team’s tasks',
    tools: ['Meet', 'Docs', 'Slack', 'Telegram'],
    cover: 'calls',
  },
  {
    id: 'leads',
    kind: 'AI Superagent',
    title: 'New leads to booked demos',
    tools: ['Apollo', 'Sheets', 'Gmail', 'Calendar'],
    cover: 'leads',
  },
]
