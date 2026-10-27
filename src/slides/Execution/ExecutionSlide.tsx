import { Pause, Play } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { EXECUTION_ICON } from '../../components/ui/icons'
import { EXECUTION } from '../../data/architecture'
import './Execution.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

type Kind = 'input' | 'fixed' | 'agent' | 'adaptive' | 'skill' | 'output'
interface GraphNode {
  id: string
  label: string
  kind: Kind
  tag: string
  x: number
  y: number
  w?: number
}

/**
 * Phases of one illustrative run (a support request becoming a bug report):
 * 0 run the plan · 1 new context arrives · 2 re-plan the open part · 3 finish
 * 4 output to AI Manager · 5 reflection, checks and a new skill version.
 */
const PHASES = [
  { at: 0, text: 'Running the plan: the request is received and classified.' },
  { at: 2300, text: 'New context arrives: the customer attached logs.' },
  { at: 3300, text: 'The open part of the workflow re-plans. Fixed steps and dependencies stay as they are.' },
  { at: 4400, text: 'Both branches finish; the Bug Reporting skill writes a structured, reproducible report.' },
  { at: 6200, text: 'Output: a new task in the AI Manager registry.' },
  { at: 7000, text: 'The successful run feeds reflection. After checks and tests, the skill gets a new version.' },
]
const CYCLE = 10800

const Y = 148
function nodesFor(phase: number): GraphNode[] {
  const replanned = phase >= 2
  const list: GraphNode[] = [
    { id: 'in', label: 'Support request', kind: 'input', tag: 'Input', x: 64, y: Y, w: 124 },
    { id: 'cls', label: 'Classification', kind: 'agent', tag: 'Agent · fixed', x: 200, y: Y },
    { id: 'rep', label: 'Reproduce issue', kind: 'adaptive', tag: 'Open to re-plan', x: 340, y: replanned ? 210 : Y },
    { id: 'bug', label: 'Bug Reporting', kind: 'skill', tag: phase >= 5 ? 'Skill · v1.4' : 'Skill · v1.3', x: 480, y: Y },
    { id: 'task', label: 'Task → AI Manager', kind: 'output', tag: 'Output · fixed', x: 608, y: Y, w: 136 },
  ]
  if (replanned) list.push({ id: 'logs', label: 'Parse attached logs', kind: 'agent', tag: 'Agent · new step', x: 340, y: 86, w: 140 })
  return list
}

function edgesFor(phase: number): [string, string, boolean][] {
  // [from, to, open-to-replanning]
  if (phase < 2) return [['in', 'cls', false], ['cls', 'rep', true], ['rep', 'bug', true], ['bug', 'task', false]]
  return [
    ['in', 'cls', false],
    ['cls', 'logs', true],
    ['cls', 'rep', true],
    ['logs', 'bug', true],
    ['rep', 'bug', true],
    ['bug', 'task', false],
  ]
}

const W = 120
const H = 46
const anchorOut = (n: GraphNode) => [n.x + (n.w ?? W) / 2, n.y] as const
const anchorIn = (n: GraphNode) => [n.x - (n.w ?? W) / 2, n.y] as const

function edgePath(a: GraphNode, b: GraphNode) {
  const [x1, y1] = anchorOut(a)
  const [x2, y2] = anchorIn(b)
  const mx = (x1 + x2) / 2
  return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
}

/** A light token running through a list of points (WAAPI on an SVG circle). */
function Token({ points, delay, duration }: { points: (readonly [number, number])[]; delay: number; duration: number }) {
  const ref = useRef<SVGCircleElement>(null)
  const sig = JSON.stringify(points)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const lens = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]))
    const total = lens.reduce((a, b) => a + b, 0) || 1
    let acc = 0
    const frames: Keyframe[] = points.map((p, i) => {
      if (i > 0) acc += lens[i - 1]
      return { transform: `translate(${p[0]}px, ${p[1]}px)`, offset: acc / total, opacity: 1 }
    })
    frames[0].opacity = 0
    frames.splice(1, 0, { ...frames[0], opacity: 1, offset: Math.min(0.04, (frames[1].offset as number) / 2) })
    frames[frames.length - 1] = { ...frames[frames.length - 1], opacity: 0 }
    const anim = el.animate(frames, { duration, delay, fill: 'both', easing: 'cubic-bezier(0.45, 0, 0.3, 1)' })
    return () => anim.cancel()
  }, [sig, delay, duration])
  return <circle ref={ref} r="4" className="ex-token" />
}

