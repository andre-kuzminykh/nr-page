import { CalendarCheck, Coins, ListTodo, Target, UserRound, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Prompt } from '../components/Prompt/Prompt'
import { TRY_MS } from '../components/Prompt/useDemo'
import { kmHref } from '../config/links'
import { KnowledgeGraph } from './KnowledgeGraph'
import { useCount } from './ReportDemo'

interface Ask {
  q: string
  /** the records the question walks through, in order */
  walk: string[]
  /** the answer: its figure, the line under it, and what it was found in */
  value: number
  unit: string
  decimals?: boolean
  label: string
  /** progress against plan, when the answer is a status */
  plan?: { value: number; expected: number }
  text: string
  sources: { icon: LucideIcon; name: string }[]
}

/** Two questions to the demo workspace, each a different walk through it. */
const ASKS: Ask[] = [
  {
    q: 'How much do we owe Lena Stone?',
    walk: ['ls', 'book', 'acc'],
    value: 300,
    unit: 'EUR',
    decimals: true,
    label: 'to pay · 0 paid',
    text: 'One accrual, for her booking as a designer.',
    sources: [
      { icon: UserRound, name: 'Lena Stone' },
      { icon: CalendarCheck, name: 'Booking' },
      { icon: Coins, name: 'Accrual' },
    ],
  },
  {
    q: 'How is Launch Neuronium 1.0 going?',
    walk: ['goal', 'draft', 'am'],
    value: 25,
    unit: '%',
    label: 'done · 29% expected',
    plan: { value: 25, expected: 29 },
    text: 'Draft the article is in progress, with Alex Mercer.',
    sources: [
      { icon: Target, name: 'Launch Neuronium 1.0' },
      { icon: ListTodo, name: 'Draft the article' },
      { icon: UserRound, name: 'Alex Mercer' },
    ],
  },
]

/** What happens, in four words; each lights while it happens. */
export const HOW_STEPS = ['Ask', 'Search the graph', 'Count', 'Answer']

const WALK_MS = 650
const ANSWER_MS = 5600

type Phase = 'type' | 'search' | 'answer' | 'try'

function Answer({ a, run }: { a: Ask; run: boolean }) {
  const n = useCount(a.value, run, 200, 900)
  return (
    <div className="kh-answer">
      <p className="kh-answer__v">
        {a.decimals ? `${n}.00` : n}
        <small>{a.unit}</small>
      </p>
      <p className="kh-answer__l">{a.label}</p>
      {a.plan && (
        <span className="kh-plan" style={{ '--v': `${a.plan.value}%`, '--e': `${a.plan.expected}%` } as CSSProperties} aria-hidden="true">
          <i />
          <b />
        </span>
      )}
      <p className="kh-answer__t">{a.text}</p>
      <ul className="kh-src" aria-label="Sources">
        {a.sources.map((s, i) => {
          const Icon = s.icon
          return (
            <li key={s.name} style={{ '--k': i } as CSSProperties}>
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              {s.name}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * How it works, on one stage: a question is typed into the bar and sent; the company graph appears
 * above it and the question walks it, record by record; then the graph steps back and the answer
 * rises in its place. Two questions, then “Try it yourself”.
 */
export function HowDemo({ live, onStep }: { live: boolean; onStep?: (step: number) => void }) {
  const [k, setK] = useState(0)
  const [phase, setPhase] = useState<Phase>(live ? 'type' : 'answer')
  const [walked, setWalked] = useState(0)
  const [own, setOwn] = useState(false)
  const [round, setRound] = useState(0)
  const timer = useRef(0)
  const a = ASKS[k]

  useEffect(() => {
    window.clearTimeout(timer.current)
    if (!live || own) return
    if (phase === 'search') {
      timer.current = window.setTimeout(
        () => {
          if (walked < a.walk.length) setWalked(walked + 1)
          else setPhase('answer')
        },
        walked === 0 ? 900 : walked < a.walk.length ? WALK_MS : 700,
      )
    } else if (phase === 'answer') {
      timer.current = window.setTimeout(() => {
        setWalked(0)
        setRound((r) => r + 1)
        if (k + 1 < ASKS.length) {
          setK(k + 1)
          setPhase('type')
        } else setPhase('try')
      }, ANSWER_MS)
    } else if (phase === 'try') {
      timer.current = window.setTimeout(() => {
        setK(0)
        setRound((r) => r + 1)
        setPhase('type')
      }, TRY_MS)
    }
    return () => window.clearTimeout(timer.current)
  }, [phase, walked, live, own, k, a.walk.length])

  // arriving starts from the first question; while still (or for reduced motion) it shows its answer
  useEffect(() => {
    setK(0)
    setWalked(live ? 0 : ASKS[0].walk.length)
    setPhase(live ? 'type' : 'answer')
  }, [live])

  const step = phase === 'type' || phase === 'try' ? 0 : phase === 'answer' ? 3 : walked < a.walk.length ? 1 : 2
  useEffect(() => onStep?.(phase === 'try' ? -1 : step), [step, phase, onStep])

  const lit = phase === 'search' || phase === 'answer' ? a.walk.slice(0, walked) : []
  return (
    <div className={`kh is-${phase}`}>
      <div className="kh-stage">
        <div className="kh-graph">
          <KnowledgeGraph on={phase === 'search' || phase === 'answer'} lit={lit} />
        </div>
        {phase === 'answer' && <Answer key={`${k}-${round}`} a={a} run={live} />}
      </div>
      <Prompt
        key={`${k}-${round}`}
        label="Ask Knowledge Management"
        placeholder="Ask anything about your company"
        href={kmHref}
        live={live && !own && phase === 'type'}
        text={a.q}
        sent={phase !== 'type'}
        tryIt={phase === 'try'}
        onSent={() => {
          if (phase === 'type') setPhase('search')
        }}
        delay={k === 0 ? 900 : 500}
        onTake={() => setOwn(true)}
        onLeave={() => setOwn(false)}
      />
    </div>
  )
}
