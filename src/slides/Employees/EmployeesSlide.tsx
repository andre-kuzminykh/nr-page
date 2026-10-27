import { ArrowRight } from 'lucide-react'
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Element } from '../../components/Element/Element'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { ExecutionLine } from '../../components/ui/ExecutionLine'
import { EMPLOYEE_ICON } from '../../components/ui/icons'
import { EMPLOYEES, type EmployeeId } from '../../data/employees'
import { openCatalogAt } from '../../lib/events'
import './Employees.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** AI Employees Grid — 2×5, Management selected by default. */
export function EmployeesSlide(_: SlideProps) {
  const { goTo } = useDeck()
  const [selected, setSelected] = useState<EmployeeId>('management')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const index = EMPLOYEES.findIndex((e) => e.id === selected)
  const employee = EMPLOYEES[index]

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    let next: number | null = null
    if (e.key in keys) next = (index + keys[e.key] + EMPLOYEES.length) % EMPLOYEES.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = EMPLOYEES.length - 1
    if (next === null) return
    e.preventDefault()
    setSelected(EMPLOYEES[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <div className="slide__frame emp">
      <header className="emp__head">
        <div>
          <Eyebrow index={5}>AI Employees · AI-First</Eyebrow>
          <h2 className="h2 emp__title">
            <span className="mask" style={d(50)}>
              <span>10 AI Employees.</span>
            </span>
            <span className="mask" style={d(130)}>
              <span>One connected business.</span>
            </span>
          </h2>
        </div>
        <p className="body emp__intro rv" style={d(260)}>
          Ten functional workplaces share one business context and one task registry. Select a role
          to see what it is responsible for.
        </p>
      </header>

      <div className="emp__grid" role="tablist" aria-label="AI Employees" onKeyDown={onKey}>
        {EMPLOYEES.map((e, i) => {
          const Icon = EMPLOYEE_ICON[e.id]
          const isSel = e.id === selected
          return (
            <button
              key={e.id}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`emp-tab-${e.id}`}
              aria-selected={isSel}
              aria-controls="emp-panel"
              tabIndex={isSel ? 0 : -1}
              className="emp__tile rv"
              style={d(220 + i * 45)}
              onClick={() => setSelected(e.id)}
            >
              <span className="emp__num mono">
                {e.capabilities[0].n}–{e.capabilities[9].n}
              </span>
              <Icon className="emp__icon" size={20} strokeWidth={1.4} aria-hidden="true" />
              <span className="emp__name">{e.name}</span>
            </button>
          )
        })}
      </div>

      <ExecutionLine className="emp__exec" delay={700} lead="Every AI Employee uses" />

      <div
        className="emp__panel rv"
        style={d(760)}
        role="tabpanel"
        id="emp-panel"
        aria-labelledby={`emp-tab-${employee.id}`}
      >
        <div key={employee.id} className="emp__detail">
          <div className="emp__summary">
            <p className="emp__role">
              <span>{employee.name}</span>
              {employee.agent && <span className="emp__agent mono">{employee.agent}</span>}
            </p>
            <p className="emp__text">{employee.summary}</p>
            <button
              type="button"
              className="text-link emp__more"
              onClick={() => {
                openCatalogAt(employee.id)
                goTo('capabilities')
              }}
            >
              All 10 capabilities
              <ArrowRight size={13} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
          <ol className="emp__caps" aria-label={`${employee.name} capabilities`}>
            {employee.capabilities.map((c, i) => (
              <li key={c.n} style={{ '--i': i } as CSSProperties}>
                <Element n={c.n} symbol={c.symbol} family={index} size="xs" />
                <span className="emp__cap-name">{c.name}</span>
                <span className="mono">{c.n}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
