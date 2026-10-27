import { ShieldCheck } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { ExecutionLine } from '../../components/ui/ExecutionLine'
import { EMPLOYEE_ICON, TYPE_ICON } from '../../components/ui/icons'
import { BUSINESS_COMPONENTS, OS } from '../../data/architecture'
import { EMPLOYEE_ROWS } from '../../data/employees'
import './Architecture.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

const NativeIcon = TYPE_ICON.robot
const FirstIcon = TYPE_ICON.person

/**
 * Architecture Infographic — the approved structure, on one screen:
 * Neuronium (AI Governance inside) → AI Business (Identity | Knowledge Graph | Superagent)
 * → AI-Native (above) and AI-First (2×5 AI Employees, then Agents · Workflows · Skills).
 */
export function ArchitectureSlide(_: SlideProps) {
  return (
    <div className="slide__frame arch-slide">
      <header className="arch-slide__head">
        <Eyebrow index={3}>Complete architecture</Eyebrow>
        <h2 className="h2 arch-slide__title">
          <span className="mask" style={d(40)}>
            <span>One system.</span>
          </span>
          <span className="mask" style={d(110)}>
            <span>Two ways to build.</span>
          </span>
        </h2>
        <p className="body arch-slide__copy rv" style={d(220)}>
          Neuronium is the AI Operating System, with AI Governance built in. Every AI Business has its
          own identity, knowledge graph and superagent — and is built AI-Native or AI-First.
        </p>
      </header>

      <figure className="arch" aria-label="Neuronium architecture">
        {/* Level 1 — the operating system, governance inside */}
        <section className="arch__os arch__block rv rv--scale" style={d(160)} aria-label="Level 1: Neuronium">
          <div className="arch__os-head">
            <span className="arch__level mono">L1</span>
            <h3 className="arch__os-name">{OS.name}</h3>
            <span className="arch__os-meta">
              {OS.category} <span className="arch__dot" aria-hidden="true">·</span>{' '}
              <span className="fg">{OS.tagline}</span>
            </span>
          </div>
          <div className="arch__gov">
            <span className="arch__gov-name rv rv--fade" style={d(260)}>
              <ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" />
              {OS.governance.name}
            </span>
            <ul className="arch__gov-list" aria-label="AI Governance functions">
              {OS.governance.functions.map((f, i) => (
                <li key={f} className="rv rv--fade" style={d(300 + i * 50)}>
                  {f}
                </li>
              ))}
            </ul>
            <span className="arch__gov-sweep" aria-hidden="true" />
          </div>
        </section>

        <span className="arch__link rv rv--line-y" style={d(420)} aria-hidden="true" />

        {/* Level 2 — AI Business and its three shared components */}
        <section className="arch__biz arch__block rv rv--scale" style={d(470)} aria-label="Level 2: AI Business">
          <div className="arch__biz-head">
            <span className="arch__level mono">L2</span>
            <h3 className="arch__biz-name">AI Business</h3>
          </div>
          <ul className="arch__comps">
            {BUSINESS_COMPONENTS.map((c, i) => (
              <li key={c.id} className="arch__comp rv" style={d(520 + i * 60)}>
                <span className="arch__comp-name">{c.name}</span>
                <span className="arch__comp-short mono">{c.short}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Types — AI-Native always above AI-First */}
        <div className="arch__types">
          <section className="arch__type arch__type--native rv rv--x" style={d(680)} aria-label="AI-Native">
            <span className="arch__stub" aria-hidden="true" />
            <span className="arch__type-icon">
              <NativeIcon size={17} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <div className="arch__type-text">
              <h4 className="arch__type-name">AI-Native</h4>
              <p className="arch__type-desc">
                Autonomous AI product. The standard process runs on its own; people oversee exceptions
                and key decisions.
              </p>
            </div>
          </section>

          <section className="arch__type arch__type--first" aria-label="AI-First">
            <div className="arch__type-row rv rv--x" style={d(740)}>
              <span className="arch__stub" aria-hidden="true" />
              <span className="arch__type-icon">
                <FirstIcon size={17} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div className="arch__type-text">
                <h4 className="arch__type-name">AI-First</h4>
                <p className="arch__type-desc">
                  People in control. 10 AI Employees do the core operational work.
                </p>
              </div>
            </div>

            <div className="arch__grid" role="list" aria-label="AI-First: 10 AI Employees">
              {EMPLOYEE_ROWS.flat().map((e, i) => {
                const Icon = EMPLOYEE_ICON[e.id]
                return (
                  <div key={e.id} role="listitem" className="arch__tile rv" style={d(780 + i * 28)}>
                    <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                    <span>{e.name}</span>
                  </div>
                )
              })}
            </div>

            <ExecutionLine className="arch__exec" delay={1020} lead="Each uses" />
          </section>
        </div>
      </figure>
    </div>
  )
}
