import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { FAMILY } from '../../components/Element/Element'
import { Panel, useParallax } from '../../components/Kit/Kit'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../../components/ui/icons'
import { DEPARTMENTS, departmentById, employeeByN, type DepartmentId } from '../../data/departments'
import { useInterval } from '../../hooks/useInterval'
import { onFocusEmployee } from '../../lib/events'
import { STAGES } from './panels'
import './Department.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const CYCLE_MS = 3400
const DEPTH = [5, 9, 13, 7]

/**
 * A department block: its ten AI employees as elements, and the pieces of interface
 * they work in. Selecting an AI employee (or letting it cycle) brings its panel into
 * focus and lights up the exact part of the interface it is responsible for.
 */
export function DepartmentSlide({ department, active, shown }: SlideProps & { department: DepartmentId }) {
  const { reducedMotion } = useDeck()
  const dept = departmentById(department)
  const row = DEPARTMENTS.indexOf(dept)
  const Icon = DEPARTMENT_ICON[department]
  const stage = STAGES[department]
  const first = dept.members[0].n
  const [sel, setSel] = useState(first)
  const [auto, setAuto] = useState(true)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const stageRef = useParallax<HTMLDivElement>(active && !reducedMotion)

  useEffect(() => {
    if (!shown) {
      setSel(first)
      setAuto(true)
    }
  }, [shown, first])

  useEffect(
    () =>
      onFocusEmployee((n) => {
        if (dept.members.some((m) => m.n === n)) {
          setSel(n)
          setAuto(false)
        }
      }),
    [dept],
  )

  useInterval(
    () => setSel((s) => (s - first + 1) % 10 + first),
    active && auto && !reducedMotion ? CYCLE_MS : null,
  )

  const pick = (n: number) => {
    setSel(n)
    setAuto(false)
  }

  const onStripKey = (e: KeyboardEvent) => {
    const i = sel - first
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (i + 1) % 10
    if (e.key === 'ArrowLeft') next = (i + 9) % 10
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = 9
    if (next === null) return
    e.preventDefault()
    pick(first + next)
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
          <span className="dept__count">10 AI employees</span>
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
          {dept.members.map((m, i) => (
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
          <p key={`n${sel}`} className="dept__cap-name">
            <span className="dept__cap-n">{current.n}</span>
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
        className={`dept__stage dept__stage--${stage.layout}`}
      >
        {stage.panels.map((p, i) => (
          <div
            key={p.title}
            className={`dept__slot ${i === focusIdx ? 'is-focus' : ''}`}
            style={{ gridArea: p.area, '--i': i, '--depth': DEPTH[i] } as CSSProperties}
          >
            <Panel
              title={p.title}
              icon={p.icon}
              meta={p.meta}
              focus={i === focusIdx}
              dim={i !== focusIdx}
              onClick={() => {
                if (!p.members.includes(sel)) pick(p.members[0])
              }}
            >
              {p.render({ sel, live: live && i === focusIdx })}
            </Panel>
          </div>
        ))}
        <p className="dept__note mono">Interface preview · sample data</p>
      </div>
    </div>
  )
}
