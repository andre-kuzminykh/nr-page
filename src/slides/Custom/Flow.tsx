import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

/*
 * A custom AI employee drawn as a node graph, the way a workflow editor shows it:
 * grey nodes are the system, orange nodes are people, violet nodes are the LLM.
 * Data runs along the connections in a violet-to-orange stream, one node after another.
 */

export type FlowKind = 'system' | 'human' | 'llm'

export interface FlowStep {
  kind: FlowKind
  icon: LucideIcon
  label: string
}

export interface FlowCase {
  /** six steps in a line */
  main: FlowStep[]
  /** a source of context that feeds one step from the side */
  side: FlowStep & { into: number }
  /** a person sends work back for changes: [from, to] */
  loop: [number, number]
}

const RUN = 6 // seconds for one pass of data, with a pause at the end
const MOVE = 0.8 // part of the pass spent moving
const START = 2.2 // after the graph has been drawn

interface Geo {
  w: number
  h: number
  node: (i: number) => [number, number]
  side: [number, number]
  edge: (i: number) => string
  sideEdge: string
  loopEdge: string
  run: string
  label: (i: number) => { x: number; y: number; anchor: 'start' | 'middle' }
  sideLabel: { x: number; y: number; anchor: 'start' | 'middle' }
  font: number
}

const S = 22 // half a node

function across(into: number, loop: [number, number]): Geo {
  const y = 128
  const sy = 30
  const xs = [50, 150, 250, 350, 450, 550]
  const [a, b] = loop
  return {
    w: 600,
    h: 196,
    node: (i) => [xs[i], y],
    side: [xs[into], sy],
    edge: (i) => `M${xs[i] + S} ${y}L${xs[i + 1] - S} ${y}`,
    sideEdge: `M${xs[into]} ${sy + S}L${xs[into]} ${y - S}`,
    loopEdge: `M${xs[a]} ${y - S}C${xs[a]} ${y - 70} ${xs[b]} ${y - 70} ${xs[b]} ${y - S}`,
    run: `M${xs[0]} ${y}L${xs[5]} ${y}`,
    label: (i) => ({ x: xs[i], y: y + S + 17, anchor: 'middle' }),
    sideLabel: { x: xs[into] + S + 10, y: sy + 4, anchor: 'start' },
    font: 10.5,
  }
}

function down(into: number, loop: [number, number]): Geo {
  const x = 56
  const ys = [30, 92, 154, 216, 278, 340]
  const [a, b] = loop
  const sx = 286
  return {
    w: 340,
    h: 376,
    node: (i) => [x, ys[i]],
    side: [sx, ys[into]],
    edge: (i) => `M${x} ${ys[i] + S}L${x} ${ys[i + 1] - S}`,
    sideEdge: `M${sx - S} ${ys[into] + 9}L${x + S} ${ys[into] + 9}`,
    loopEdge: `M${x - S} ${ys[a]}C${x - 50} ${ys[a]} ${x - 50} ${ys[b]} ${x - S} ${ys[b]}`,
    run: `M${x} ${ys[0]}L${x} ${ys[5]}`,
    label: (i) => ({ x: x + S + 13, y: i === into ? ys[i] - 5 : ys[i] + 5, anchor: 'start' }),
    sideLabel: { x: sx, y: ys[into] + S + 17, anchor: 'middle' },
    font: 13.5,
  }
}

/** Two lines at most, broken between words. */
function lines(label: string, max: number) {
  const words = label.split(' ')
  const out: string[] = []
  let cur = ''
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > max) {
      out.push(cur)
      cur = w
    } else cur = cur ? `${cur} ${w}` : w
  }
  if (cur) out.push(cur)
  return out.slice(0, 2)
}

