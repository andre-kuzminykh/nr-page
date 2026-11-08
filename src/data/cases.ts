/**
 * The cases on the Cases block: a picture and a title each. A case opens once it has an `href`;
 * until then its card shows “Soon” when it is reached. `image` replaces the drawn picture with a
 * real one (put it in public/cases/ and give its path, e.g. '/cases/knowledge.jpg'). `topics` are
 * what “All cases” can be filtered by; a feature's own page shows only its cases.
 */
export interface CaseStudy {
  id: string
  title: string
  /** the drawn picture: its motif and its colour (the row runs violet → pink → orange) */
  art: 'knowledge' | 'calls' | 'leads'
  tone: 'violet' | 'pink' | 'orange'
  image?: string
  href?: string
  topics: Topic[]
}

export type Topic = 'Knowledge Management' | 'AI Superagent'

export const CASES: CaseStudy[] = [
  { id: 'knowledge', title: 'Answers with sources, from Drive and Meet', art: 'knowledge', tone: 'violet', topics: ['Knowledge Management'] },
  { id: 'calls', title: 'From today’s calls to the team’s tasks', art: 'calls', tone: 'pink', topics: ['AI Superagent'] },
  { id: 'leads', title: 'From new leads to booked demos', art: 'leads', tone: 'orange', topics: ['AI Superagent'] },
]

/** The topics the cases have, in the order they first appear. */
export const TOPICS: Topic[] = [...new Set(CASES.flatMap((c) => c.topics))]

/** The cases of one topic (all of them without one). */
export const casesOf = (topic?: Topic) => (topic ? CASES.filter((c) => c.topics.includes(topic)) : CASES)
