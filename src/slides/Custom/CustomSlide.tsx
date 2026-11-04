import {
  Blocks,
  CalendarDays,
  Clock,
  Database,
  FileText,
  HardDrive,
  ListChecks,
  ListTodo,
  Mail,
  PenLine,
  Plug,
  Presentation,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Type } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { EXECUTION_ICON } from '../../components/ui/icons'
import { EXECUTION } from '../../data/architecture'
import { FlowGraph, FLOW_TIMING, type FlowCase } from './Flow'
import './Custom.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

interface UseCase {
  n: number
  symbol: string
  name: string
  goal: string
  flow: FlowCase
}

/** Example custom AI employees. They continue the table: element 101 and beyond. */
const CASES: UseCase[] = [
  {
    n: 101,
    symbol: 'Ts',
    name: 'Tender Scout',
    goal: 'Finds public tenders that fit our offers and prepares the bid.',
    flow: {
      main: [
        { kind: 'system', icon: Clock, label: 'Every day, 8:00' },
        { kind: 'llm', icon: Search, label: 'Find new tenders' },
        { kind: 'llm', icon: Sparkles, label: 'Match to our offers' },
        { kind: 'llm', icon: FileText, label: 'Draft the bid' },
        { kind: 'human', icon: UserCheck, label: 'You approve' },
        { kind: 'system', icon: Send, label: 'Submit and add a task' },
      ],
      side: { kind: 'system', icon: HardDrive, label: 'Offers · Drive', into: 2 },
      loop: [4, 3],
    },
  },
  {
    n: 102,
    symbol: 'Iu',
    name: 'Investor Update',
    goal: 'Sends investors a monthly update with real numbers and a short story.',
    flow: {
      main: [
        { kind: 'system', icon: CalendarDays, label: 'First Monday' },
        { kind: 'system', icon: Database, label: 'Pull the numbers' },
        { kind: 'llm', icon: PenLine, label: 'Write the update' },
        { kind: 'llm', icon: Presentation, label: 'Two-page deck' },
        { kind: 'human', icon: UserCheck, label: 'Founder approves' },
        { kind: 'system', icon: Mail, label: 'Email investors' },
      ],
      side: { kind: 'system', icon: FileText, label: 'Last month · Docs', into: 2 },
      loop: [4, 3],
    },
  },
  {
    n: 103,
    symbol: 'Sv',
    name: 'Supplier Check',
    goal: 'Checks every new supplier before the first contract.',
    flow: {
      main: [
        { kind: 'system', icon: Plug, label: 'New supplier added' },
        { kind: 'llm', icon: Search, label: 'Research the company' },
        { kind: 'llm', icon: ShieldAlert, label: 'Score the risks' },
        { kind: 'llm', icon: ListChecks, label: 'Contract checklist' },
        { kind: 'human', icon: UserCheck, label: 'Procurement approves' },
        { kind: 'system', icon: ListTodo, label: 'Onboarding task' },
      ],
      side: { kind: 'system', icon: Database, label: 'Registry · web', into: 2 },
      loop: [4, 3],
    },
  },
]

const narrow = () => window.matchMedia?.('(max-width: 600px)').matches ?? false

export function CustomSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [k, setK] = useState(0)
  const uc = CASES[k]
  const live = active && !reducedMotion
  const [vertical, setVertical] = useState(narrow)
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 600px)')
    if (!mq) return
    const on = () => setVertical(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // The graph builds, data runs through it once, then the next example follows — unless someone picked one.
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!shown) {
      setK(0)
      setAuto(true)
    }
  }, [shown])

  useEffect(() => {
    if (!live || !auto) return
    const t = window.setTimeout(() => setK((x) => (x + 1) % CASES.length), (FLOW_TIMING.START + FLOW_TIMING.RUN * 1.15) * 1000)
    return () => window.clearTimeout(t)
  }, [k, live, auto])

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
          <div className="cu__graph" key={`${uc.n}-${shown ? 'on' : 'off'}`}>
            <FlowGraph flow={uc.flow} vertical={vertical} still={reducedMotion} />
          </div>
          <p className="cu__legend mono" aria-hidden="true">
            <span className="is-system">System</span>
            <span className="is-human">Human</span>
            <span className="is-llm">LLM</span>
          </p>
        </div>
      </section>
    </div>
  )
}
