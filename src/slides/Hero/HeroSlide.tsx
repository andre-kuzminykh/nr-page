import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import './Hero.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const WORD = 'NEURONIUM'

/** Main block: the name, very large — then what it is and what it does. */
export function HeroSlide(_: SlideProps) {
  const word = useRef<HTMLHeadingElement>(null)
  const line = useRef<HTMLParagraphElement>(null)

  // Measure how wide the word and the tagline are in em with the font that actually rendered, so
  // they always fill — and never overflow — the column, whatever the font metrics turn out to be.
  useLayoutEffect(() => {
    const fit = () => {
      const w = word.current
      const l = line.current
      if (w) {
        const fs = parseFloat(getComputedStyle(w).fontSize)
        const width = [...w.children].reduce((sum, c) => sum + (c as HTMLElement).offsetWidth, 0)
        if (fs > 0 && width > 0) w.style.setProperty('--fit', ((width / fs) * 1.02).toFixed(3))
      }
      if (l && l.children.length) {
        const fs = parseFloat(getComputedStyle(l).fontSize)
        const first = l.children[0] as HTMLElement
        const last = l.children[l.children.length - 1] as HTMLElement
        const width = last.offsetLeft + last.offsetWidth - first.offsetLeft
        if (fs > 0 && width > 0) l.style.setProperty('--line-fit', ((width / fs) * 1.05).toFixed(3))
      }
    }
    fit()
    let alive = true
    document.fonts?.ready.then(() => alive && fit())
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="slide__frame hero">
      <div className="hero__main">
        <h1 ref={word} className="hero__word" aria-label="Neuronium">
          {WORD.split('').map((ch, i) => (
            <span key={i} className="hero__slot" aria-hidden="true">
              <span className="hero__ch" style={{ '--i': i } as CSSProperties}>
                {ch}
              </span>
            </span>
          ))}
        </h1>
        <div className="hero__rule rv rv--line" style={d(620)} aria-hidden="true">
          <span className="hero__trace" />
        </div>
        <p ref={line} className="hero__line">
          <span className="hero__run rv rv--blur" style={d(700)}>
            Run AI Business
          </span>
          <span className="hero__os rv rv--blur" style={d(800)}>
            with AI Operating System<span className="hero__dot">.</span>
          </span>
        </p>
      </div>
    </div>
  )
}
