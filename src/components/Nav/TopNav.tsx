import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { DEPARTMENTS } from '../../data/departments'
import { SLIDES, type NavGroup } from '../../data/slides'
import { FAMILY } from '../Element/Element'
import { useDeck } from '../SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../ui/icons'
import './Nav.css'

const ITEMS: { key: NavGroup; label: string; target: string }[] = [
  { key: 'platform', label: 'Platform', target: 'context' },
  { key: 'employees', label: 'AI Employees', target: 'employees' },
  { key: 'departments', label: 'Departments', target: 'management' },
  { key: 'custom', label: 'Use cases', target: 'custom' },
  { key: 'pricing', label: 'Pricing', target: 'pricing' },
  { key: 'faq', label: 'FAQ', target: 'faq' },
]

/**
 * Transparent top menu. The current section is marked by a gliding line; the
 * departments open in a dropdown on desktop and in a full-screen sheet on phones.
 * While a menu is open the deck ignores scroll and swipe gestures.
 */
export function TopNav() {
  const { index, goTo } = useDeck()
  const current = SLIDES[index]
  const [ddOpen, setDdOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const ddRef = useRef<HTMLDivElement>(null)
  const [ink, setInk] = useState<{ x: number; w: number } | null>(null)

  const open = ddOpen || sheetOpen
  useEffect(() => {
    const root = document.documentElement
    if (open) root.dataset.navOpen = 'true'
    else delete root.dataset.navOpen
  }, [open])

  // Any slide change closes the menus.
  useEffect(() => {
    setDdOpen(false)
    setSheetOpen(false)
  }, [index])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDdOpen(false)
        setSheetOpen(false)
      }
    }
    const onDown = (e: PointerEvent) => {
      if (ddOpen && ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open, ddOpen])

  // The gliding line follows the active section.
  useLayoutEffect(() => {
    const menu = menuRef.current
    const el = menu?.querySelector<HTMLElement>(`[data-key="${current.nav}"]`)
    if (!menu || !el) {
      setInk(null)
      return
    }
    const measure = () => {
      const m = menu.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      setInk({ x: r.left - m.left, w: r.width })
    }
    measure()
    // Labels change width once the web font arrives.
    let alive = true
    document.fonts?.ready.then(() => alive && measure())
    window.addEventListener('resize', measure)
    return () => {
      alive = false
      window.removeEventListener('resize', measure)
    }
  }, [current.nav, current.department])

  const jump = (id: string) => {
    setDdOpen(false)
    setSheetOpen(false)
    goTo(id)
  }

  const deptLabel = current.department ? DEPARTMENTS.find((d) => d.id === current.department)?.name : null

  return (
    <header className="nav">
      <a
        className="nav__brand"
        href="#hero"
        aria-label="Neuronium — home"
        onClick={(e) => {
          e.preventDefault()
          jump('hero')
        }}
      >
        <span className="nav__logo" aria-hidden="true">
          Nr
        </span>
      </a>

      <div className="nav__menu" ref={menuRef} role="navigation" aria-label="Main">
        {ITEMS.map((item) =>
          item.key === 'departments' ? (
            <div key={item.key} className="nav__dd" ref={ddRef}>
              <button
                type="button"
                data-key="departments"
                className={`nav__item ${current.nav === 'departments' ? 'is-active' : ''}`}
                aria-expanded={ddOpen}
                aria-haspopup="true"
                onClick={() => setDdOpen((o) => !o)}
              >
                {deptLabel ?? 'Departments'}
                <ChevronDown size={13} strokeWidth={1.8} className="nav__chev" aria-hidden="true" />
              </button>
              {ddOpen && (
                <div className="nav__panel" role="menu" aria-label="Departments">
                  {DEPARTMENTS.map((d, k) => {
                    const Icon = DEPARTMENT_ICON[d.id]
                    return (
                      <button
                        key={d.id}
                        type="button"
                        role="menuitem"
                        className={`nav__dept ${current.department === d.id ? 'is-current' : ''}`}
                        style={{ '--fam': FAMILY[k], '--i': k } as CSSProperties}
                        onClick={() => jump(d.id)}
                      >
                        <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                        <span className="nav__dept-name">{d.name}</span>
                        <span className="nav__dept-line">{d.headline.join(' ')}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <button
              key={item.key}
              type="button"
              data-key={item.key}
              className={`nav__item ${current.nav === item.key ? 'is-active' : ''}`}
              aria-current={current.nav === item.key ? 'page' : undefined}
              onClick={() => jump(item.target)}
            >
              {item.label}
            </button>
          ),
        )}
        <span
          className="nav__ink"
          aria-hidden="true"
          style={ink ? ({ '--x': `${ink.x}px`, '--w': `${ink.w}px`, opacity: 1 } as CSSProperties) : { opacity: 0 }}
        />
      </div>

      <button type="button" className="nav__cta" onClick={() => jump('start')}>
        Get Early Access
        <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <button
        type="button"
        className="nav__burger"
        aria-expanded={sheetOpen}
        aria-controls="nav-sheet"
        aria-label={sheetOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setSheetOpen((o) => !o)}
      >
        {sheetOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
      </button>

      {sheetOpen && (
        <div id="nav-sheet" className="nav__sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <nav className="nav__sheet-main" aria-label="Main">
            {ITEMS.filter((it) => it.key !== 'departments').map((item, k) => (
              <button
                key={item.key}
                type="button"
                className={`nav__sheet-item ${current.nav === item.key ? 'is-active' : ''}`}
                style={{ '--i': k } as CSSProperties}
                onClick={() => jump(item.target)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <p className="nav__sheet-label">Departments</p>
          <div className="nav__sheet-depts">
            {DEPARTMENTS.map((d, k) => {
              const Icon = DEPARTMENT_ICON[d.id]
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`nav__sheet-dept ${current.department === d.id ? 'is-current' : ''}`}
                  style={{ '--fam': FAMILY[k], '--i': k + 5 } as CSSProperties}
                  onClick={() => jump(d.id)}
                >
                  <Icon size={15} strokeWidth={1.6} aria-hidden="true" />
                  {d.name}
                </button>
              )
            })}
          </div>
          <button type="button" className="btn btn--primary nav__sheet-cta" onClick={() => jump('start')}>
            Get Early Access
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  )
}
