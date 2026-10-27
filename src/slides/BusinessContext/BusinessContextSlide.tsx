import { ArrowRight, BrainCircuit, Fingerprint, Network } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { BUSINESS_COMPONENTS } from '../../data/architecture'
import { useInterval } from '../../hooks/useInterval'
import { K_EDGES, K_NODES, SOURCES, TRAILS } from './contextData'
import './BusinessContext.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const node = (id: string) => K_NODES.find((n) => n.id === id)!
const [IDENTITY, KNOWLEDGE, SUPERAGENT] = BUSINESS_COMPONENTS

/** Business Knowledge Visualization — context in, work out. */
export function BusinessContextSlide({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [trail, setTrail] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!shown) {
      setTrail(0)
      setAuto(true)
    }
  }, [shown])

  useInterval(() => setTrail((t) => (t + 1) % TRAILS.length), active && auto && !reducedMotion ? 4200 : null)

  const current = TRAILS[trail]
  const onTrail = new Set(current.nodes)
  const edgeOn = (from: string, to: string) => {
    const i = current.nodes.indexOf(from)
    const j = current.nodes.indexOf(to)
    return i >= 0 && j >= 0 && Math.abs(i - j) === 1
  }

  return (
    <div className="slide__frame ctx">
      <header className="ctx__head">
        <div>
          <Eyebrow index={9}>Business context</Eyebrow>
          <h2 className="h2">
            <span className="mask" style={d(50)}>
              <span>Context in. Work out.</span>
            </span>
          </h2>
        </div>
        <p className="body ctx__intro rv" style={d(200)}>
          Knowledge from files, calendars, conversations and tools becomes connected business
          context — and drives real work.
        </p>
      </header>

      <div className="ctx__map">
        {/* Sources → MCP */}
        <section className="ctx__sources rv" style={d(260)} aria-label="Sources">
          <p className="label ctx__col-label">Sources</p>
          <ul>
            {SOURCES.map((s, i) => (
              <li key={s.group} style={{ '--i': i } as CSSProperties}>
                <span className="ctx__src-group">{s.group}</span>
                <span className="ctx__src-items">{s.items}</span>
              </li>
            ))}
          </ul>
          <p className="ctx__fine">Examples of integration surfaces. Availability varies by release.</p>
        </section>

        <div className="ctx__bus rv rv--line-y" style={d(380)} aria-hidden="true">
          <span className="ctx__bus-label mono">MCP · Integrations</span>
          <span className="ctx__bus-pulse" />
        </div>

        {/* Identity + Knowledge Graph */}
        <section className="ctx__core rv" style={d(320)} aria-label="AI Identity and AI Knowledge Graph">
          <div className="ctx__identity">
            <span className="ctx__comp-name">
              <Fingerprint size={15} strokeWidth={1.6} aria-hidden="true" />
              {IDENTITY.name}
            </span>
            <span className="ctx__comp-def">{IDENTITY.description}</span>
          </div>

          <div className="ctx__kg">
            <div className="ctx__kg-head">
              <span className="ctx__comp-name">
                <Network size={15} strokeWidth={1.6} aria-hidden="true" />
                {KNOWLEDGE.name}
              </span>
              <span className="ctx__comp-def">{KNOWLEDGE.description}</span>
            </div>

            <svg className="kg" viewBox="0 0 520 390" role="img" aria-label={`Knowledge graph. ${current.question} ${current.answer}`}>
              {K_EDGES.map((e) => {
                const a = node(e.from)
                const b = node(e.to)
                const on = edgeOn(e.from, e.to)
                return (
                  <g key={`${e.from}-${e.to}`} className={`kg-edge ${on ? 'is-on' : ''}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle">
                      {e.label}
                    </text>
                  </g>
                )
              })}
              {K_NODES.map((n) => {
                const on = onTrail.has(n.id)
                const first = current.nodes[0] === n.id
                return (
                  <g key={n.id} className={`kg-node ${on ? 'is-on' : ''} ${first ? 'is-first' : ''}`} transform={`translate(${n.x} ${n.y})`}>
                    <circle r={on ? 6 : 4.5} />
                    <text className="kg-node__type" y="-13" textAnchor="middle">{n.type}</text>
                    <text className="kg-node__label" y="21" textAnchor="middle">{n.label}</text>
                  </g>
                )
              })}
            </svg>

            <div className="ctx__query" aria-live="polite">
              <div className="ctx__q" key={`q${trail}`}>
                <span className="mono">Query</span>
                {current.question}
              </div>
              <div className="ctx__a" key={`a${trail}`}>{current.answer}</div>
              <div className="ctx__dots" role="group" aria-label="Example queries">
                {TRAILS.map((t, i) => (
                  <button
                    key={t.question}
                    type="button"
                    aria-label={t.question}
                    aria-pressed={i === trail}
                    onClick={() => {
                      setTrail(i)
                      setAuto(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="ctx__arrow rv rv--fade" style={d(520)} aria-hidden="true">
          <ArrowRight size={16} strokeWidth={1.5} />
        </div>

        {/* Superagent → work */}
        <section className="ctx__agent rv" style={d(460)} aria-label="AI Superagent">
          <span className="ctx__comp-name">
            <BrainCircuit size={15} strokeWidth={1.6} aria-hidden="true" />
            {SUPERAGENT.name}
          </span>
          <span className="ctx__comp-def">{SUPERAGENT.description}</span>
          <p className="label ctx__col-label ctx__orch-label">Orchestrates</p>
          <ul className="ctx__orch">
            <li>AI Employees</li>
            <li>AI Agents</li>
            <li>AI Workflows</li>
            <li>AI Skills</li>
            <li>Tools</li>
          </ul>
          <p className="label ctx__col-label ctx__orch-label">Work out</p>
          <ul className="ctx__out">
            <li>Executed work — documents, reports, messages, code</li>
            <li>New tasks → AI Manager registry</li>
          </ul>
        </section>
      </div>

      <p className="ctx__split rv" style={d(620)}>
        <span><strong>AI Superagent</strong> orchestrates how complex work is executed.</span>
        <span><strong>AI Manager</strong> keeps the single registry of business tasks.</span>
      </p>
    </div>
  )
}