function Node({ step, x, y, i, font, l, vertical }: { step: FlowStep; x: number; y: number; i: number; font: number; l: Geo['sideLabel']; vertical: boolean }) {
  const Icon = step.icon
  const text = lines(step.label, vertical ? 26 : 14)
  return (
    <g className={`fl-n fl-n--${step.kind}`} style={{ '--i': i } as CSSProperties}>
      <g transform={`translate(${x} ${y})`}>
        <g className="fl-n__pop">
          <rect className="fl-n__glow" x={-S - 5} y={-S - 5} width={2 * S + 10} height={2 * S + 10} rx={16} />
          <rect className="fl-n__rect" x={-S} y={-S} width={2 * S} height={2 * S} rx={12} />
          <Icon x={-9.5} y={-9.5} width={19} height={19} strokeWidth={1.7} className="fl-n__ic" aria-hidden="true" />
        </g>
      </g>
      <text className="fl-n__label" x={l.x} y={l.y} textAnchor={l.anchor} fontSize={font}>
        {text.map((t, k) => (
          <tspan key={k} x={l.x} dy={k ? font * 1.25 : 0}>
            {t}
          </tspan>
        ))}
      </text>
    </g>
  )
}

export function FlowGraph({ flow, vertical, still }: { flow: FlowCase; vertical: boolean; still: boolean }) {
  const g = vertical ? down(flow.side.into, flow.loop) : across(flow.side.into, flow.loop)
  const label = (step: FlowStep) => `${step.label} (${step.kind === 'llm' ? 'LLM' : step.kind})`
  return (
    <svg
      className={`fl ${still ? 'is-still' : ''}`}
      viewBox={`0 0 ${g.w} ${g.h}`}
      role="img"
      aria-label={`Workflow: ${flow.main.map(label).join(' → ')}; context from ${label(flow.side)}`}
      style={{ '--run': `${RUN}s`, '--start': `${START}s` } as CSSProperties}
    >
      <defs>
        <linearGradient id="flG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vertical ? 0 : g.w} y2={vertical ? g.h : 0}>
          <stop offset="0" stopColor="#a071ff" />
          <stop offset="1" stopColor="#ff8a33" />
        </linearGradient>
        <radialGradient id="flDot">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.4" stopColor="#e6b8ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff8a33" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* connections: drawn as the graph builds, then data streams along them */}
      <g fill="none" strokeLinecap="round">
        {flow.main.slice(0, -1).map((_, i) => (
          <g key={i} className="fl-e" style={{ '--i': i } as CSSProperties}>
            <path className="fl-e__base" d={g.edge(i)} pathLength={1} />
            <path className="fl-e__flow" d={g.edge(i)} />
          </g>
        ))}
        <g className="fl-e fl-e--side" style={{ '--i': flow.side.into } as CSSProperties}>
          <path className="fl-e__base" d={g.sideEdge} pathLength={1} />
          <path className="fl-e__flow" d={g.sideEdge} />
        </g>
        <g className="fl-e fl-e--loop" style={{ '--i': 5 } as CSSProperties}>
          <path className="fl-e__base" d={g.loopEdge} pathLength={1} />
          <path className="fl-e__flow" d={g.loopEdge} />
        </g>
      </g>

      {flow.main.map((step, i) => {
        const [x, y] = g.node(i)
        return <Node key={i} step={step} x={x} y={y} i={i} font={g.font} l={g.label(i)} vertical={vertical} />
      })}
      <Node step={flow.side} x={g.side[0]} y={g.side[1]} i={flow.side.into} font={g.font * 0.92} l={g.sideLabel} vertical={false} />

      {/* the data: one bright point, node after node */}
      {!still && (
        <circle r={vertical ? 13 : 11} fill="url(#flDot)" opacity={0}>
          <animateMotion
            dur={`${RUN}s`}
            begin={`${START}s`}
            repeatCount="indefinite"
            path={g.run}
            keyPoints="0;1;1"
            keyTimes={`0;${MOVE};1`}
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            dur={`${RUN}s`}
            begin={`${START}s`}
            repeatCount="indefinite"
            values="0;1;1;0;0"
            keyTimes={`0;0.04;${MOVE - 0.03};${MOVE};1`}
          />
        </circle>
      )}
    </svg>
  )
}

export const FLOW_TIMING = { RUN, MOVE, START }
