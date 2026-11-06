import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { FAMILY } from '../../components/Element/Element'
import { Panel, useParallax } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../../components/ui/icons'
import { DEPARTMENTS, departmentById, employeeByN, type DepartmentId } from '../../data/departments'
import { isEmployeeOpen } from '../../data/release.ts'
import { useInterval } from '../../hooks/useInterval'
import { onFocusEmployee } from '../../lib/events'
import { STAGES } from './panels'
import './Department.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
/** Each AI employee's piece of interface plays for five seconds, then the next one comes. */
const CYCLE_MS = 5000

/**
 * A department block: its ten AI employees as elements and one interface at a time.
 * Every five seconds the next AI employee takes over: its interface comes forward and the
 * exact part it is responsible for lights up. Picking an element stops the autoplay.
 */
export function DepartmentSlide({ department, active, shown }: SlideProps & { department: DepartmentId }) {
  const { reducedMotion } = useDeck()
  const dept = departmentById(department)
  const row = DEPARTMENTS.indexOf(dept)
  const Icon = DEPARTMENT_ICON[department]
  const stage = STAGES[department]
  // only the AI employees that are open on the site
  const members = useMemo(() => dept.members.filter((m) => isEmployeeOpen(m.n)), [dept])
  const order = useMemo(() => (stage.order ?? dept.members.map((m) => m.n)).filter(isEmployeeOpen), [stage, dept])
  const [sel, setSel] = useState(order[0])
  const [auto, setAuto] = useState(true)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const stageRef = useParallax<HTMLDivElement>(active && !reducedMotion)

  useEffect(() => {
    if (!shown) {
      setSel(order[0])
      setAuto(true)
    }
  }, [shown, order])

  useEffect(
    () =>
      onFocusEmployee((n) => {
        if (members.some((m) => m.n === n)) {
          setSel(n)
          setAuto(false)
        }
      }),
    [members],
  )

  useInterval(
    () => setSel((s) => order[(order.indexOf(s) + 1) % order.length]),
    active && auto && !reducedMotion ? CYCLE_MS : null,
  )

  const pick = (n: number) => {
    setSel(n)
    setAuto(false)
  }

  const onStripKey = (e: KeyboardEvent) => {
    const i = members.findIndex((m) => m.n === sel)
    const n = members.length
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (i + 1) % n
    if (e.key === 'ArrowLeft') next = (i + n - 1) % n
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = n - 1
    if (next === null) return
    e.preventDefault()
    pick(members[next].n)
    tabs.current[next]?.focus()
  }

  const focusIdx = Math.max(0, stage.panels.findIndex((p) => p.members.includes(sel)))
  const current = employeeByN(sel)
  const live = active && !reducedMotion

  return (
    <div className={`slide__frame dept dept--${department}`} style={{ '--fam': FAMILY[row] } as CSSProperties}>
      <div className="dept__text">
        <p className="dept__label rv" style={d(0)}>
          <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
          <span>{dept.name}</span>
          <span className="dept__count">{members.length === 1 ? '1 AI employee' : `${members.length} AI employees`}</span>
        </p>
        <h2 className="h2 dept__title">
          <span className="mask" style={d(60)}>
            <span>{dept.headline[0]}</span>
          </span>
          <span className="mask" style={d(140)}>
            <span>{dept.headline[1]}</span>
          </span>
        </h2>
        <p className="dept__desc rv" style={d(260)}>
          {dept.description}
        </p>

        <div
          className={`dept__strip ${auto && live ? 'is-auto' : ''}`}
          role="tablist"
          aria-label={`${dept.name} AI employees`}
          onKeyDown={onStripKey}
        >
          {members.map((m, i) => (
            <button
              key={m.n}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`tab-${m.n}`}
              aria-selected={m.n === sel}
              aria-controls={`stage-${department}`}
              tabIndex={m.n === sel ? 0 : -1}
              className="dept__el rv rv--scale"
              style={{ '--d': 320 + i * 45 } as CSSProperties}
              data-name={m.name}
              onClick={() => pick(m.n)}
            >
              <span className="dept__el-n">{m.n}</span>
              <span className="dept__el-sym">{m.symbol}</span>
              <span className="sr-only">{m.name}</span>
            </button>
          ))}
        </div>

        <div className="dept__caption rv" style={d(520)} aria-live="polite">
          <p key={`s${sel}`} className="dept__cap-n mono">
            {current.n} · {current.symbol}
          </p>
          <p key={`n${sel}`} className="dept__cap-name">
            {current.name}
          </p>
          <p key={`d${sel}`} className="dept__cap-desc">
            {current.description}
          </p>
        </div>
      </div>

      <div
        ref={stageRef}
        id={`stage-${department}`}
        role="tabpanel"
        aria-labelledby={`tab-${sel}`}
        className="dept__stage"
      >
        {stage.scene ? (
          <div className="dept__slot is-focus">
            <div className="dept__scale">{stage.scene({ sel, live })}</div>
          </div>
        ) : (
          stage.panels.map((p, i) => (
            <div
              key={p.title}
              className={`dept__slot ${i === focusIdx ? 'is-focus' : ''}`}
              aria-hidden={i !== focusIdx}
              inert={i !== focusIdx}
            >
              <div className="dept__scale">
                <Panel title={p.title} icon={p.icon} meta={p.meta} focus={i === focusIdx}>
                  {p.render({ sel, live: live && i === focusIdx })}
                </Panel>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
