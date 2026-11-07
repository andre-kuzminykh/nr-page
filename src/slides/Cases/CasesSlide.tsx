import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { CASES } from '../../data/cases'
import { useInterval } from '../../hooks/useInterval'
import { Art } from './Art'
import './Cases.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
/** Without a visitor's hand on them, the cases open one after another, this long each. */
const TURN_MS = 5200

/**
 * Cases: pictures and titles in a row. One case is open wide at a time; the pointer (or focus)
 * opens another, and left alone they take turns. An open case with a link leads to it.
 */
export function CasesSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const live = active && !reducedMotion
  const [on, setOn] = useState(0)
  const [hand, setHand] = useState(false)

  useEffect(() => {
    if (!shown) {
      setOn(0)
      setHand(false)
    }
  }, [shown])
  useInterval(() => setOn((k) => (k + 1) % CASES.length), live && !hand ? TURN_MS : null)

  const enter = (k: number) => (e: PointerEvent) => {
    // a mouse opens a case by pointing; a finger opens it with the first tap
    if (e.pointerType !== 'mouse') return
    setOn(k)
    setHand(true)
  }
  const tap = (k: number) => (e: MouseEvent) => {
    if (k === on) return
    e.preventDefault()
    setOn(k)
    setHand(true)
  }

  return (
    <div className={`slide__frame cs ${live ? 'is-live' : ''}`} style={{ '--turn': `${TURN_MS}ms`, '--n': CASES.length } as CSSProperties}>
      <h2 className="h2 cs__title">
        <span className="mask" style={d(40)}>
          <span>Cases</span>
        </span>
      </h2>

      <div className={`cs__row ${hand ? 'is-held' : ''}`} onPointerLeave={() => setHand(false)}>
        {CASES.map((c, k) => {
          const open = k === on
          const inner = (
            <>
              <span className={`cs-pic cs-pic--${c.tone}`}>
                <span className="cs-glow" />
                {c.image ? <img className="cs-img" src={c.image} alt="" loading="lazy" /> : <Art art={c.art} />}
                <span className="cs-shade" />
              </span>
              <span className="cs-n">{String(k + 1).padStart(2, '0')}</span>
              <span className="cs-side" aria-hidden="true">
                {c.title}
              </span>
              <span className="cs-foot">
                <span className="cs-title">{c.title}</span>
                <span className="cs-go">{c.href ? <ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true" /> : 'Soon'}</span>
              </span>
              {open && live && !hand && <i key={on} className="cs-line" aria-hidden="true" />}
            </>
          )
          const props = {
            className: `cs-card ${open ? 'is-open' : ''}`,
            style: { '--k': k } as CSSProperties,
            onPointerEnter: enter(k),
            onFocus: () => {
              setOn(k)
              setHand(true)
            },
            onBlur: () => setHand(false),
          }
          return c.href ? (
            <a key={c.id} {...props} href={c.href} onClick={tap(k)}>
              {inner}
            </a>
          ) : (
            <article key={c.id} {...props} tabIndex={0} aria-label={`${c.title} — soon`} onClick={tap(k)}>
              {inner}
            </article>
          )
        })}
      </div>
    </div>
  )
}
