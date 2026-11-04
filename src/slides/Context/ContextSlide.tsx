import type { CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Brain } from './Brain'
import './Context.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** The tools become one context — a brain — and one AI Superagent runs through all of it. */
export function ContextSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  return (
    <div className="slide__frame ctx">
      <h2 className="h2 ctx__title">
        <span className="mask" style={d(40)}>
          <span>Shared context.</span>
        </span>
        <span className="mask" style={d(120)}>
          <span>One Superagent.</span>
        </span>
      </h2>
      <div className="ctx__brain">
        <Brain active={active} shown={shown} still={reducedMotion} />
      </div>
    </div>
  )
}
