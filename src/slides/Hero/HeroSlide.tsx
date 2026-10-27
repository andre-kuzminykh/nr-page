import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import './Hero.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

export function HeroSlide(_: SlideProps) {
  const { goTo } = useDeck()
  return (
    <div className="slide__frame hero">
      <p className="hero__eyebrow eyebrow rv" style={d(0)}>
        <span className="eyebrow__num">Neuronium</span>
        <span className="eyebrow__rule" aria-hidden="true" />
        <span>AI Operating System</span>
      </p>

      <div className="hero__main">
        <h1 className="display hero__title">
          <span className="mask" style={d(60)}>
            <span>Run AI</span>
          </span>
          <span className="mask" style={d(170)}>
            <span>
              Workplaces<span className="hero__dot">.</span>
            </span>
          </span>
        </h1>

        <div className="hero__baseline rv rv--line" style={d(420)} aria-hidden="true">
          <span className="hero__trace" />
        </div>

        <div className="hero__row">
          <div className="hero__copy">
            <p className="hero__subtitle rv rv--blur" style={d(460)}>
              Build AI-Native products. Run AI-First businesses.
            </p>
            <p className="hero__description rv" style={d(560)}>
              One operating system to create, organize and execute work with AI.
            </p>
          </div>
          <div className="hero__cta rv" style={d(660)}>
            <button type="button" className="btn btn--primary" onClick={() => goTo('architecture')}>
              Explore Neuronium
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
