import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TOPICS, casesOf, type Topic } from '../../data/cases'
import { CaseCard } from './CaseCard'

/** Every case on one page, over the site: its topics to filter by, a search, and a grid that scrolls. */
export function CasesIndex({ onClose, topic }: { onClose: () => void; topic?: Topic }) {
  const [q, setQ] = useState('')
  const [on, setOn] = useState<Topic | undefined>(topic)
  const box = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const found = useMemo(() => {
    const t = q.trim().toLowerCase()
    const list = casesOf(on)
    return t ? list.filter((c) => c.title.toLowerCase().includes(t)) : list
  }, [q, on])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.overlayOpen = 'true'
    const back = document.activeElement as HTMLElement | null
    search.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      // Tab stays inside
      if (e.key !== 'Tab' || !box.current) return
      const all = [...box.current.querySelectorAll<HTMLElement>('input, button, a[href], [tabindex="0"]')]
      if (!all.length) return
      const first = all[0]
      const last = all[all.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      delete root.dataset.overlayOpen
      back?.focus({ preventScroll: true })
    }
  }, [onClose])

  return createPortal(
    <div ref={box} className="cx" role="dialog" aria-modal="true" aria-labelledby="cx-title">
      <div className="cx__head">
        <h2 id="cx-title" className="cx__title">
          {on ? `${on} cases` : 'All cases'} <span className="cx__count">{casesOf(on).length}</span>
        </h2>
        <label className="cx__search">
          <Search size={16} strokeWidth={1.8} aria-hidden="true" />
          <span className="sr-only">Search cases</span>
          <input ref={search} type="search" value={q} placeholder="Search cases" autoComplete="off" onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="button" className="cx__x" aria-label="Close" onClick={onClose}>
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
      <div className="cx__topics" role="group" aria-label="Filter by topic">
        {[undefined, ...TOPICS].map((t) => (
          <button key={t ?? 'all'} type="button" className="cx__topic" aria-pressed={on === t} onClick={() => setOn(t)}>
            {t ?? 'All'}
            <span>{casesOf(t).length}</span>
          </button>
        ))}
      </div>
      <div className="cx__body">
        {found.length ? (
          <div className="cx__grid">
            {found.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        ) : (
          <p className="cx__none" role="status">
            Nothing matches “{q.trim()}”.
          </p>
        )}
      </div>
    </div>,
    document.body,
  )
}
