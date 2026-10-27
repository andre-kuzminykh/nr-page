import { CalendarDays, ChartGantt, Compass, ListChecks, SquareKanban, type LucideIcon } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { EMPLOYEE_ICON } from '../../components/ui/icons'
import { employeeById } from '../../data/employees'
import {
  DAYS,
  GOALS,
  INITIAL_TASKS,
  MEETINGS,
  PRODUCTS,
  PROJECTS,
  SCRIPT,
  STAGES,
  type DemoTask,
} from './demoData'
import './Management.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

type View = 'registry' | 'kanban' | 'gantt' | 'calendar'
type Filter = { kind: 'goal' | 'product' | 'project'; id: string } | null

const VIEWS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'kanban', label: 'Kanban', icon: SquareKanban },
  { id: 'gantt', label: 'Gantt', icon: ChartGantt },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'registry', label: 'Registry', icon: ListChecks },
]

const label = (list: readonly { id: string; label: string }[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id
const stageLabel = (id: string) => label(STAGES, id)
const dueLabel = (t: DemoTask) => `${DAYS[t.end]} · W${t.end < 5 ? 1 : 2}`

/** Smoothly moves cards to their new place when the shared task state changes (FLIP). */
function useFlip(ref: React.RefObject<HTMLElement | null>, key: unknown, enabled: boolean) {
  const rects = useRef(new Map<string, DOMRect>())
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('[data-flip]').forEach((node) => {
      const id = node.dataset.flip!
      const prev = rects.current.get(id)
      const next = node.getBoundingClientRect()
      if (enabled && prev && (Math.abs(prev.left - next.left) > 1 || Math.abs(prev.top - next.top) > 1)) {
        node.animate(
          [
            { transform: `translate(${prev.left - next.left}px, ${prev.top - next.top}px)`, zIndex: 3 },
            { transform: 'none', zIndex: 3 },
          ],
          { duration: 760, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        )
      }
      rects.current.set(id, next)
    })
  }, [key, ref, enabled])
}

function Employee({ task }: { task: DemoTask }) {
  const Icon = EMPLOYEE_ICON[task.employee]
  return (
    <span className="mg-emp">
      <Icon size={12} strokeWidth={1.7} aria-hidden="true" />
      {employeeById(task.employee).name}
    </span>
  )
}

/** Management Demo — an illustrative AI Manager workspace over one shared task registry. */
export function ManagementSlide({ shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS)
  const [view, setView] = useState<View>('kanban')
  const [filter, setFilter] = useState<Filter>(null)
  const [selectedId, setSelectedId] = useState('T-103')
  const [log, setLog] = useState('Registry synced · 9 tasks across 2 products')
  const boardRef = useRef<HTMLDivElement>(null)

  // Scripted hand-off from Analytics to Design, every time the slide opens.
  useEffect(() => {
    if (!shown) {
      setTasks(INITIAL_TASKS)
      setLog('Registry synced · 9 tasks across 2 products')
      return
    }
    const timers: number[] = []
    let at = 0
    for (const step of SCRIPT) {
      at += step.after
      timers.push(
        window.setTimeout(() => {
          setTasks((ts) => ts.map((t) => (t.id === step.id ? { ...t, stage: step.stage } : t)))
          setLog(step.log)
        }, at),
      )
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [shown])

  useFlip(boardRef, `${view}|${tasks.map((t) => t.stage).join()}`, !reducedMotion)

  const visible = useMemo(
    () =>
      tasks.filter((t) => {
        if (!filter) return true
        if (filter.kind === 'goal') return t.goal === filter.id
        if (filter.kind === 'product') return t.product === filter.id
        return t.project === filter.id
      }),
    [tasks, filter],
  )

  const selected = tasks.find((t) => t.id === selectedId) ?? tasks[0]
  const blocks = tasks.filter((t) => t.dependsOn.includes(selected.id))
  const related = new Set([selected.id, ...selected.dependsOn, ...blocks.map((b) => b.id)])

  const toggleFilter = (kind: NonNullable<Filter>['kind'], id: string) =>
    setFilter((f) => (f && f.kind === kind && f.id === id ? null : { kind, id }))

  const isOn = (kind: NonNullable<Filter>['kind'], id: string) =>
    !!filter && filter.kind === kind && filter.id === id

  const taskButton = (t: DemoTask, extra = '') => ({
    'data-flip': t.id,
    className: `${extra} ${t.id === selected.id ? 'is-selected' : ''} ${related.has(t.id) && t.id !== selected.id ? 'is-related' : ''}`,
    onClick: () => setSelectedId(t.id),
    'aria-pressed': t.id === selected.id,
  })

  const filterGroup = (title: string, kind: NonNullable<Filter>['kind'], items: readonly { id: string; label: string }[]) => (
    <div className="mg-side__group">
      <p className="mg-side__title mono">{title}</p>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" className="mg-filter" aria-pressed={isOn(kind, it.id)} onClick={() => toggleFilter(kind, it.id)}>
              <span className="mg-filter__dot" />
              {it.label}
              <span className="mg-filter__count mono">
                {tasks.filter((t) => (kind === 'goal' ? t.goal : kind === 'product' ? t.product : t.project) === it.id).length}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="slide__frame mg">
      <header className="mg__head">
        <div>
          <Eyebrow index={6}>Management · AI Manager</Eyebrow>
          <h2 className="h2 mg__title">
            <span className="mask" style={d(50)}>
              <span>All work. One manager.</span>
            </span>
          </h2>
        </div>
        <p className="body mg__desc rv" style={d(200)}>
          Goals, products, projects, processes and tasks — coordinated through one shared management
          system.
        </p>
      </header>

      <div className="mg-app rv" style={d(300)}>
        <div className="mg-app__bar">
          <div className="mg-app__title">
            <Compass size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>AI Manager</span>
            <span className="mg-app__sub mono">Task registry</span>
          </div>
          <div className="mg-views" role="tablist" aria-label="Views of the same tasks">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-label={v.label}
                aria-selected={view === v.id}
                className="mg-views__tab"
                onClick={() => setView(v.id)}
              >
                <v.icon size={13} strokeWidth={1.7} aria-hidden="true" />
                <span>{v.label}</span>
              </button>
            ))}
          </div>
          <span className="mg-app__tag mono">Illustrative</span>
        </div>

        <div className="mg-app__body">
          <aside className="mg-side" aria-label="Filters">
            {filterGroup('Goals', 'goal', GOALS)}
            {filterGroup('Products', 'product', PRODUCTS)}
            {filterGroup('Projects', 'project', PROJECTS)}
            <div className="mg-side__group mg-side__reports">
              <p className="mg-side__title mono">Reports</p>
              <p className="mg-side__chips">
                <span className="chip">Daily</span>
                <span className="chip">Weekly</span>
                <span className="chip">Monthly</span>
              </p>
            </div>
          </aside>

          <div className="mg-main">
            <div className="mg-chips" aria-label="Filters">
              {[...GOALS.map((g) => ['goal', g] as const), ...PRODUCTS.map((p) => ['product', p] as const)].map(([kind, it]) => (
                <button key={it.id} type="button" className="mg-filter mg-filter--chip" aria-pressed={isOn(kind, it.id)} onClick={() => toggleFilter(kind, it.id)}>
                  {it.label}
                </button>
              ))}
            </div>

            <div ref={boardRef} className={`mg-view mg-view--${view} scroll-y`} role="tabpanel" aria-label={`${view} view`}>
              {view === 'kanban' && (
                <div className="mg-kanban">
                  {STAGES.map((s) => {
                    const col = visible.filter((t) => t.stage === s.id)
                    return (
                      <section key={s.id} className="mg-col" aria-label={s.label}>
                        <h4 className="mg-col__head mono">
                          {s.label}
                          <span>{col.length}</span>
                        </h4>
                        <div className="mg-col__list">
                          {col.map((t) => (
                            <button key={t.id} type="button" {...taskButton(t, 'mg-card')}>
                              <span className="mg-card__top">
                                <span className="mono">{t.id}</span>
                                <span className={`mg-prio mg-prio--${t.priority}`}>{t.priority}</span>
                              </span>
                              <span className="mg-card__title">{t.title}</span>
                              <span className="mg-card__meta">
                                <Employee task={t} />
                                <span className="mono">{dueLabel(t)}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}

              {view === 'gantt' && (
                <div className="mg-gantt" style={{ '--days': DAYS.length } as CSSProperties}>
                  <div className="mg-gantt__row mg-gantt__row--head">
                    <span className="mg-gantt__label mono">Task</span>
                    <div className="mg-gantt__track">
                      {DAYS.map((day, i) => (
                        <span key={i} className={`mg-gantt__day mono ${i === 5 ? 'is-week' : ''}`}>
                          {day[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mg-gantt__body">
                    {visible.map((t, row) => (
                      <div key={t.id} className="mg-gantt__row">
                        <span className="mg-gantt__label">
                          <span className="mono">{t.id}</span> {t.title}
                        </span>
                        <div className="mg-gantt__track">
                          <button
                            type="button"
                            {...taskButton(t, `mg-bar mg-bar--${t.stage}`)}
                            style={{ '--s': t.start, '--e': t.end + 1, '--row': row } as CSSProperties}
                            aria-label={`${t.title}, ${DAYS[t.start]} to ${dueLabel(t)}, ${stageLabel(t.stage)}`}
                          />
                        </div>
                      </div>
                    ))}
                    <svg className="mg-gantt__links" viewBox={`0 0 ${DAYS.length * 10} ${visible.length * 10}`} preserveAspectRatio="none" aria-hidden="true">
                      {visible.flatMap((t, row) =>
                        t.dependsOn.map((dep) => {
                          const from = visible.findIndex((x) => x.id === dep)
                          if (from < 0) return null
                          const src = visible[from]
                          const x1 = (src.end + 1) * 10
                          const y1 = from * 10 + 5
                          const x2 = t.start * 10
                          const y2 = row * 10 + 5
                          const mid = Math.max(x1 + 2, x2 - 2)
                          return (
                            <path
                              key={`${dep}-${t.id}`}
                              className={related.has(t.id) && related.has(dep) ? 'is-related' : ''}
                              d={`M${x1} ${y1} H${mid} V${y2} H${x2}`}
                            />
                          )
                        }),
                      )}
                    </svg>
                  </div>
                </div>
              )}

              {view === 'calendar' && (
                <div className="mg-cal">
                  {[0, 1].map((w) => (
                    <div key={w} className="mg-cal__week">
                      <span className="mg-cal__wk mono">W{w + 1}</span>
                      {DAYS.slice(w * 5, w * 5 + 5).map((day, i) => {
                        const di = w * 5 + i
                        const due = visible.filter((t) => t.end === di)
                        const meets = MEETINGS.filter((m) => m.day === di)
                        return (
                          <div key={di} className="mg-cal__day">
                            <span className="mg-cal__date mono">{day}</span>
                            {meets.map((m) => (
                              <span key={m.title + m.time} className="mg-cal__meet">
                                <span className="mono">{m.time}</span> {m.title}
                              </span>
                            ))}
                            {due.map((t) => (
                              <button key={t.id} type="button" {...taskButton(t, `mg-cal__task mg-cal__task--${t.stage}`)}>
                                {t.title}
                              </button>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}

              {view === 'registry' && (
                <table className="mg-table">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Task</th>
                      <th scope="col">AI Employee</th>
                      <th scope="col" className="mg-hide-s">Owner</th>
                      <th scope="col">Priority</th>
                      <th scope="col" className="mg-hide-s">Due</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="mg-hide-s">Depends on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((t) => (
                      <tr
                        key={t.id}
                        className={`${t.id === selected.id ? 'is-selected' : ''} ${related.has(t.id) && t.id !== selected.id ? 'is-related' : ''}`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <td className="mono">{t.id}</td>
                        <td>
                          <button type="button" className="mg-table__btn" onClick={() => setSelectedId(t.id)} aria-pressed={t.id === selected.id}>
                            {t.title}
                          </button>
                        </td>
                        <td><Employee task={t} /></td>
                        <td className="mg-hide-s">{t.owner}</td>
                        <td><span className={`mg-prio mg-prio--${t.priority}`}>{t.priority}</span></td>
                        <td className="mono mg-hide-s">{dueLabel(t)}</td>
                        <td><span className={`mg-status mg-status--${t.stage}`}>{stageLabel(t.stage)}</span></td>
                        <td className="mono mg-hide-s">{t.dependsOn.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <dl className="mg-detail" aria-live="polite">
              <div className="mg-detail__main">
                <dt className="sr-only">Selected task</dt>
                <dd>
                  <span className="mono">{selected.id}</span> {selected.title}
                </dd>
              </div>
              <div><dt>Goal</dt><dd>{label(GOALS, selected.goal)}</dd></div>
              <div><dt>Product</dt><dd>{label(PRODUCTS, selected.product)}</dd></div>
              <div className="mg-hide-s"><dt>Project</dt><dd>{label(PROJECTS, selected.project)}</dd></div>
              <div><dt>Status</dt><dd>{stageLabel(selected.stage)}</dd></div>
              <div className="mg-hide-s"><dt>Owner</dt><dd>{selected.owner}</dd></div>
              <div className="mg-hide-s"><dt>Depends on</dt><dd>{selected.dependsOn.join(', ') || '—'}</dd></div>
              <div className="mg-hide-s"><dt>Blocks</dt><dd>{blocks.map((b) => b.id).join(', ') || '—'}</dd></div>
            </dl>
          </div>
        </div>

        <div className="mg-app__foot">
          <span className="mg-log" key={log}>
            <span className="mg-log__dot" aria-hidden="true" />
            {log}
          </span>
          <span className="mg-app__note mono">Sample data · not a live workspace</span>
        </div>
      </div>
    </div>
  )
}
