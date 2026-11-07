import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { CASES, type CaseArticle } from '../../data/cases'
import { Cover } from './Covers'
import './Cases.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

function Card({ c, k }: { c: CaseArticle; k: number }) {
  const body = (
    <>
      <div className="cs-cover">
        <Cover kind={c.cover} whole={k === 0} />
      </div>
      <div className="cs-body">
        <p className="cs-kind">{c.kind}</p>
        <h3 className="cs-title">{c.title}</h3>
        <p className="cs-meta">
          <span className="cs-tools">{c.tools.join(' · ')}</span>
          {c.href ? (
            <span className="cs-read">
              Read
              <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
            </span>
          ) : (
            <span className="cs-soon">Soon</span>
          )}
        </p>
      </div>
    </>
  )
  const cls = `cs-card rv ${k === 0 ? 'cs-card--lead' : ''}`
  return c.href ? (
    <a className={cls} style={d(220 + k * 110)} href={c.href}>
      {body}
    </a>
  ) : (
    <article className={cls} style={d(220 + k * 110)} aria-label={`${c.title} — ${c.kind}, coming soon`}>
      {body}
    </article>
  )
}

/** Cases: the articles on how work runs with Neuronium. Each card opens its article once it is out. */
export function CasesSlide({ active }: SlideProps) {
  const { reducedMotion } = useDeck()
  return (
    <div className={`slide__frame cs ${active && !reducedMotion ? 'is-live' : ''}`}>
      <h2 className="h2 cs__title">
        <span className="mask" style={d(40)}>
          <span>Cases</span>
        </span>
      </h2>
      <div className="cs__grid">
        {CASES.map((c, k) => (
          <Card key={c.id} c={c} k={k} />
        ))}
      </div>
    </div>
  )
}
