import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { GITHUB_URL, PLATFORM_URL } from '../../config/links'
import { BrandIcon } from '../Brand/BrandIcon'
import { DEPARTMENTS } from '../../data/departments'
import { SLIDES, isSlideOpen, type SlideMeta } from '../../data/slides'
import { FAMILY } from '../Element/Element'
import { useDeck } from '../SlideController/DeckContext'
import { DEPARTMENT_ICON } from '../ui/icons'
import './Nav.css'

/** Departments that are open on the site; with one, the menu links to it directly. */
const OPEN_DEPTS = DEPARTMENTS.filter((d) => isSlideOpen(d.id))

export interface NavItem {
  key: string
  label: string
  target: string
}

const ALL_ITEMS: NavItem[] = [
  { key: 'platform', label: 'Platform', target: 'context' },
  { key: 'employees', label: 'AI Employees', target: 'employees' },
  {
    key: 'departments',
    label: OPEN_DEPTS.length === 1 ? OPEN_DEPTS[0].name : 'Departments',
    target: OPEN_DEPTS[0]?.id ?? 'management',
  },
  { key: 'custom', label: 'Use cases', target: 'custom' },
  { key: 'cases', label: 'Cases', target: 'cases' },
  { key: 'pricing', label: 'Pricing', target: 'pricing' },
  { key: 'faq', label: 'FAQ', target: 'faq' },
  // the last block: the business task, and who stands behind Neuronium
  { key: 'start', label: 'Contacts', target: 'start' },
]

/** Only the sections that are open. */
const ITEMS = ALL_ITEMS.filter((it) => (it.key === 'departments' ? OPEN_DEPTS.length > 0 : isSlideOpen(it.target)))
const DROPDOWN = OPEN_DEPTS.length > 1

/**
 * Transparent top menu. The current section is marked by a gliding line; the
 * departments open in a dropdown on desktop and in a full-screen sheet on phones.
 * While a menu is open the deck ignores scroll and swipe gestures.
 */
interface TopNavProps {
  /** The blocks of this page (the landing's by default). */
  slides?: SlideMeta[]
  /** The menu's sections. */
  items?: NavItem[]
  /** The white button on the right. */
  cta?: { label: string; href: string }
  /** When set, the logo leads to this page instead of the first block. */
  home?: string
}

export function TopNav({ slides = SLIDES, items = ITEMS, cta = { label: 'Open AI OS', href: PLATFORM_URL }, home }: TopNavProps) {
  const { index, goTo } = useDeck()
  const current = slides[index]
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
        href={home ?? '#hero'}
        aria-label="Neuronium — home"
        onClick={(e) => {
          if (home) return
          e.preventDefault()
          jump('hero')
        }}
      >
        <span className="nav__logo" aria-hidden="true">
          Nr
        </span>
      </a>

      <div className="nav__menu" ref={menuRef} role="navigation" aria-label="Main">
        {items.map((item) =>
          item.key === 'departments' && DROPDOWN ? (
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
                  {OPEN_DEPTS.map((d) => {
                    const Icon = DEPARTMENT_ICON[d.id]
                    const k = DEPARTMENTS.indexOf(d)
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

      <div className="nav__end">
      <a className="nav__oss" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Open source on GitHub">
        <BrandIcon brand="github" size={15} />
        <span>Open source</span>
      </a>
      <a className="nav__cta" href={cta.href}>
        {cta.label}
        <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
      </a>

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
      </div>

      {sheetOpen && (
        <div id="nav-sheet" className="nav__sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <nav className="nav__sheet-main" aria-label="Main">
            {items.filter((it) => it.key !== 'departments' || !DROPDOWN).map((item, k) => (
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
          {DROPDOWN && <p className="nav__sheet-label">Departments</p>}
          <div className="nav__sheet-depts" hidden={!DROPDOWN}>
            {OPEN_DEPTS.map((d) => {
              const Icon = DEPARTMENT_ICON[d.id]
              const k = DEPARTMENTS.indexOf(d)
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
          <a className="btn btn--primary nav__sheet-cta" href={cta.href}>
            {cta.label}
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  )
}
