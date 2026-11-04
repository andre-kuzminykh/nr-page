import { Blocks, Cpu, ShieldCheck, UserCheck, Workflow, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Sym, Type } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { EXECUTION_ICON } from '../../components/ui/icons'
import { EXECUTION } from '../../data/architecture'
import './Custom.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

type Kind = 'workflow' | 'agent' | 'skill' | 'person'
const KIND: Record<Kind, { label: string; icon: LucideIcon }> = {
  workflow: { label: 'Workflow', icon: Workflow },
  agent: { label: 'Agent', icon: Cpu },
  skill: { label: 'Skill', icon: Blocks },
  person: { label: 'Approval', icon: UserCheck },
}

interface UseCase {
  n: number
  symbol: string
  name: string
  goal: string
  steps: { kind: Kind; text: string; uses?: number[] }[]
  access: string
}

/** Example custom AI employees. They continue the table: element 101 and beyond. */
const CASES: UseCase[] = [
  {
    n: 101,
    symbol: 'Ts',
    name: 'Tender Scout',
    goal: 'Find public tenders that fit our offers and prepare a bid draft.',
    steps: [
      { kind: 'workflow', text: 'Every morning at 8:00' },
      { kind: 'agent', text: 'Search new public tenders', uses: [61] },
      { kind: 'skill', text: 'Match tenders to our offers', uses: [41] },
      { kind: 'workflow', text: 'Draft the bid from templates', uses: [73] },
      { kind: 'person', text: 'You approve before it is sent' },
      { kind: 'workflow', text: 'Track it as a task', uses: [4] },
    ],
    access: 'Read: Drive, offers · Write: tasks',
  },
  {
    n: 102,
    symbol: 'Iu',
    name: 'Investor Update',
    goal: 'Send investors a monthly update with real numbers and a short story.',
    steps: [
      { kind: 'workflow', text: 'First Monday of the month' },
      { kind: 'skill', text: 'Collect sales and marketing numbers', uses: [50, 29] },
      { kind: 'agent', text: 'Write the update', uses: [69] },
      { kind: 'workflow', text: 'Design a two-page deck', uses: [73] },
      { kind: 'person', text: 'The founder approves' },
      { kind: 'workflow', text: 'Draft the email to investors', uses: [9] },
    ],
    access: 'Read: analytics, Drive · Write: email drafts',
  },
  {
    n: 103,
    symbol: 'Sv',
    name: 'Supplier Check',
    goal: 'Check every new supplier before the first contract.',
    steps: [
      { kind: 'workflow', text: 'When a supplier is added' },
      { kind: 'agent', text: 'Research the company', uses: [61] },
      { kind: 'skill', text: 'Score the risks', uses: [67] },
      { kind: 'workflow', text: 'Prepare the contract checklist', uses: [64] },
      { kind: 'person', text: 'Procurement lead approves' },
      { kind: 'workflow', text: 'Create the onboarding task', uses: [4] },
    ],
    access: 'Read: documents · Write: tasks',
  },
]

export function CustomSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [k, setK] = useState(0)
  const [step, setStep] = useState(reducedMotion ? 99 : 0)
  const uc = CASES[k]
  const live = active && !reducedMotion

  // Steps snap in one by one; then the next example follows unless someone picked one.
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!shown) {
      setK(0)
      setAuto(true)
    }
  }, [shown])

  useEffect(() => {
    if (!live) {
      setStep(99)
      return
    }
    setStep(0)
    let i = 0
    const t = window.setInterval(() => {
      i += 1
      setStep(i)
      if (i > uc.steps.length + 6) {
        window.clearInterval(t)
        if (auto) setK((x) => (x + 1) % CASES.length)
      }
    }, 650)
    return () => window.clearInterval(t)
  }, [k, live, auto, uc.steps.length])

  const pick = (i: number) => {
    setAuto(false)
    setK(i)
  }

  return (
    <div className="slide__frame cu">
      <div className="cu__text">
        <h2 className="h2 cu__title">
          <span className="mask" style={d(40)}>
            <span>Your use case.</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>Your AI employee.</span>
          </span>
        </h2>
        <p className="cu__copy rv" style={d(260)}>
          Combine AI Agents, AI Workflows and AI Skills on top of your business context — with AI Governance
          on every step. Your AI employees join the table as element 101 and beyond.
        </p>
        <ul className="cu__units rv" style={d(340)}>
          {EXECUTION.map((u) => {
            const Icon = EXECUTION_ICON[u.id]
            return (
              <li key={u.id}>
                <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                <span>
                  <b>{u.name}</b> {u.definition}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="cu__cases rv" style={d(440)} role="tablist" aria-label="Example use cases">
          {CASES.map((c, i) => (
            <button
              key={c.n}
              type="button"
              role="tab"
              aria-selected={i === k}
              className="cu__case"
              onClick={() => pick(i)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <section className="cu__builder pn is-focus rv rv--scale" style={d(300)} aria-label={`Example: ${uc.name}`}>
        <div className="pn__head">
          <Blocks size={14} strokeWidth={1.7} aria-hidden="true" />
          <span className="pn__title">New AI employee</span>
          <span className="pn__meta">Example</span>
        </div>
        <div className="pn__body cu__body" key={uc.n}>
          <div className="cu__id">
            <span className="cu__el" aria-hidden="true">
              <span className="cu__el-n">{uc.n}</span>
              <span className="cu__el-sym">{uc.symbol}</span>
            </span>
            <div className="cu__id-text">
              <p className="cu__name">
                <Type text={uc.name} play={live} speed={45} delay={150} />
              </p>
              <p className="cu__goal">{uc.goal}</p>
            </div>
          </div>

          <ol className="cu__steps">
            {uc.steps.map((s, i) => {
              const K = KIND[s.kind]
              return (
                <li key={i} className={`cu__step cu__step--${s.kind} ${i < step ? 'is-in' : ''} ${i === step - 1 && live ? 'is-now' : ''}`}>
                  <span className="cu__step-kind">
                    <K.icon size={12} strokeWidth={1.8} aria-hidden="true" />
                    {K.label}
                  </span>
                  <span className="cu__step-text">{s.text}</span>
                  {s.uses && (
                    <span className="cu__uses" aria-label="Uses AI employees">
                      {s.uses.map((n) => (
                        <Sym key={n} n={n} />
                      ))}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="cu__gov">
            <ShieldCheck size={13} strokeWidth={1.7} aria-hidden="true" />
            <span>
              <b>Policy</b> no outside messages without approval
            </span>
            <span>
              <b>Access</b> {uc.access}
            </span>
            <span>
              <b>Oversight</b> approval step
            </span>
            <span>
              <b>Control</b> pause · version history
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
