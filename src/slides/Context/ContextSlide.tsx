import {
  BrainCircuit,
  CalendarDays,
  Database,
  FileText,
  GitBranch,
  HardDrive,
  Hash,
  Mail,
  MessageCircle,
  Network,
  Plug,
  Send,
  ShieldCheck,
  Sheet,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Sym } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { OS } from '../../data/architecture'
import { employeeByN } from '../../data/departments'
import './Context.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

const SOURCES: [LucideIcon, string][] = [
  [HardDrive, 'Drive'],
  [FileText, 'Docs'],
  [Sheet, 'Sheets'],
  [CalendarDays, 'Calendar'],
  [Video, 'Meet'],
  [Mail, 'Gmail'],
  [Send, 'Telegram'],
  [Hash, 'Slack'],
  [MessageCircle, 'WhatsApp'],
  [Database, 'Apollo'],
  [GitBranch, 'Code'],
  [Plug, 'APIs'],
]

/** Illustrative knowledge graph slice; node ids match the context the Superagent pulls in. */
const NODES: { id: string; type: string; label: string; x: number; y: number }[] = [
  { id: 'goal', type: 'Goal', label: 'Launch MVP', x: 50, y: 16 },
  { id: 'product', type: 'Product', label: 'Mobile App', x: 82, y: 38 },
  { id: 'customers', type: 'Customers', label: 'Small agencies', x: 76, y: 80 },
  { id: 'prd', type: 'Document', label: 'PRD v1', x: 22, y: 44 },
  { id: 'meeting', type: 'Meeting', label: 'Weekly review', x: 16, y: 82 },
  { id: 'brand', type: 'Document', label: 'Brand book', x: 46, y: 62 },
]
const EDGES: [string, string][] = [
  ['goal', 'product'],
  ['product', 'customers'],
  ['goal', 'prd'],
  ['prd', 'meeting'],
  ['product', 'brand'],
  ['brand', 'customers'],
  ['prd', 'brand'],
]

const CONTEXT: { node: string; label: string }[] = [
  { node: 'prd', label: 'PRD v1 · Drive' },
  { node: 'meeting', label: 'Weekly review · Meet' },
  { node: 'customers', label: 'Pipeline · Apollo' },
  { node: 'brand', label: 'Brand book · Docs' },
]

const PLAN = [22, 24, 74, 42, 44, 4]
const STEP_MS = 900

/** Shared business context feeding one Superagent that runs work across the AI employees. */
export function ContextSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const total = CONTEXT.length + PLAN.length + 2
  const [t, setT] = useState(reducedMotion ? total : 0)

  useEffect(() => {
    if (!shown) {
      setT(reducedMotion ? total : 0)
      return
    }
    if (reducedMotion || !active) {
      if (reducedMotion) setT(total)
      return
    }
    setT(0)
    let k = 0
    const timer = window.setInterval(() => {
      k += 1
      setT(k)
      if (k >= total + 6) {
        k = 0
        setT(0)
      }
    }, STEP_MS)
    return () => window.clearInterval(timer)
  }, [shown, active, reducedMotion, total])

  // t: 1..4 context chips arrive, then plan steps start one by one.
  const ctxShown = Math.min(CONTEXT.length, Math.max(0, t))
  const planT = t - CONTEXT.length
  const lit = new Set(CONTEXT.slice(0, ctxShown).map((c) => c.node))

  return (
    <div className="slide__frame ctx">
      <div className="ctx__text">
        <h2 className="h2 ctx__title">
          <span className="mask" style={d(40)}>
            <span>Shared context.</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>One Superagent.</span>
          </span>
        </h2>
        <p className="ctx__copy rv" style={d(260)}>
          Files, calendars, conversations and tools become one business context — your AI Identity and
          AI Knowledge Graph. The AI Superagent uses it to run complex work across 100 AI employees.
        </p>

        <div className="ctx__sources rv" style={d(360)}>
          <ul className="ctx__icons" aria-label="Example sources">
            {SOURCES.map(([Icon, label], k) => (
              <li key={label} className="ctx__src" style={{ '--i': k } as CSSProperties}>
                <span className="ctx__src-icon">
                  <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="ctx__src-label">{label}</span>
              </li>
            ))}
          </ul>
          <p className="ctx__via">
            <span className="ctx__via-line" aria-hidden="true" />
            Connected through MCP and integrations · examples, availability varies
          </p>
        </div>
      </div>

      <div className="ctx__stage">
        <section className="ctx__graph pn rv rv--scale" style={d(300)} aria-label="AI Identity and AI Knowledge Graph">
          <div className="pn__head">
            <Network size={14} strokeWidth={1.7} aria-hidden="true" />
            <span className="pn__title">AI Knowledge Graph</span>
            <span className="pn__meta">AI Identity · goals and context</span>
          </div>
          <div className="ctx__graph-body">
            <svg className="ctx__edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {EDGES.map(([a, b]) => {
                const A = NODES.find((n) => n.id === a)!
                const B = NODES.find((n) => n.id === b)!
                const on = lit.has(a) || lit.has(b)
                return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} className={on ? 'is-on' : ''} />
              })}
            </svg>
            {NODES.map((n) => (
              <span
                key={n.id}
                className={`ctx__node ${lit.has(n.id) ? 'is-lit' : ''}`}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <span className="ctx__node-dot" />
                <span className="ctx__node-type">{n.type}</span>
                <span className="ctx__node-label">{n.label}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="ctx__agent pn is-focus rv rv--scale" style={d(420)} aria-label="AI Superagent">
          <div className="pn__head">
            <BrainCircuit size={14} strokeWidth={1.7} aria-hidden="true" />
            <span className="pn__title">AI Superagent</span>
            <span className="pn__meta">Live plan</span>
          </div>
          <div className="pn__body ctx__agent-body">
            <p className="ctx__ask">Prepare the Mobile App launch for small agencies.</p>
            <div className="ctx__chips" aria-label="Context used">
              {CONTEXT.map((c, k) => (
                <span key={c.label} className={`k-chip ${k < ctxShown ? 'is-on is-in' : 'is-wait'}`}>
                  {c.label}
                </span>
              ))}
            </div>
            <ol className="ctx__plan">
              {PLAN.map((n, k) => {
                const e = employeeByN(n)
                const state = planT > k + 1 ? 'done' : planT > k ? 'run' : 'wait'
                return (
                  <li key={n} className={`ctx__step is-${state}`}>
                    <Sym n={n} />
                    <span className="ctx__step-name">{e.name}</span>
                    <span className="ctx__step-state">{state === 'done' ? 'Done' : state === 'run' ? 'Working' : 'Queued'}</span>
                  </li>
                )
              })}
            </ol>
            <p className="ctx__gov">
              <ShieldCheck size={13} strokeWidth={1.7} aria-hidden="true" />
              {OS.governance.name} · {OS.governance.functions.join(' · ')}
              <span className="k-muted"> — emails wait for your approval</span>
            </p>
          </div>
        </section>
        <p className="ctx__note mono">Interface preview · sample data</p>
      </div>
    </div>
  )
}
