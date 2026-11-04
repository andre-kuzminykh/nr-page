import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { FAMILY } from '../../components/Element/Element'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../../components/ui/icons'
import { AI_EMPLOYEES, DEPARTMENTS, departmentById, employeeByN, rowOf, type DepartmentId } from '../../data/departments'
import { useInterval } from '../../hooks/useInterval'
import { focusEmployee } from '../../lib/events'
import './Employees.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const normalize = (s: string) => s.toLowerCase().normalize('NFKD')
/** Until someone interacts, the table walks through its departments one by one. */
const TOUR: DepartmentId[] = DEPARTMENTS.map((dp) => dp.id)
/** Wide screens show the card beside the table; narrower ones open it over the table, on tap only. */
const WIDE = '(min-width: 1101px)'
const PHONE = '(max-width: 700px)'
const isWide = () => window.matchMedia?.(WIDE).matches ?? true

function useMedia(query: string) {
  const [on, setOn] = useState(() => window.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.(query)
    if (!mq) return
    const set = () => setOn(mq.matches)
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [query])
  return on
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const i = normalize(text).indexOf(normalize(query))
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  )
}

/** 100 AI employees as one periodic table. Neuronium is element 0. */
export function EmployeesSlide({ active, shown }: SlideProps) {
  const { goTo, reducedMotion } = useDeck()
  const wide = useMedia(WIDE)
  // On phones the card takes the place of the copy and the search, so the table stays in full view.
  const phone = useMedia(PHONE)
  const inText = wide || phone
  const [sel, setSel] = useState<number | null>(null)
  const [tour, setTour] = useState(isWide)
  const [query, setQuery] = useState('')
  const [dsel, setDsel] = useState<DepartmentId | null>(() => (isWide() ? TOUR[0] : null))
  const [hover, setHover] = useState<{ n?: number; d?: DepartmentId } | null>(null)
  const hoverOff = useRef(0)
  const hoverOn = (h: { n?: number; d?: DepartmentId }) => (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return
    window.clearTimeout(hoverOff.current)
    setHover(h)
  }
  const hoverOut = () => {
    window.clearTimeout(hoverOff.current)
    hoverOff.current = window.setTimeout(() => setHover(null), 140)
  }
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number; side: 'r' | 'l' } | null>(null)

  useEffect(() => {
    if (!shown) {
      setSel(null)
      setTour(isWide())
      setQuery('')
      setDsel(isWide() ? TOUR[0] : null)
    }
  }, [shown])

  useInterval(
    () => setDsel((cur) => TOUR[(TOUR.indexOf(cur ?? TOUR[0]) + 1) % TOUR.length]),
    active && tour && !hover && !reducedMotion && !query ? 3600 : null,
  )

  const q = query.trim()
  const matches = useMemo(() => {
    if (!q) return null
    const nq = normalize(q)
    return new Set(
      AI_EMPLOYEES.filter(
        (e) =>
          normalize(e.name).includes(nq) ||
          normalize(e.description).includes(nq) ||
          normalize(e.symbol) === nq ||
          normalize(departmentById(e.department).name).includes(nq) ||
          String(e.n) === nq,
      ).map((e) => e.n),
    )
  }, [q])

  useEffect(() => {
    if (matches) setDsel(null)
    if (matches && matches.size && (sel === null || !matches.has(sel))) setSel(Math.min(...matches))
    if (matches && !matches.size) setSel(null)
  }, [q])

  // Place the card next to the selected element, inside the table.
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const cell = sel !== null ? cells.current[sel] : null
    if (inText || !wrap || !cell) {
      setPos(null)
      return
    }
    const place = () => {
      const w = wrap.getBoundingClientRect()
      const c = cell.getBoundingClientRect()
      const side = c.right - w.left + 300 < w.width ? 'r' : 'l'
      const y = Math.max(0, Math.min(c.top - w.top - 8, w.height - 236))
      setPos({ x: side === 'r' ? c.right - w.left + 12 : c.left - w.left - 12, y, side })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [sel, inText])

  const stopTour = () => setTour(false)

  const select = (n: number) => {
    stopTour()
    setDsel(null)
    setSel(n)
  }

  /** Picking a department lights its row and opens its card; picking it again closes it. */
  const pickDept = (id: DepartmentId) => {
    const touring = tour
    stopTour()
    setSel(null)
    setDsel((cur) => (cur === id && !touring ? null : id))
  }

  const focusCell = (n: number) => {
    select(n)
    cells.current[n]?.focus()
  }

  const onGridKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (!t.dataset.n) return
    setHover(null)
    const n = Number(t.dataset.n)
    const col = (n - 1) % 10
    let next: number | null = null
    if (e.key === 'ArrowRight') next = Math.min(100, n + 1)
    if (e.key === 'ArrowLeft') next = Math.max(1, n - 1)
    if (e.key === 'ArrowDown') next = n + 10 <= 100 ? n + 10 : n
    if (e.key === 'ArrowUp') next = n - 10 >= 1 ? n - 10 : n
    if (e.key === 'Home') next = n - col
    if (e.key === 'End') next = n - col + 9
    if (e.key === 'Escape') {
      stopTour()
      setSel(null)
      setDsel(null)
      return
    }
    if (next === null) return
    e.preventDefault()
    focusCell(next)
  }

  // the card follows the pointer first, then the selection
  const showN = hover ? (hover.n ?? null) : sel
  const showD = hover ? (hover.d ?? null) : dsel
  const current = showN !== null ? employeeByN(showN) : null
  const dept = current ? departmentById(current.department) : null
  const DeptIcon = dept ? DEPARTMENT_ICON[dept.id] : null

  const selDept = !current && showD ? departmentById(showD) : null
  const SelDeptIcon = selDept ? DEPARTMENT_ICON[selDept.id] : null
  const close = () => {
    stopTour()
    setSel(null)
    setDsel(null)
  }

  const card =
    current && dept && DeptIcon ? (
      <article
        key={current.n}
        className={`emp__card ${inText ? 'emp__card--side' : `emp__card--${pos?.side ?? 'r'}`}`}
        style={{ '--x': `${pos?.x ?? 0}px`, '--y': `${pos?.y ?? 0}px`, '--fam': FAMILY[rowOf(current.n)] } as CSSProperties}
        aria-live="polite"
      >
        <div className="emp__card-top">
          <div className="emp__card-head">
            <button type="button" className="emp__card-dept" onClick={() => pickDept(dept.id)}>
              <DeptIcon size={12} strokeWidth={1.7} aria-hidden="true" />
              {dept.name}
            </button>
            <p className="emp__card-no mono">
              {current.n} · {current.symbol}
            </p>
            <h3 className="emp__card-name">{highlight(current.name, q)}</h3>
          </div>
          <button type="button" className="emp__card-x" onClick={close} aria-label="Close">
            <X size={13} strokeWidth={1.8} />
          </button>
        </div>
        <p className="emp__card-desc">{highlight(current.description, q)}</p>
        <div className="emp__card-foot">
          <button
            type="button"
            className="text-link"
            onClick={() => {
              focusEmployee(current.n)
              goTo(dept.id)
            }}
          >
            Open {dept.name}
            <ArrowRight size={12} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </article>
    ) : selDept && SelDeptIcon ? (
      <article
        key={selDept.id}
        className={`emp__card emp__card--dept ${inText ? 'emp__card--side' : `emp__card--dock ${DEPARTMENTS.indexOf(selDept) >= 5 ? 'is-top' : ''}`}`}
        style={{ '--fam': FAMILY[DEPARTMENTS.indexOf(selDept)] } as CSSProperties}
        aria-live="polite"
      >
        <p className="emp__card-dept">
          <SelDeptIcon size={12} strokeWidth={1.7} aria-hidden="true" />
          Department · 10 AI employees
        </p>
        <h3 className="emp__dept-name">{selDept.name}</h3>
        <p className="emp__dept-line">{selDept.headline.join(' ')}</p>
        <p className="emp__card-desc">{selDept.description}</p>
        <div className="emp__card-foot">
          <button type="button" className="text-link" onClick={() => goTo(selDept.id)}>
            Open {selDept.name}
            <ArrowRight size={12} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </article>
    ) : null

  return (
    <div className={`slide__frame emp ${phone && card ? 'has-card' : ''}`}>
      <div className="emp__text">
        <h2 className="h2 emp__title">
          <span className="mask" style={d(40)}>
            <span>100 AI employees.</span>
          </span>
          <span className="mask" style={d(120)}>
            <span>Ready to work.</span>
          </span>
        </h2>
        <p className="emp__copy rv" style={d(260)}>
          Ten departments, ten AI employees in each — every one of them an element. Neuronium is element
          zero: the system they all run on.
        </p>
        <div className="emp__search rv" style={d(360)}>
          <Search size={15} strokeWidth={1.7} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              stopTour()
              setQuery(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('')
            }}
            placeholder="Search 100 AI employees"
            aria-label="Search AI employees"
            aria-describedby="emp-status"
          />
          {matches && (
            <span className={`emp__count mono ${matches.size ? '' : 'is-none'}`} aria-hidden="true">
              {matches.size}
            </span>
          )}
          {query && (
            <button type="button" className="emp__clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} strokeWidth={1.8} />
            </button>
          )}
        </div>
        <p id="emp-status" className="sr-only" aria-live="polite">
          {matches ? (matches.size ? `${matches.size} match “${q}”` : `Nothing matches “${q}”`) : ''}
        </p>
        {(wide || (phone && card)) && (
          <div className="emp__side rv" style={d(460)}>
            {card}
          </div>
        )}
      </div>

      <div className="emp__table-wrap" ref={wrapRef}>
        <div className={`pt ${dsel ? 'has-dept' : ''} ${tour ? 'is-tour' : ''}`} role="group" aria-label="Periodic table of 100 AI employees" onKeyDown={onGridKey} data-own-keys>
          <div className="pt__line pt__line--head rv" style={d(200)}>
            <span className="pt__zero" aria-label="Element 0: Nr, Neuronium">
              <span className="pt__n">0</span>
              <span className="pt__sym">Nr</span>
            </span>
          </div>

          {DEPARTMENTS.map((dp, r) => {
            const Icon = DEPARTMENT_ICON[dp.id]
            const rowMatches = matches ? dp.members.filter((m) => matches.has(m.n)).length : null
            return (
              <div key={dp.id} className={`pt__line ${dsel === dp.id ? 'is-row' : ''}`} style={{ '--fam': FAMILY[r] } as CSSProperties}>
                <button
                  type="button"
                  className={`pt__label ${rowMatches === 0 ? 'is-dim' : ''} ${current?.department === dp.id ? 'is-active' : ''}`}
                  onClick={() => pickDept(dp.id)}
                  onDoubleClick={() => goTo(dp.id)}
                  onPointerEnter={hoverOn({ d: dp.id })}
                  onPointerLeave={hoverOut}
                  aria-pressed={dsel === dp.id}
                  aria-label={`${dp.name}: 10 AI employees`}
                >
                  <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pt__label-name">{dp.name}</span>
                  {rowMatches !== null && rowMatches > 0 && <span className="pt__label-count mono">{rowMatches}</span>}
                </button>
                {dp.members.map((m, c) => {
                  const isSel = m.n === sel
                  const dim = matches ? !matches.has(m.n) : false
                  return (
                    <button
                      key={m.n}
                      type="button"
                      ref={(el) => {
                        cells.current[m.n] = el
                      }}
                      data-n={m.n}
                      data-name={m.name}
                      className={`pt__cell ${isSel ? 'is-sel' : ''} ${dim ? 'is-dim' : ''} ${matches && !dim ? 'is-match' : ''}`}
                      style={{ '--w': r + c, '--c': c } as CSSProperties}
                      tabIndex={isSel || (sel === null && m.n === 1) ? 0 : -1}
                      aria-pressed={isSel}
                      aria-label={`${m.n}, ${m.symbol}: ${m.name} — ${dp.name}`}
                      onClick={() => select(m.n)}
                      onPointerEnter={hoverOn({ n: m.n })}
                      onPointerLeave={hoverOut}
                    >
                      <span className="pt__n">{m.n}</span>
                      <span className="pt__sym">{m.symbol}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {!inText && (pos || dsel) && card}
      </div>
    </div>
  )
}
