import { useEffect, useState, type CSSProperties } from 'react'

type Kind = 'goal' | 'task' | 'person' | 'process' | 'role' | 'booking' | 'money' | 'note'

interface Node {
  id: string
  type: string
  name: string
  kind: Kind
  /** wide layout and narrow layout positions (centre of the card) */
  at: [number, number]
  sm: [number, number]
}

interface Edge {
  from: string
  to: string
  label: string
  hypothesis?: boolean
}

/** A slice of a company's knowledge graph (the product's demo workspace). */
const NODES: Node[] = [
  { id: 'goal', type: 'Goal', name: 'Launch Neuronium 1.0', kind: 'goal', at: [450, 70], sm: [190, 60] },
  { id: 'draft', type: 'Task', name: 'Draft the article', kind: 'task', at: [230, 190], sm: [100, 170] },
  { id: 'demo', type: 'Task', name: 'Fund portfolio demo', kind: 'task', at: [670, 190], sm: [285, 170] },
  { id: 'note', type: 'Note', name: 'Weekly review', kind: 'note', at: [70, 300], sm: [72, 290] },
  { id: 'am', type: 'Person', name: 'Alex Mercer · AM', kind: 'person', at: [300, 330], sm: [238, 290] },
  { id: 'proc', type: 'Process', name: 'Sales funnel', kind: 'process', at: [820, 320], sm: [300, 410] },
  { id: 'ls', type: 'Executor', name: 'Lena Stone', kind: 'person', at: [520, 360], sm: [110, 410] },
  { id: 'role', type: 'Role', name: 'Designer', kind: 'role', at: [330, 470], sm: [80, 530] },
  { id: 'book', type: 'Booking', name: 'Booking · Lena Stone', kind: 'booking', at: [610, 470], sm: [250, 530] },
  { id: 'acc', type: 'Accrual', name: '300.00 EUR to pay', kind: 'money', at: [840, 440], sm: [190, 640] },
]

const EDGES: Edge[] = [
  { from: 'draft', to: 'goal', label: 'supports' },
  { from: 'demo', to: 'goal', label: 'supports' },
  { from: 'demo', to: 'proc', label: 'runs_in' },
  { from: 'am', to: 'draft', label: 'assigned' },
  { from: 'note', to: 'draft', label: 'mentions', hypothesis: true },
  { from: 'ls', to: 'role', label: 'holds_role' },
  { from: 'book', to: 'ls', label: 'books' },
  { from: 'acc', to: 'ls', label: 'payable_to' },
  { from: 'acc', to: 'book', label: 'based_on' },
]

/** The walk a question takes: “How much do we owe Lena Stone?” — from her to what is owed. */
const WALK = ['ls', 'book', 'acc']
const WALK2 = ['goal', 'draft', 'am']

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))
const w = (n: Node) => Math.max(n.name.length, n.type.length + 2) * 7.4 + 30

function Layout({ narrow, lit, on }: { narrow: boolean; lit: string[]; on: boolean }) {
  const pos = (n: Node) => (narrow ? n.sm : n.at)
  const litEdge = (e: Edge) => lit.includes(e.from) && lit.includes(e.to)
  return (
    <svg
      className={`kg ${narrow ? 'kg--sm' : 'kg--lg'} ${on ? 'is-on' : ''}`}
      viewBox={narrow ? '0 0 380 700' : '0 0 920 530'}
      role="img"
      aria-label="A slice of a company knowledge graph: goals, tasks, people, roles, bookings and money, joined by typed links"
    >
      <defs>
        <linearGradient id="kg-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a071ff" />
          <stop offset="0.55" stopColor="#e06ad8" />
          <stop offset="1" stopColor="#ff8a33" />
        </linearGradient>
      </defs>
      {EDGES.map((e, i) => {
        const [x1, y1] = pos(byId[e.from])
        const [x2, y2] = pos(byId[e.to])
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        return (
          <g key={i} className={`kg-e ${e.hypothesis ? 'is-hyp' : ''} ${litEdge(e) ? 'is-lit' : ''}`} style={{ '--i': i } as CSSProperties}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} />
            <text x={mx} y={my - 6} textAnchor="middle">
              {e.label}
            </text>
          </g>
        )
      })}
      {NODES.map((n, i) => {
        const [x, y] = pos(n)
        const width = w(n) * (narrow ? 0.92 : 1)
        return (
          <g key={n.id} className={`kg-n is-${n.kind} ${lit.includes(n.id) ? 'is-lit' : ''}`} style={{ '--i': i } as CSSProperties} transform={`translate(${x} ${y})`}>
            <rect x={-width / 2} y={-24} width={width} height={48} rx={14} />
            <text className="kg-n__t" y={-5} textAnchor="middle">
              {n.type}
            </text>
            <text className="kg-n__n" y={13} textAnchor="middle">
              {n.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** The graph draws itself when it is seen, then two questions walk it in turn. */
export function KnowledgeGraph({ on }: { on: boolean }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!on) return
    const t = window.setInterval(() => setStep((s) => (s + 1) % 8), 900)
    return () => window.clearInterval(t)
  }, [on])
  // 0–2: the first walk grows, 3: holds; 4–6: the second, 7: holds
  const walk = step < 4 ? WALK2 : WALK
  const lit = on ? walk.slice(0, (step % 4) + 1) : []
  return (
    <div className="kg-wrap">
      <Layout narrow={false} lit={lit} on={on} />
      <Layout narrow lit={lit} on={on} />
    </div>
  )
}