/** Execution Visualization — a live, re-planning workflow graph. */
export function ExecutionSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [phase, setPhase] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!shown) {
      setPhase(0)
      setPlaying(true)
      return
    }
    if (reducedMotion || !playing || !active) {
      if (reducedMotion) setPhase(5)
      return
    }
    setPhase(0)
    const timers = PHASES.map((p, i) => window.setTimeout(() => setPhase(i), p.at + 300))
    timers.push(window.setTimeout(() => setCycle((c) => c + 1), CYCLE))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [shown, active, playing, cycle, reducedMotion])

  const nodes = nodesFor(phase)
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const edges = edgesFor(phase).filter(([a, b]) => byId[a] && byId[b])
  const live = active && playing && !reducedMotion
  const P = (id: string, side: 'in' | 'out' | 'c' = 'c') =>
    side === 'in' ? anchorIn(byId[id]) : side === 'out' ? anchorOut(byId[id]) : ([byId[id].x, byId[id].y] as const)

  return (
    <div className="slide__frame ex">
      <div className="ex__text">
        <Eyebrow index={8}>Execution</Eyebrow>
        <h2 className="h2 ex__title">
          <span className="mask" style={d(50)}>
            <span>Not just answers.</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>Actual work.</span>
          </span>
        </h2>

        <dl className="ex__defs">
          {EXECUTION.map((u, i) => {
            const Icon = EXECUTION_ICON[u.id]
            return (
              <div key={u.id} className="ex__def rv" style={d(260 + i * 80)}>
                <dt>
                  <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                  {u.name}
                </dt>
                <dd>{u.definition}</dd>
              </div>
            )
          })}
        </dl>

        <ul className="ex__notes rv" style={d(520)}>
          <li>Some steps and dependencies are fixed; others stay open and are re-planned when new context arrives.</li>
          <li>A skill can form from successful, repeatable experience and use a versioned workflow.</li>
          <li>Operations improve through verified feedback and reflection — every change goes through checks and tests.</li>
        </ul>
      </div>

      <figure className="ex__stage rv rv--fade" style={d(200)}>
        <div className="ex__stage-head">
          <span className="label">Illustrative run</span>
          <button
            type="button"
            className="ex__play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause the animation' : 'Play the animation'}
            disabled={reducedMotion}
          >
            {live ? <Pause size={13} strokeWidth={1.8} /> : <Play size={13} strokeWidth={1.8} />}
          </button>
        </div>

        <svg className="ex-graph" viewBox="0 0 680 240" role="img" aria-label="Workflow graph: support request, classification, reproduce issue, bug reporting skill, task in AI Manager. New context adds a step to parse attached logs.">
          <defs>
            <linearGradient id="ex-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#8b55f6" />
              <stop offset="0.5" stopColor="#d63cf5" />
              <stop offset="1" stopColor="#f9894b" />
            </linearGradient>
          </defs>

          {/* incoming context */}
          <g className={`ex-ctx ${phase >= 1 ? 'is-on' : ''}`}>
            <rect x="235" y="6" width="210" height="28" rx="14" />
            <text x="340" y="24" textAnchor="middle">New context · logs attached</text>
            <path d={phase >= 2 ? 'M340 34 V63' : 'M340 34 V127'} className="ex-ctx__link" />
          </g>

          {edges.map(([a, b, open]) => {
            const path = edgePath(byId[a], byId[b])
            return <path key={`${a}-${b}-${path}`} d={path} className={`ex-edge ${open ? 'is-open' : ''}`} />
          })}

          {nodes.map((n) => (
            <g key={n.id} className={`ex-node ex-node--${n.kind} ${phase >= 4 && n.id === 'task' ? 'is-done' : ''} ${phase === 5 && n.id === 'bug' ? 'is-upgraded' : ''}`} style={{ transform: `translate(${n.x}px, ${n.y}px)` }}>
              <rect x={-(n.w ?? W) / 2} y={-H / 2} width={n.w ?? W} height={H} rx="10" />
              <text className="ex-node__label" y="-1" textAnchor="middle">{n.label}</text>
              <text className="ex-node__tag" y="14" textAnchor="middle">{n.tag}</text>
            </g>
          ))}

          {live && phase === 0 && <Token key={`a${cycle}`} points={[P('in', 'out'), P('cls', 'in'), P('cls', 'out'), P('rep', 'in')]} delay={500} duration={1500} />}
          {live && phase === 3 && (
            <>
              <Token key={`b${cycle}`} points={[P('cls', 'out'), P('logs', 'in'), P('logs', 'out'), P('bug', 'in'), P('bug', 'out'), P('task', 'in')]} delay={0} duration={1700} />
              <Token key={`c${cycle}`} points={[P('cls', 'out'), P('rep', 'in'), P('rep', 'out'), P('bug', 'in')]} delay={150} duration={1250} />
            </>
          )}
        </svg>

        <div className="ex__legend" aria-hidden="true">
          <span><i className="ex-key ex-key--solid" />Fixed step or dependency</span>
          <span><i className="ex-key ex-key--dash" />Open to re-planning</span>
        </div>

        <ol className="ex__skill" aria-label="How a skill improves">
          {['Successful runs', 'Reflection', 'Checks & tests', 'Skill · v1.4'].map((s, i) => (
            <li key={s} className={phase >= 5 ? 'is-on' : ''} style={{ '--i': i } as CSSProperties}>
              {s}
            </li>
          ))}
        </ol>

        <p className="ex__caption" aria-live="polite">
          <span key={phase}>{PHASES[phase].text}</span>
        </p>
      </figure>
    </div>
  )
}
