import type { CSSProperties } from 'react'

export type Kind = 'goal' | 'task' | 'person' | 'process' | 'role' | 'booking' | 'money' | 'note'

interface Node {
  id: string
  name: string
  kind: Kind
  /** wide layout and narrow layout positions (centre of the card) */
  at: [number, number]
  sm: [number, number]
}

/** A slice of a company's knowledge graph (the product's demo workspace): records, joined by typed links. */
const NODES: Node[] = [
  { id: 'goal', name: 'Launch Neuronium 1.0', kind: 'goal', at: [450, 60], sm: [190, 50] },
  { id: 'draft', name: 'Draft the article', kind: 'task', at: [230, 170], sm: [105, 150] },
  { id: 'demo', name: 'Fund portfolio demo', kind: 'task', at: [680, 170], sm: [285, 150] },
  { id: 'note', name: 'Weekly review', kind: 'note', at: [80, 280], sm: [80, 250] },
  { id: 'am', name: 'Alex Mercer', kind: 'person', at: [300, 300], sm: [270, 250] },
  { id: 'proc', name: 'Sales funnel', kind: 'process', at: [820, 290], sm: [300, 350] },
  { id: 'ls', name: 'Lena Stone', kind: 'person', at: [540, 330], sm: [110, 350] },
  { id: 'role', name: 'Designer', kind: 'role', at: [360, 440], sm: [80, 450] },
  { id: 'book', name: 'Booking', kind: 'booking', at: [620, 440], sm: [230, 450] },
  { id: 'acc', name: '300.00 EUR', kind: 'money', at: [830, 420], sm: [190, 540] },
]

const EDGES: [string, string][] = [
  ['draft', 'goal'],
  ['demo', 'goal'],
  ['demo', 'proc'],
  ['am', 'draft'],
  ['note', 'draft'],
  ['ls', 'role'],
  ['book', 'ls'],
  ['acc', 'ls'],
  ['acc', 'book'],
]

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))
const w = (n: Node) => n.name.length * 7.6 + 46

function Layout({ narrow, lit, on }: { narrow: boolean; lit: string[]; on: boolean }) {
  const pos = (n: Node) => (narrow ? n.sm : n.at)
  const litEdge = ([a, b]: [string, string]) => lit.includes(a) && lit.includes(b)
  return (
    <svg className={`kg ${narrow ? 'kg--sm' : 'kg--lg'} ${on ? 'is-on' : ''} ${lit.length ? 'is-walking' : ''}`} viewBox={narrow ? '0 0 380 590' : '0 0 920 500'} aria-hidden="true">
      {EDGES.map((e, i) => {
        const [x1, y1] = pos(byId[e[0]])
        const [x2, y2] = pos(byId[e[1]])
        return <line key={i} className={`kg-e ${litEdge(e) ? 'is-lit' : ''}`} style={{ '--i': i } as CSSProperties} x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
      })}
      {NODES.map((n, i) => {
        const [x, y] = pos(n)
        const width = w(n) * (narrow ? 0.94 : 1)
        return (
          <g key={n.id} className={`kg-n is-${n.kind} ${lit.includes(n.id) ? 'is-lit' : ''}`} style={{ '--i': i } as CSSProperties} transform={`translate(${x} ${y})`}>
            <rect x={-width / 2} y={-19} width={width} height={38} rx={19} />
            <circle cx={-width / 2 + 18} cy={0} r={4.5} />
            <text x={8} y={5} textAnchor="middle">
              {n.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** The graph: it draws itself when `on`, and the records in `lit` light up with the links between them. */
export function KnowledgeGraph({ on, lit }: { on: boolean; lit: string[] }) {
  return (
    <div className="kg-wrap">
      <Layout narrow={false} lit={lit} on={on} />
      <Layout narrow lit={lit} on={on} />
    </div>
  )
}
