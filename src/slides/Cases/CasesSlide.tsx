import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { casesOf, type CaseStudy, type Topic } from '../../data/cases'
import { CaseCard } from './CaseCard'
import { CasesIndex } from './CasesIndex'
import './Cases.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const ROWS = 2
/** A row holds at least this many cards before it loops, so it always runs past the window. */
const MIN_RUN = 8
/** Fewer cases than this stand still in one row instead of flowing (one case never repeats itself). */
const MIN_FLOW = 3

/**
 * The cases of each flowing row. With many cases the rows share them out; with few, each row
 * shows them all, starting from a different one. Then the run repeats until it is long enough.
 * `own` counts the cards of a row that are its own (the rest repeat): only those take focus, so
 * every case is reached once by Tab.
 */
function rows(list: CaseStudy[]): { run: CaseStudy[]; own: number }[] {
  const split = list.length >= 12
  return Array.from({ length: ROWS }, (_, r) => {
    let run = split ? list.filter((_, i) => i % ROWS === r) : list.map((_, i) => list[(i + r * Math.ceil(list.length / 2)) % list.length])
    const own = split || r === 0 ? run.length : 0
    while (run.length < MIN_RUN) run = run.concat(run)
    return { run, own }
  })
}

/**
 * Cases: they flow by in two rows, one each way — a picture and a title each. Pointing at a row
 * holds it; a case with a link opens it. “All cases” opens every case with a search. With a
 * `topic` (a feature's own page) only its cases are shown, and “All cases” opens filtered by it.
 */
export function CasesSlide({ active, topic, title = 'Cases' }: SlideProps & { topic?: Topic; title?: string }) {
  const { reducedMotion } = useDeck()
  const [all, setAll] = useState(false)
  const list = casesOf(topic)
  const still = list.length < MIN_FLOW
  const runs = useMemo(() => (still ? [{ run: list, own: list.length }] : rows(list)), [list, still])

  return (
    <div className={`slide__frame cs ${active && !reducedMotion ? 'is-live' : ''} ${still ? 'is-still' : ''}`}>
      <h2 className="h2 cs__title">
        <span className="mask" style={d(40)}>
          <span>{title}</span>
        </span>
      </h2>

      <div className="cs__rows">
        {runs.map(({ run, own }, r) => (
          <div key={r} className={`cs-row rv ${r % 2 ? 'is-back' : ''}`} style={{ '--d': 300 + r * 140, '--items': run.length } as CSSProperties}>
            <div className="cs-track">
              {(still ? [0] : [0, 1]).map((copy) => run.map((c, i) => <CaseCard key={`${copy}-${i}-${c.id}`} c={c} hidden={copy === 1 || i >= own} />))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="more cs-all rv" style={d(520)} onClick={() => setAll(true)}>
        {topic ? `All ${topic} cases` : 'All cases'}
        <span className="cs-all__n">{list.length}</span>
        <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {all && <CasesIndex topic={topic} onClose={() => setAll(false)} />}
    </div>
  )
}
