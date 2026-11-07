import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Prompt } from '../../components/Prompt/Prompt'
import { useDemo } from '../../components/Prompt/useDemo'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { PLATFORM_URL, taskHref } from '../../config/links'
import { Brain, COMMANDS } from './Brain'
import './Context.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const TITLE = ['AI Superagent works', 'in your business context']

/**
 * The tools of the business are one context — a brain. Commands are typed into the bar below it;
 * each one sends the AI Superagent its own way through the tools it needs, then the next comes.
 * After the last one the bar says “Try it yourself”: a task typed there goes to the platform.
 */
export function ContextSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const live = active && !reducedMotion
  // the commands play one after another; then “Try it yourself”, and the visitor's task goes to the platform
  const demo = useDemo(COMMANDS.length, { live, shown })

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
        <a className="more ctx__more rv" style={d(360)} href={PLATFORM_URL}>
          About Platform
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>
      <div className="ctx__main">
        <div className="ctx__brain">
          <Brain active={active} shown={shown} still={reducedMotion} cmd={demo.k} go={live && demo.go} onDone={demo.next} />
        </div>
        <div className="ctx__prompt rv" style={d(700)}>
          <Prompt
            {...demo.bar}
            label="A task for the AI Superagent"
            placeholder="Give the AI Superagent a task"
            href={taskHref}
            text={COMMANDS[demo.k].text}
            live={live}
            delay={demo.k === 0 ? 1500 : 450}
          />
        </div>
      </div>
    </div>
  )
}
