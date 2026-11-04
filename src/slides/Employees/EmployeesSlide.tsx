import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Element, FAMILY } from '../../components/Element/Element'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../../components/ui/icons'
import { AI_EMPLOYEES, AVAILABILITY_LABEL, DEPARTMENTS, departmentById, employeeByN, rowOf } from '../../data/departments'
import { useInterval } from '../../hooks/useInterval'
import { focusEmployee } from '../../lib/events'
import './Employees.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const normalize = (s: string) => s.toLowerCase().normalize('NFKD')
/** A short tour across the table, one AI employee per department, until someone interacts. */
const TOUR = [1, 13, 22, 38, 47, 57, 63, 78, 87, 97]
/** Wide screens show the card beside the table; narrower ones open it over the table, on tap only. */
const WIDE = '(min-width: 1101px)'
const isWide = () => window.matchMedia?.(WIDE).matches ?? true

function useWide() {
  const [wide, setWide] = useState(isWide)
  useEffect(() => {
    const mq = window.matchMedia?.(WIDE)
    if (!mq) return
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
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
  const wide = useWide()
  const [sel, setSel] = useState<number | null>(() => (isWide() ? TOUR[0] : null))
  const [tour, setTour] = useState(isWide)
  const [query, setQuery] = useState('')
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number; side: 'r' | 'l' } | null>(null)

  useEffect(() => {
    if (!shown) {
      setSel(isWide() ? TOUR[0] : null)
      setTour(isWide())
      setQuery('')
    }
  }, [shown])

  useInterval(
    () => setSel((s) => TOUR[(TOUR.indexOf(s ?? TOUR[0]) + 1) % TOUR.length]),
    active && tour && !reducedMotion && !query ? 3000 : null,
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
    if (matches && matches.size && (sel === null || !matches.has(sel))) setSel(Math.min(...matches))
    if (matches && !matches.size) setSel(null)
  }, [q])

  // Place the card next to the selected element, inside the table.
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const cell = sel !== null ? cells.current[sel] : null
    if (wide || !wrap || !cell) {
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
  }, [sel, wide])

  const stopTour = () => setTour(false)

  const select = (n: number) => {
    stopTour()
    setSel(n)
  }

  const focusCell = (n: number) => {
    select(n)
    cells.current[n]?.focus()
  }

  const onGridKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (!t.dataset.n) return
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
      return
    }
    if (next === null) return
    e.preventDefault()
    focusCell(next)
  }

  const current = sel !== null ? employeeByN(sel) : null
  const dept = current ? departmentById(current.department) : null
  const DeptIcon = dept ? DEPARTMENT_ICON[dept.id] : null

  const card =
    current && dept && DeptIcon ? (
      <article
        key={current.n}
        className={`emp__card ${wide ? 'emp__card--side' : `emp__card--${pos?.side ?? 'r'}`}`}
        style={{ '--x': `${pos?.x ?? 0}px`, '--y': `${pos?.y ?? 0}px`, '--fam': FAMILY[rowOf(current.n)] } as CSSProperties}
        aria-live="polite"
      >
        <div className="emp__card-top">
          <Element n={current.n} symbol={current.symbol} family={rowOf(current.n)} size="sm" />
          <div className="emp__card-head">
            <p className="emp__card-dept">
              <DeptIcon size={12} strokeWidth={1.7} aria-hidden="true" />
              {dept.name}
            </p>
            <h3 className="emp__card-name">{highlight(current.name, q)}</h3>
          </div>
          <button
            type="button"
            className="emp__card-x"
            onClick={() => {
              stopTour()
              setSel(null)
            }}
            aria-label="Close"
          >
            <X size={13} strokeWidth={1.8} />
          </button>
        </div>
        <p className="emp__card-desc">{highlight(current.description, q)}</p>
        <div className="emp__card-foot">
          <span className="emp__avail">
            <span className={`emp__avail-dot emp__avail-dot--${current.availability}`} />
            {AVAILABILITY_LABEL[current.availability]}
          </span>
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
    ) : wide ? (
      <p className="emp__card emp__card--side emp__card--empty">Pick an element to see what this AI employee does.</p>
    ) : null

  return (
    <div className="slide__frame emp">
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
          {query && (
            <button type="button" className="emp__clear" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={14} strokeWidth={1.8} />
            </button>
          )}
        </div>
        <p id="emp-status" className="emp__status mono rv" style={d(420)} aria-live="polite">
          {matches ? (matches.size ? `${matches.size} match “${q}”` : `Nothing matches “${q}”`) : 'Product scope · availability varies by release'}
        </p>
        {wide && (
          <div className="emp__side rv" style={d(460)}>
            {card}
          </div>
        )}
      </div>

      <div className="emp__table-wrap" ref={wrapRef}>
        <div className="pt" role="group" aria-label="Periodic table of 100 AI employees" onKeyDown={onGridKey} data-own-keys>
          <div className="pt__line pt__line--head rv" style={d(200)}>
            <span className="pt__zero" aria-label="Element 0: Nr, Neuronium">
              <span className="pt__n">0</span>
              <span className="pt__sym">Nr</span>
            </span>
            <span className="pt__zero-text">
              <b>Neuronium</b> · element 0 · AI Operating System
            </span>
          </div>

          {DEPARTMENTS.map((dp, r) => {
            const Icon = DEPARTMENT_ICON[dp.id]
            const rowMatches = matches ? dp.members.filter((m) => matches.has(m.n)).length : null
            return (
              <div key={dp.id} className="pt__line" style={{ '--fam': FAMILY[r] } as CSSProperties}>
                <button
                  type="button"
                  className={`pt__label ${rowMatches === 0 ? 'is-dim' : ''} ${current?.department === dp.id ? 'is-active' : ''}`}
                  onClick={() => goTo(dp.id)}
                  aria-label={`Open ${dp.name}`}
                  tabIndex={-1}
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
                      style={{ '--w': r + c } as CSSProperties}
                      tabIndex={isSel || (sel === null && m.n === 1) ? 0 : -1}
                      aria-pressed={isSel}
                      aria-label={`${m.n}, ${m.symbol}: ${m.name} — ${dp.name}`}
                      onClick={() => select(m.n)}
                    >
                      <span className="pt__n">{m.n}</span>
                      <span className="pt__sym">{m.symbol}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
          <span className="pt__sweep" aria-hidden="true" />
        </div>

        {!wide && pos && card}
      </div>
    </div>
  )
}
