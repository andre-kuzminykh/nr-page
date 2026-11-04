import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { employeeByN, rowOf } from '../../data/departments'
import { FAMILY } from '../Element/Element'
import './Kit.css'

/**
 * Interface kit for the "pieces of interface" on every block. Everything shown in
 * these panels is illustrative sample data, never a claim about real customers.
 */

interface PanelProps {
  title: string
  icon: LucideIcon
  meta?: string
  focus?: boolean
  dim?: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
  children: ReactNode
}

export function Panel({ title, icon: Icon, meta, focus, dim, className = '', style, onClick, children }: PanelProps) {
  return (
    <div
      className={`pn ${focus ? 'is-focus' : ''} ${dim ? 'is-dim' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      <div className="pn__head">
        <Icon size={14} strokeWidth={1.7} aria-hidden="true" />
        <span className="pn__title">{title}</span>
        {meta && <span className="pn__meta">{meta}</span>}
      </div>
      <div className="pn__body">{children}</div>
    </div>
  )
}

/** A section of a panel that lights up while the AI employee doing that work is selected. */
export function Hot({ on, sel, children, className = '' }: { on: number[]; sel: number; children: ReactNode; className?: string }) {
  const hot = on.includes(sel)
  return (
    <div className={`hot ${hot ? 'is-hot' : ''} ${className}`}>
      {children}
      {hot && <Sym n={sel} className="hot__tag" />}
    </div>
  )
}

/** Mini element tile for an AI employee. */
export function Sym({ n, className = '' }: { n: number; className?: string }) {
  const e = employeeByN(n)
  return (
    <span className={`sym ${className}`} style={{ '--fam': FAMILY[rowOf(n)] } as CSSProperties} title={e.name} aria-hidden="true">
      {e.symbol}
    </span>
  )
}

/** Text that writes itself while `play` is on; shown in full otherwise. */
export function Type({ text, play, speed = 22, delay = 250 }: { text: string; play: boolean; speed?: number; delay?: number }) {
  const [count, setCount] = useState(play ? 0 : text.length)
  useEffect(() => {
    if (!play) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    let timer = 0
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length) window.clearInterval(timer)
      }, speed)
    }, delay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(timer)
    }
  }, [play, text, speed, delay])
  const typing = play && count < text.length
  return (
    <span className="type">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {typing && <span className="type__caret" aria-hidden="true" />}
      <span className="type__ghost" aria-hidden="true">{text.slice(count)}</span>
    </span>
  )
}

/** Countdown, e.g. a Pomodoro, running while `play` is on. */
export function Ticker({ from, play }: { from: number; play: boolean }) {
  const [left, setLeft] = useState(from)
  useEffect(() => {
    if (!play) return
    const t = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : from)), 1000)
    return () => window.clearInterval(t)
  }, [play, from])
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  return <span className="mono">{`${mm}:${ss}`}</span>
}

export function Bar({ v, label, className = '' }: { v: number; label?: string; className?: string }) {
  return (
    <span className={`k-bar ${className}`} style={{ '--v': v } as CSSProperties} role={label ? 'img' : undefined} aria-label={label}>
      <span className="k-bar__fill" />
    </span>
  )
}

export function Avatar({ name, hue = 0 }: { name: string; hue?: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <span className="k-av" style={{ '--h': hue } as CSSProperties} aria-hidden="true">
      {initials}
    </span>
  )
}

export function Check({ done = false }: { done?: boolean }) {
  return <span className={`k-check ${done ? 'is-done' : ''}`} aria-hidden="true" />
}

/** Minimal sparkline that draws itself on arrival. */
export function Spark({ values, area = true, className = '' }: { values: number[]; area?: boolean; className?: string }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => [(i / (values.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 24])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const fill = `${line} L100 30 L0 30 Z`
  const last = pts[pts.length - 1]
  return (
    <svg className={`k-spark ${className}`} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      {area && <path d={fill} className="k-spark__area" />}
      <path d={line} className="k-spark__line" pathLength={1} />
      <circle cx={last[0]} cy={last[1]} r="1.6" className="k-spark__dot" />
    </svg>
  )
}

/** Vertical bars that grow on arrival. */
export function Bars({ values, labels, className = '' }: { values: number[]; labels?: string[]; className?: string }) {
  const max = Math.max(...values)
  return (
    <div className={`k-bars ${className}`} aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className="k-bars__col">
          <span className="k-bars__bar" style={{ '--v': v / max, '--i': i } as CSSProperties} />
          {labels && <span className="k-bars__lab">{labels[i]}</span>}
        </span>
      ))}
    </div>
  )
}

/** Pointer parallax for a stage: writes --mx / --my (−1…1) on the element. */
export function useParallax<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !window.matchMedia('(pointer: fine)').matches) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--mx', '0')
      el.style.setProperty('--my', '0')
    }
    window.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])
  return ref
}
