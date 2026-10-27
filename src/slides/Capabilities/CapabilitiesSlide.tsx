import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Element, FAMILY } from '../../components/Element/Element'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { EMPLOYEE_ICON } from '../../components/ui/icons'
import { OS } from '../../data/architecture'
import { AVAILABILITY_LABEL, CAPABILITIES, EMPLOYEES, employeeById, type EmployeeId } from '../../data/employees'
import { onCatalogRequest } from '../../lib/events'
import './Capabilities.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const normalize = (s: string) => s.toLowerCase().normalize('NFKD')

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

const capByN = (n: number) => CAPABILITIES[n - 1]
const rowOf = (n: number) => Math.floor((n - 1) / 10)

/**
 * Capabilities Catalog — the 100 capabilities as a periodic table.
 * Neuronium is element 0 (Nr); each AI Employee is a period of ten elements.
 */
export function CapabilitiesSlide(_: SlideProps) {
  const [selected, setSelected] = useState(1)
  const [query, setQuery] = useState('')
  const cells = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(
    () =>
      onCatalogRequest((id: EmployeeId) => {
        setQuery('')
        setSelected(employeeById(id).capabilities[0].n)
      }),
    [],
  )

  const q = query.trim()
  const matches = useMemo(() => {
    if (!q) return null
    const nq = normalize(q)
    return new Set(
      CAPABILITIES.filter(
        (c) =>
          normalize(c.name).includes(nq) ||
          normalize(c.description).includes(nq) ||
          normalize(c.symbol) === nq ||
          normalize(employeeById(c.employee).name).includes(nq) ||
          String(c.n) === nq,
      ).map((c) => c.n),
    )
  }, [q])
  const matchList = matches ? [...matches].sort((a, b) => a - b) : []

  // Typing a query moves the selection to the first match.
  useEffect(() => {
    if (matches && matches.size && !matches.has(selected)) setSelected(Math.min(...matches))
  }, [q])

  const focusCell = (n: number) => {
    setSelected(n)
    cells.current[n]?.focus()
  }

  const onGridKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (!target.dataset.n) return
    const n = Number(target.dataset.n)
    if (n === 0) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        focusCell(1)
      }
      return
    }
    const col = (n - 1) % 10
    let next: number | null = null
    if (e.key === 'ArrowRight') next = n < 100 ? n + 1 : n
    if (e.key === 'ArrowLeft') next = n > 1 ? n - 1 : 0
    if (e.key === 'ArrowDown') next = n + 10 <= 100 ? n + 10 : n
    if (e.key === 'ArrowUp') next = n - 10 >= 1 ? n - 10 : 0
    if (e.key === 'Home') next = n - col
    if (e.key === 'End') next = n - col + 9
    if (next === null) return
    e.preventDefault()
    focusCell(next)
  }

  const step = (delta: number) => {
    const list = matches ? matchList : CAPABILITIES.map((c) => c.n)
    if (!list.length) return
    const i = list.indexOf(selected)
    const next = i < 0 ? list[0] : list[(i + delta + list.length) % list.length]
    setSelected(next)
  }

  const sel = selected > 0 ? capByN(selected) : null
  const selEmp = sel ? employeeById(sel.employee) : null
  const SelIcon = selEmp ? EMPLOYEE_ICON[selEmp.id] : null
  const activeRow = sel ? rowOf(sel.n) : -1

  return (
    <div className="slide__frame cat">
      <header className="cat__head">
        <div>
          <Eyebrow index={10}>Capabilities · periodic table</Eyebrow>
          <h2 className="h2 cat__title">
            <span className="mask" style={d(50)}>
              <span>100 capabilities. 10 workplaces.</span>
            </span>
          </h2>
        </div>
        <div className="cat__tools rv" style={d(220)}>
          <div className="cat__search">
            <Search size={15} strokeWidth={1.7} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setQuery('')
                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  step(1)
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  step(-1)
                }
              }}
              placeholder="Search 100 elements"
              aria-label="Search capabilities"
              aria-describedby="cat-status"
            />
            {query && (
              <button type="button" className="cat__clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>
          <p id="cat-status" className="cat__status mono" aria-live="polite">
            {matches
              ? matches.size
                ? `${matches.size} ${matches.size === 1 ? 'element' : 'elements'} match “${q}”`
                : `Nothing matches “${q}”`
              : '10 AI Employees · 10 capabilities each'}
          </p>
        </div>
      </header>

      <div className="cat__body">
        <div className="pt rv" style={d(260)} role="group" aria-label="Periodic table of capabilities" onKeyDown={onGridKey} data-own-keys>
          <div className="pt__line pt__line--head">
            <button
              type="button"
              ref={(el) => {
                cells.current[0] = el
              }}
              data-n={0}
              className={`pt__zero ${selected === 0 ? 'is-sel' : ''}`}
              tabIndex={selected === 0 ? 0 : -1}
              aria-pressed={selected === 0}
              aria-label="Element 0: Nr, Neuronium — the operating system"
              onClick={() => setSelected(0)}
            >
              <span className="pt__n">0</span>
              <span className="pt__sym">Nr</span>
              <span className="pt__zero-name">Neuronium</span>
            </button>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="pt__col mono" aria-hidden="true">
                {i + 1}
              </span>
            ))}
          </div>

          {EMPLOYEES.map((e, r) => {
            const Icon = EMPLOYEE_ICON[e.id]
            const rowMatches = matches ? e.capabilities.filter((c) => matches.has(c.n)).length : null
            return (
              <div key={e.id} className={`pt__line ${r === activeRow ? 'is-active' : ''}`} style={{ '--fam': FAMILY[r] } as CSSProperties}>
                <button
                  type="button"
                  className={`pt__label ${rowMatches === 0 ? 'is-dim' : ''}`}
                  onClick={() => {
                    setQuery('')
                    setSelected(e.capabilities[0].n)
                  }}
                  aria-label={`${e.name}: elements ${r * 10 + 1} to ${r * 10 + 10}`}
                  tabIndex={-1}
                >
                  <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
                  <span className="pt__label-name">{e.name}</span>
                  {rowMatches !== null && rowMatches > 0 && <span className="pt__label-count mono">{rowMatches}</span>}
                </button>
                {e.capabilities.map((c) => {
                  const isSel = c.n === selected
                  const dim = matches ? !matches.has(c.n) : false
                  return (
                    <button
                      key={c.n}
                      type="button"
                      ref={(el) => {
                        cells.current[c.n] = el
                      }}
                      data-n={c.n}
                      data-name={c.name}
                      className={`pt__cell ${isSel ? 'is-sel' : ''} ${dim ? 'is-dim' : ''} ${matches && !dim ? 'is-match' : ''}`}
                      tabIndex={isSel || (selected === 0 && c.n === 1) ? 0 : -1}
                      aria-pressed={isSel}
                      aria-label={`${c.n}, ${c.symbol}: ${c.name} — ${e.name}`}
                      onClick={() => setSelected(c.n)}
                    >
                      <span className="pt__n">{c.n}</span>
                      <span className="pt__sym">{c.symbol}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        <article className="cat__detail rv" style={d(360)} aria-live="polite">
          {sel && selEmp && SelIcon ? (
            <div key={sel.n} className="cat__detail-in">
              <Element n={sel.n} symbol={sel.symbol} name={sel.name} family={rowOf(sel.n)} size="lg" className="cat__big" />
              <div className="cat__detail-text">
                <p className="cat__detail-emp" style={{ '--fam': FAMILY[rowOf(sel.n)] } as CSSProperties}>
                  <SelIcon size={14} strokeWidth={1.6} aria-hidden="true" />
                  {selEmp.name}
                  <span className="mono">· {selEmp.capabilities[0].n}–{selEmp.capabilities[9].n}</span>
                </p>
                <h3 className="cat__detail-name">{highlight(sel.name, q)}</h3>
                <p className="cat__detail-desc">{highlight(sel.description, q)}</p>
                <p className="cat__avail">
                  <span className={`cat__avail-dot cat__avail-dot--${sel.availability}`} />
                  {AVAILABILITY_LABEL[sel.availability]}
                </p>
              </div>
            </div>
          ) : (
            <div key="zero" className="cat__detail-in">
              <Element n={0} symbol="Nr" name="Neuronium" size="lg" className="cat__big cat__big--zero" />
              <div className="cat__detail-text">
                <p className="cat__detail-emp">Element 0 · {OS.category}</p>
                <h3 className="cat__detail-name">Neuronium</h3>
                <p className="cat__detail-desc">
                  The operating system all 100 capabilities run on — with AI Governance built in:{' '}
                  {OS.governance.functions.join(', ')}.
                </p>
              </div>
            </div>
          )}
          <div className="cat__nav">
            <button type="button" onClick={() => step(-1)} aria-label={matches ? 'Previous match' : 'Previous element'}>
              <ChevronLeft size={15} strokeWidth={1.7} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={matches ? 'Next match' : 'Next element'}>
              <ChevronRight size={15} strokeWidth={1.7} />
            </button>
          </div>
        </article>
      </div>

      <p className="cat__disclosure rv" style={d(440)}>
        The capability map describes the intended product scope. Availability may vary by release and integration.
      </p>
    </div>
  )
}
