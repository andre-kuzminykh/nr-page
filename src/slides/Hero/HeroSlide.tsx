import type { CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import './Hero.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const WORD = 'NEURONIUM'

/** Main block: the name, very large — then what it is and what it does. */
export function HeroSlide(_: SlideProps) {
  return (
    <div className="slide__frame hero">
      <div className="hero__main">
        <h1 className="hero__word" aria-label="Neuronium">
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
        <p className="hero__line">
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
