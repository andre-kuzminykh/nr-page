import { Pause, Play } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { EMPLOYEE_ICON } from '../../components/ui/icons'
import { employeeById } from '../../data/employees'
import { useInterval } from '../../hooks/useInterval'
import { FLOW, SIDE } from './workflowData'
import './Workflow.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const STEPS = FLOW.length + SIDE.length

/** Cross-functional Workflow — an illustrative path from idea to working product. */
export function WorkflowSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!shown) {
      setStep(0)
      setPlaying(true)
    }
  }, [shown])

  useInterval(() => setStep((s) => (s + 1) % STEPS), active && playing && !reducedMotion ? 2100 : null)

  const inMain = step < FLOW.length
  const current = inMain ? FLOW[step] : SIDE[step - FLOW.length]
  const progress = inMain ? step / (FLOW.length - 1) : 1

  const select = (i: number) => {
    setStep(i)
    setPlaying(false)
  }

  return (
    <div className="slide__frame wf">
      <header className="wf__head">
        <div>
          <Eyebrow index={7}>How work moves</Eyebrow>
          <h2 className="h2 wf__title">
            <span className="mask" style={d(50)}>
              <span>From an idea</span>
            </span>
            <span className="mask" style={d(120)}>
              <span>to a working product.</span>
            </span>
          </h2>
        </div>
        <div className="wf__aside rv" style={d(240)}>
          <span className="wf__tag mono">Illustrative workflow</span>
          <p className="body">
            An example of existing AI Employees working together — not a separate module, and not a
            claim that every step is automated today.
          </p>
        </div>
      </header>

      <div className="wf__flow" style={{ '--n': FLOW.length, '--p': progress } as CSSProperties}>
        <div className="wf__line rv rv--line" style={d(300)} aria-hidden="true">
          <span className="wf__line-fill" />
          <span className="wf__spark" />
        </div>
        <ol className="wf__stages" aria-label="Illustrative workflow stages">
          {FLOW.map((s, i) => {
            const e = employeeById(s.employee)
            const Icon = EMPLOYEE_ICON[s.employee]
            const state = i === step ? 'is-active' : inMain && i < step ? 'is-past' : ''
            return (
              <li key={s.employee} className={`wf__stage rv ${state}`} style={d(340 + i * 70)}>
                <button type="button" className="wf__stage-btn" onClick={() => select(i)} aria-current={i === step ? 'step' : undefined}>
                  <span className="wf__node" aria-hidden="true" />
                  <span className="wf__num mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wf__name">
                    <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                    {e.name}
                  </span>
                  <span className="wf__fns">
                    {s.functions.map((f) => (
                      <span key={f}>{f}</span>
                    ))}
                  </span>
                </button>
                <span className="wf__tick" aria-hidden="true" />
              </li>
            )
          })}
        </ol>
      </div>

      <div className="wf__rail rv" style={d(860)}>
        <span className="wf__rail-line" aria-hidden="true" />
        <span className="wf__rail-label">
          <span className="mono">Management</span>
          All tasks and dependencies are coordinated in one task registry.
        </span>
      </div>

      <div className="wf__bottom">
        <ul className="wf__side" aria-label="Supporting functions">
          {SIDE.map((s, i) => {
            const k = FLOW.length + i
            const Icon = EMPLOYEE_ICON[s.employee]
            return (
              <li key={s.employee} className={`wf__side-item rv ${step === k ? 'is-active' : ''}`} style={d(920 + i * 80)}>
                <button type="button" onClick={() => select(k)} aria-current={step === k ? 'step' : undefined}>
                  <span className="wf__side-name">
                    <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                    {employeeById(s.employee).name}
                  </span>
                  <span className="wf__side-fns mono">{s.functions.join(' · ')}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="wf__caption rv" style={d(1040)}>
          <p key={step} className="wf__caption-text" aria-live="polite">
            {current.caption}
          </p>
          <button
            type="button"
            className="wf__play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the walkthrough' : 'Play the walkthrough'}
            disabled={reducedMotion}
          >
            {playing && !reducedMotion ? <Pause size={13} strokeWidth={1.8} /> : <Play size={13} strokeWidth={1.8} />}
          </button>
        </div>
      </div>
    </div>
  )
}
