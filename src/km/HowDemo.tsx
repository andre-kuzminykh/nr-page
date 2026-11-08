import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Prompt } from '../components/Prompt/Prompt'
import { TRY_MS } from '../components/Prompt/useDemo'
import { kmHref } from '../config/links'
import { SCENARIOS, type Scenario } from './content'
import { KnowledgeGraph } from './KnowledgeGraph'
import { Report } from './Report'

const v = (vars: Record<string, string | number>) => vars as CSSProperties

/** The questions How it works plays, each with what happens at every step. */
const FLOW = SCENARIOS.filter((s) => s.how)

/** What happens, step by step; each lights while it happens. */
export const HOW_STEPS = ['Ask', 'Understand', 'Search', 'Count', 'Report']

type Phase = 'type' | 'understand' | 'search' | 'count' | 'report' | 'try'

const STEP: Record<Phase, number> = { type: 0, understand: 1, search: 2, count: 3, report: 4, try: -1 }
const UNDERSTAND_MS = 2400
const NODE_MS = 480
const COUNT_MS = 2600
const READ_MS = 7600

/** Step 2: the question, large; the rest of it fades and the words that matter light up, one after another. */
function Understand({ s }: { s: Scenario }) {
  const parts: { text: string; k?: number }[] = []
  let rest = s.query
  s.how!.marks.forEach((m, k) => {
    const at = rest.indexOf(m)
    if (at < 0) return
    if (at > 0) parts.push({ text: rest.slice(0, at) })
    parts.push({ text: m, k })
    rest = rest.slice(at + m.length)
  })
  if (rest) parts.push({ text: rest })
  return (
    <div className="kh-q">
      <p className="kh-q__text">
        {parts.map((p, i) =>
          p.k === undefined ? (
            <span key={i} className="kh-q__rest">
              {p.text}
            </span>
          ) : (
            <mark key={i} className="kh-mark" style={v({ '--k': p.k })}>
              {p.text}
            </mark>
          ),
        )}
      </p>
    </div>
  )
}

/** Step 4: the sum it does, as one line — the two numbers, then what they come to. */
function Count({ s }: { s: Scenario }) {
  const { a, op, b, result } = s.how!.calc
  return (
    <div className="kh-calc" role="img" aria-label={`${a} ${op} ${b} = ${result}`}>
      <p className="kh-calc__line">
        <span style={v({ '--k': 0 })}>{a}</span>
        <i style={v({ '--k': 1 })}>{op}</i>
        <span style={v({ '--k': 2 })}>{b}</span>
        <i style={v({ '--k': 3 })}>=</i>
      </p>
      <p className="kh-calc__result">{result}</p>
    </div>
  )
}

/**
 * How it works, on one stage over the bar: a question is typed into the bar and sent; it is understood
 * (its words are recognised); the company graph appears and the question walks it; what it found is
 * counted; and the report is composed, part by part. Each question in turn, then “Try it yourself”.
 */
export function HowDemo({ live, onStep }: { live: boolean; onStep?: (step: number) => void }) {
  const [k, setK] = useState(0)
  const [phase, setPhase] = useState<Phase>(live ? 'type' : 'report')
  const [walked, setWalked] = useState(0)
  const [own, setOwn] = useState(false)
  const [round, setRound] = useState(0)
  const timer = useRef(0)
  const s = FLOW[k]
  const walk = s.how!.walk

  useEffect(() => {
    window.clearTimeout(timer.current)
    if (!live || own) return
    const after = (ms: number, then: () => void) => {
      timer.current = window.setTimeout(then, ms)
    }
    if (phase === 'understand') after(UNDERSTAND_MS, () => setPhase('search'))
    else if (phase === 'search') {
      if (walked < walk.length) after(walked === 0 ? 900 : NODE_MS, () => setWalked(walked + 1))
      else after(800, () => setPhase('count'))
    } else if (phase === 'count') after(COUNT_MS, () => setPhase('report'))
    else if (phase === 'report')
      after(READ_MS, () => {
        setWalked(0)
        setRound((r) => r + 1)
        if (k + 1 < FLOW.length) {
          setK(k + 1)
          setPhase('type')
        } else setPhase('try')
      })
    else if (phase === 'try')
      after(TRY_MS, () => {
        setK(0)
        setRound((r) => r + 1)
        setPhase('type')
      })
    return () => window.clearTimeout(timer.current)
  }, [phase, walked, live, own, k, walk.length])

  // arriving starts from the first question; while still (or for reduced motion) it shows its report
  useEffect(() => {
    setK(0)
    setWalked(live ? 0 : FLOW[0].how!.walk.length)
    setPhase(live ? 'type' : 'report')
  }, [live])

  useEffect(() => onStep?.(STEP[phase]), [phase, onStep])

  const lit = phase === 'search' || phase === 'count' ? walk.slice(0, walked) : []
  return (
    <div className={`kh is-${phase}`}>
      <div className="kh-stage" aria-live="polite">
        <div className="kh-graph">
          <KnowledgeGraph on={phase === 'search' || phase === 'count'} lit={lit} />
        </div>
        {phase === 'understand' && <Understand key={`u-${k}-${round}`} s={s} />}
        {phase === 'count' && <Count key={`c-${k}-${round}`} s={s} />}
        {(phase === 'report' || phase === 'try') && <Report key={`r-${k}-${round}`} s={s} run={live && phase === 'report'} />}
      </div>
      <Prompt
        key={`${k}-${round}`}
        label="Ask Knowledge Management"
        placeholder="Ask anything about your company"
        href={kmHref}
        live={live && !own && phase === 'type'}
        text={s.query}
        sent={phase !== 'type'}
        tryIt={phase === 'try'}
        onSent={() => {
          if (phase === 'type') setPhase('understand')
        }}
        delay={k === 0 && round === 0 ? 900 : 500}
        onTake={() => setOwn(true)}
        onLeave={() => setOwn(false)}
      />
    </div>
  )
}
