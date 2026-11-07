import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Prompt } from '../../components/Prompt/Prompt'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { PLATFORM_URL } from '../../config/links'
import { Brain, COMMANDS } from './Brain'
import './Context.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const TITLE = ['AI Superagent works', 'in your business context']

/**
 * The tools of the business are one context — a brain. Commands are typed into the bar below it;
 * each one sends the AI Superagent its own way through the tools it needs, then the next comes.
 */
export function ContextSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const live = active && !reducedMotion
  const [cmd, setCmd] = useState(0)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!shown) {
      setCmd(0)
      setSent(false)
    }
  }, [shown])
  // leaving the block mid-command starts it over next time
  useEffect(() => {
    if (!live) setSent(false)
  }, [live])

  return (
    <div className="slide__frame ctx">
      <div className="ctx__head">
        <h2 className="h2 ctx__title">
          {TITLE.map((line, k) => (
            <span key={k} className="mask" style={d(40 + k * 80)}>
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <a className="btn btn--primary ctx__cta rv" style={d(360)} href={PLATFORM_URL}>
          Open Platform
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>
      <div className="ctx__main">
        <div className="ctx__brain">
          <Brain
            active={active}
            shown={shown}
            still={reducedMotion}
            cmd={cmd}
            go={live && sent}
            onDone={() => {
              setSent(false)
              setCmd((k) => (k + 1) % COMMANDS.length)
            }}
          />
        </div>
        <div className="ctx__prompt rv" style={d(700)}>
          <Prompt
            key={cmd}
            text={COMMANDS[cmd].text}
            live={live}
            sent={sent}
            onSent={() => setSent(true)}
            delay={cmd === 0 ? 1500 : 450}
          />
        </div>
      </div>
    </div>
  )
}
