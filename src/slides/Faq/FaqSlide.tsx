import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { QUESTIONS } from '../../data/faq'
import './Faq.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** Questions that open in place — one at a time; opening one closes the others. */
export function FaqSlide({ shown, questions: FAQ = QUESTIONS }: SlideProps & { questions?: { q: string; a: string }[] }) {
  // nothing is open at first
  const [open, setOpen] = useState(-1)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!shown) setOpen(-1)
  }, [shown])

  // ↑ ↓ move between the questions (they do not turn the block), Home / End jump to the first / last
  const onKey = (e: KeyboardEvent) => {
    const i = buttons.current.findIndex((b) => b === document.activeElement)
    if (i < 0) return
    let next: number | null = null
    if (e.key === 'ArrowDown') next = Math.min(FAQ.length - 1, i + 1)
    if (e.key === 'ArrowUp') next = Math.max(0, i - 1)
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = FAQ.length - 1
    if (next === null) return
    e.preventDefault()
    buttons.current[next]?.focus()
  }

  return (
    <div className="slide__frame faq">
      <h2 className="h2 faq__title">
        <span className="mask" style={d(40)}>
          <span>FAQ</span>
        </span>
      </h2>

      <div className="faq__list rv" style={d(260)} onKeyDown={onKey} data-own-keys>
        {FAQ.map((f, i) => {
          const isOpen = i === open
          return (
            <div key={f.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
              <h3 className="faq__h">
                <button
                  ref={(el) => {
                    buttons.current[i] = el
                  }}
                  type="button"
                  id={`faq-q-${i}`}
                  className="faq__q"
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span className="faq__q-n mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="faq__q-text">{f.q}</span>
                  <span className="faq__sign" aria-hidden="true" />
                </button>
              </h3>
              <div id={`faq-a-${i}`} className="faq__a" role="region" aria-labelledby={`faq-q-${i}`} inert={!isOpen}>
                <div>
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
