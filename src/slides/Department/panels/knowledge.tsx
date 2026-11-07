import { CalendarDays, FilePlay, FileSpreadsheet, FileText, Mail, MessageSquareText, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Sym } from '../../../components/Kit/Kit'
import { Prompt } from '../../../components/Prompt/Prompt'
import { kmHref } from '../../../config/links'
import type { SoloRenderProps } from '../types'
import './knowledge.css'

export interface Source {
  /** What kind of thing it is: a document, a sheet, an email, a message, a recording, an event. */
  icon: LucideIcon
  title: string
  /** The tool it lives in (shown by the turning Management interface). */
  app: string
  /** Where in it: a quote, a section or a moment of a call (shown by the turning interface). */
  note: string
}

export interface Answer {
  q: string
  a: string
  sources: [Source, Source, Source]
}

/** Questions to the company's knowledge, answered from what it already has (illustrative). */
export const ANSWERS: Answer[] = [
  {
    q: 'What did we agree on pilot pricing?',
    a: 'The pilot price stays fixed for the first three months — agreed at the weekly review on Oct 12 and written into the pilot terms.',
    sources: [
      { icon: FileText, title: 'Pricing notes', app: 'Drive', note: '“…fixed for three months…”' },
      { icon: FilePlay, title: 'Weekly review · Oct 12', app: 'Meet', note: 'Transcript · 14:32' },
      { icon: FileText, title: 'Pilot terms', app: 'Docs', note: 'Section 2 · Price' },
    ],
  },
  {
    q: 'Who owns the landing page?',
    a: 'The design lead owns it. The copy is due on Nov 14 and the release is on Nov 20.',
    sources: [
      { icon: FileText, title: 'Launch plan', app: 'Docs', note: 'Owner · design lead' },
      { icon: FileSpreadsheet, title: 'Content schedule', app: 'Sheets', note: 'Landing page copy · Nov 14' },
      { icon: CalendarDays, title: 'Release · Nov 20', app: 'Calendar', note: '10:00' },
    ],
  },
  {
    q: 'What do customers ask about most?',
    a: 'How to send reports to their own clients — as a PDF or as a link. It came up again in last week’s customer call.',
    sources: [
      { icon: Mail, title: 'Report export', app: 'Gmail', note: '“…can I send it as a PDF?”' },
      { icon: MessageSquareText, title: '#customer-feedback', app: 'Slack', note: '“…a link, not a file”' },
      { icon: FilePlay, title: 'Customer call', app: 'Meet', note: 'Transcript · 09:12' },
    ],
  },
]

/** One question: typed, searched, answered, its sources arrive; then the next one. */
export const ANSWER_MS = 8000

/**
 * Knowledge Management on its own: no window, just the search. A question is typed into the bar at
 * the bottom, and once its last letter is in it is sent: above the bar the answer streams in, and
 * the three things it was found in arrive — each just its icon and its name. `round` counts the
 * rounds (it ticks every ANSWER_MS); each round mounts afresh and plays the next question, and after
 * the last one comes a round of “Try it yourself”. The visitor can click into the bar at any time:
 * the rounds wait, and a question sent from there opens Knowledge Management with it.
 */
export function KnowledgeSearch({ live, round, hold }: SoloRenderProps) {
  const k = round % (ANSWERS.length + 1)
  const inviting = k === ANSWERS.length
  // the try round keeps the last answer's room, so the bar does not move
  const ans = ANSWERS[Math.min(k, ANSWERS.length - 1)]
  const [sent, setSent] = useState(false)
  const [own, setOwn] = useState(false)
  const [left, setLeft] = useState(false)
  // leaving the block mid-question starts it over next time
  useEffect(() => {
    if (!live) setSent(false)
  }, [live])
  const quiet = inviting || own || left

  return (
    <div className={`kq ${live ? 'is-live' : 'is-still'} ${live && sent && !quiet ? 'is-sent' : ''} ${quiet ? 'is-quiet' : ''}`}>
      <div className="kq-answer" aria-hidden={quiet || undefined}>
        <Sym n={1} className="kq-km" />
        <div className="kq-body">
          <p className="kq-text">
            {ans.a.split(' ').map((word, i) => (
              <span key={i}>
                {i > 0 && ' '}
                <span className="kq-w" style={{ '--i': i } as CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </p>
          <ul className="kq-sources" aria-label="Sources">
            {ans.sources.map((s, i) => {
              const Icon = s.icon
              return (
                <li key={s.title} className="kq-src" style={{ '--k': i, '--cc': `var(--c${i + 1})` } as CSSProperties}>
                  <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                  <span className="kq-src__title">{s.title}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <Prompt
        label="Ask Knowledge Management"
        placeholder="Ask anything about your business"
        href={kmHref}
        text={ans.q}
        live={live}
        sent={sent}
        onSent={() => setSent(true)}
        tryIt={inviting || left}
        onTake={() => {
          setOwn(true)
          setSent(false)
          hold(true)
        }}
        onLeave={() => {
          setOwn(false)
          // the visitor looked and left: “Try it yourself” until the next round
          setLeft(true)
          hold(false)
        }}
      />
    </div>
  )
}
