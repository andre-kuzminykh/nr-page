/**
 * The cases on the Cases block: a picture and a title each. A case opens once it has an `href`;
 * until then its card shows “Soon” when it is reached. `image` replaces the drawn picture with a
 * real one (put it in public/cases/ and give its path, e.g. '/cases/knowledge.jpg').
 */
export interface CaseStudy {
  id: string
  title: string
  /** the drawn picture: its motif and its colour (the row runs violet → pink → orange) */
  art: 'knowledge' | 'calls' | 'leads'
  tone: 'violet' | 'pink' | 'orange'
  image?: string
  href?: string
}

export const CASES: CaseStudy[] = [
  { id: 'knowledge', title: 'One question, the whole business context', art: 'knowledge', tone: 'violet' },
  { id: 'calls', title: 'From today’s calls to the team’s tasks', art: 'calls', tone: 'pink' },
  { id: 'leads', title: 'New leads to booked demos', art: 'leads', tone: 'orange' },
]
