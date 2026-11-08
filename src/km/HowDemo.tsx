import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Prompt } from '../components/Prompt/Prompt'
import { TRY_MS } from '../components/Prompt/useDemo'
import { kmHref } from '../config/links'
import { SCENARIOS, type Scenario } from './content'
import { KnowledgeGraph } from './KnowledgeGraph'
import { Report, useCount } from './Report'

const v = (vars: Record<string, string | number>) => vars as CSSProperties

/** The questions How it works plays, each with what happens at every step. */
const FLOW = SCENARIOS.filter((s) => s.how)

/** What happens, step by step; each lights while it happens. */
export const HOW_STEPS = ['Ask', 'Understand', 'Search the graph', 'Count', 'Compose the report']

type Phase = 'type' | 'understand' | 'search' | 'count' | 'report' | 'try'

const STEP: Record<Phase, number> = { type: 0, understand: 1, search: 2, count: 3, report: 4, try: -1 }
const UNDERSTAND_MS = 2300
const NODE_MS = 420
const COUNT_MS = 2500
const READ_MS = 7600

/** Step 2: the question, its words recognised — each marked with what it was recognised as. */
function Understand({ s }: { s: Scenario }) {
  const marks = s.how!.marks
  const parts: { text: string; as?: string; k?: number }[] = []
  let rest = s.query
  marks.forEach((m, k) => {
    const at = rest.indexOf(m.text)
    if (at < 0) return
    if (at > 0) parts.push({ text: rest.slice(0, at) })
    parts.push({ text: m.text, as: m.as, k })
    rest = rest.slice(at + m.text.length)
  })
  if (rest) parts.push({ text: rest })
  return (
    <div className="kh-q">
      <p className="kh-q__text">
        {parts.map((p, i) =>
          p.as ? (
            <span key={i} className="kh-mark" style={v({ '--k': p.k! })}>
              <span className="kh-mark__w">{p.text}</span>
              <span className="kh-mark__as">{p.as}</span>
            </span>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
    </div>
  )
}

/** Step 3: the records it walks, counted as it goes. */
function Walked({ s, run }: { s: Scenario; run: boolean }) {
  const n = useCount(s.walked, run, 300, 900 + s.how!.walk.length * NODE_MS)
  return (
    <p className="kh-walked">
      <b>{n}</b> records
    </p>
  )
}

/** Step 4: the numbers it found, and what they come to. */
function Count({ s }: { s: Scenario }) {
  const { items, result } = s.how!.calc
  return (
    <div className="kh-calc">
      <div className="kh-calc__items">
        {items.map((x, i) => (
          <p key={x.l} className="kh-calc__item" style={v({ '--k': i })}>
            <b>{x.v}</b>
            <span>{x.l}</span>
          </p>
        ))}
      </div>
      <i className="kh-calc__line" aria-hidden="true" />
      <p className="kh-calc__result">
        <b>{result.v}</b>
        <span>{result.l}</span>
      </p>
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
        {phase === 'search' && <Walked key={`w-${k}-${round}`} s={s} run={live} />}
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
