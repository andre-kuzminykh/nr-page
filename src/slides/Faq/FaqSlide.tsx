import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { BrandMark } from '../../components/Chrome/BrandMark'
import { Type } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { FAQ } from '../../data/faq'
import './Faq.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** FAQ as a conversation: pick a question, Neuronium answers. */
export function FaqSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [k, setK] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (!shown) setK(0)
  }, [shown])

  const onKey = (e: KeyboardEvent) => {
    let next: number | null = null
    if (e.key === 'ArrowDown') next = (k + 1) % FAQ.length
    if (e.key === 'ArrowUp') next = (k + FAQ.length - 1) % FAQ.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = FAQ.length - 1
    if (next === null) return
    e.preventDefault()
    setK(next)
    tabs.current[next]?.focus()
  }

  const item = FAQ[k]
  return (
    <div className="slide__frame faq">
      <div className="faq__text">
        <h2 className="h2 faq__title">
          <span className="mask" style={d(40)}>
            <span>Questions,</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>answered.</span>
          </span>
        </h2>
        <div className="faq__list rv" style={d(260)} role="tablist" aria-orientation="vertical" aria-label="Questions" onKeyDown={onKey} data-own-keys>
          {FAQ.map((f, i) => (
            <button
              key={f.q}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`faq-q-${i}`}
              aria-selected={i === k}
              aria-controls="faq-answer"
              tabIndex={i === k ? 0 : -1}
              className="faq__q"
              onClick={() => setK(i)}
            >
              <span className="faq__q-n mono">{String(i + 1).padStart(2, '0')}</span>
              {f.q}
            </button>
          ))}
        </div>
      </div>

      <section id="faq-answer" className="faq__chat pn is-focus rv rv--scale" style={d(340)} role="tabpanel" aria-labelledby={`faq-q-${k}`}>
        <div className="faq__thread" key={k}>
          <p className="faq__ask">{item.q}</p>
          <div className="faq__reply">
            <span className="faq__avatar">
              <BrandMark size={28} />
            </span>
            <p className="faq__answer">
              <Type text={item.a} play={active && !reducedMotion} speed={12} delay={350} />
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
