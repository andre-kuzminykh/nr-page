import { ArrowUp, ArrowUpRight, CalendarDays, FileText, HardDrive, Hash, Mail, Search, Sheet, Video, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Sym, Type } from '../../../components/Kit/Kit'
import type { SoloRenderProps } from '../types'
import './knowledge.css'

export interface Source {
  icon: LucideIcon
  /** The tool the source lives in. */
  app: string
  title: string
  /** Where in it: a quote, a section or a moment of a call. */
  note: string
}

export interface Answer {
  q: string
  /** The answer: text, with the number of a source after the words it backs up. */
  a: (string | 1 | 2 | 3)[]
  sources: [Source, Source, Source]
}

/** Questions to the company's knowledge, answered from what it already has (illustrative). */
export const ANSWERS: Answer[] = [
  {
    q: 'What did we agree on pilot pricing?',
    a: ['The pilot price stays fixed for the first three months', 1, '— agreed at the weekly review on Oct 12', 2, 'and written into the pilot terms.', 3],
    sources: [
      { icon: HardDrive, app: 'Drive', title: 'Pricing notes', note: '“…fixed for three months…”' },
      { icon: Video, app: 'Meet', title: 'Weekly review · Oct 12', note: 'Transcript · 14:32' },
      { icon: FileText, app: 'Docs', title: 'Pilot terms', note: 'Section 2 · Price' },
    ],
  },
  {
    q: 'Who owns the landing page?',
    a: ['The design lead owns it.', 1, 'The copy is due on Nov 14', 2, 'and the release is on Nov 20.', 3],
    sources: [
      { icon: FileText, app: 'Docs', title: 'Launch plan', note: 'Owner · design lead' },
      { icon: Sheet, app: 'Sheets', title: 'Content schedule', note: 'Landing page copy · Nov 14' },
      { icon: CalendarDays, app: 'Calendar', title: 'Release', note: 'Nov 20 · 10:00' },
    ],
  },
  {
    q: 'What do customers ask about most?',
    a: ['How to send reports to their own clients — as a PDF', 1, 'or as a link.', 2, 'It came up again in last week’s customer call.', 3],
    sources: [
      { icon: Mail, app: 'Gmail', title: 'Support · Report export', note: '“…can I send it as a PDF?”' },
      { icon: Hash, app: 'Slack', title: '#customer-feedback', note: '“…a link, not a file”' },
      { icon: Video, app: 'Meet', title: 'Customer call', note: 'Transcript · 09:12' },
    ],
  },
]

/** One question: typed, searched, answered, its sources arrive; then the next one. */
export const ANSWER_MS = 8000

/** The answer as plain text, without the source numbers. */
export const answerText = (a: Answer['a']) => a.filter((x): x is string => typeof x === 'string').join(' ')

/**
 * Knowledge Management on its own: no window, just the search. A question is typed into the bar,
 * and once its last letter is in it is sent: the search runs, the answer streams in with numbered
 * references to three sources. `round` counts the questions (it ticks every ANSWER_MS); each round
 * mounts afresh and plays the next one.
 */
export function KnowledgeSearch({ live, round }: SoloRenderProps) {
  const ans = ANSWERS[round % ANSWERS.length]
  const [sent, setSent] = useState(false)
  // leaving the block mid-question starts it over next time
  useEffect(() => {
    if (!live) setSent(false)
  }, [live])
  let w = 0
  const words = ans.a.map((part, k) => {
    if (typeof part === 'number') {
      // the reference arrives with the word it follows
      return (
        <sup key={k} className="kq-cite" style={{ '--i': w - 1, '--cc': `var(--c${part})` } as CSSProperties}>
          {part}
        </sup>
      )
    }
    return part.split(' ').map((word, j) => (
      <span key={`${k}-${j}`}>
        {' '}
        <span className="kq-w" style={{ '--i': w++ } as CSSProperties}>
          {word}
        </span>
      </span>
    ))
  })

  return (
    <div className={`kq ${live ? 'is-live' : 'is-still'} ${live && sent ? 'is-sent' : ''}`}>
      <div className="kq-bar">
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        <span className="kq-q">
          <Type text={ans.q} play={live} speed={30} delay={260} onDone={() => setSent(true)} />
        </span>
        <span className="kq-go" aria-hidden="true">
          <ArrowUp size={17} strokeWidth={2} />
        </span>
        <i className="kq-scan" aria-hidden="true" />
      </div>

      <div className="kq-answer">
        <Sym n={1} className="kq-km" />
        <p className="kq-text">{words}</p>
      </div>

      <ol className="kq-sources" aria-label="Sources">
        {ans.sources.map((s, i) => {
          const Icon = s.icon
          return (
            <li key={s.title} className="kq-src" style={{ '--k': i, '--cc': `var(--c${i + 1})` } as CSSProperties}>
              <span className="kq-src__top">
                <span className="kq-num">{i + 1}</span>
                <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                <span className="kq-app">{s.app}</span>
                <ArrowUpRight className="kq-src__go" size={13} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="kq-src__title">{s.title}</span>
              <span className="kq-src__note">{s.note}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
