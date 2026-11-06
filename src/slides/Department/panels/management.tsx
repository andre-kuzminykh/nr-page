import {
  CalendarDays,
  ChartGantt,
  Check,
  Inbox,
  ListChecks,
  Mail,
  MessageCircle,
  Package,
  Search,
  Send,
  SquareKanban,
  Target,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Avatar, Sym, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage, PanelRenderProps } from '../types'
import { ANSWERS, ANSWER_MS, KnowledgeSearch } from './knowledge'
import './management.css'

/**
 * Management is one interface that keeps turning, AI employee by AI employee in order: knowledge → notes →
 * goals → tasks → board → projects → product → calendar → inbox → team. From the task list on, the same
 * six tasks stay on screen and glide between the views.
 */
type View = 'knowledge' | 'notes' | 'goals' | 'product' | 'tasks' | 'gantt' | 'calendar' | 'board' | 'inbox' | 'team'

const VIEW_OF: Record<number, View> = {
  1: 'knowledge',
  2: 'notes',
  3: 'goals',
  4: 'tasks',
  5: 'board',
  6: 'gantt',
  7: 'product',
  8: 'calendar',
  9: 'inbox',
  10: 'team',
}

const HEAD: Record<View, { icon: LucideIcon; title: string; meta: string }> = {
  knowledge: { icon: Search, title: 'Knowledge', meta: 'Drive · Meet' },
  notes: { icon: Video, title: 'Weekly review', meta: 'Google Meet' },
  goals: { icon: Target, title: 'Goals', meta: 'This quarter' },
  product: { icon: Package, title: 'Product', meta: '6 tasks' },
  tasks: { icon: ListChecks, title: 'Tasks', meta: 'From the product' },
  gantt: { icon: ChartGantt, title: 'Projects', meta: '6 weeks' },
  calendar: { icon: CalendarDays, title: 'Calendar', meta: 'This week' },
  board: { icon: SquareKanban, title: 'Board', meta: 'To do → Done' },
  inbox: { icon: Inbox, title: 'Inbox', meta: 'Email · Telegram · WhatsApp' },
  team: { icon: Users, title: 'Team', meta: 'Roles and load' },
}

const PROJECTS = ['Mobile App', 'Website', 'Pilot']

interface Task {
  t: string
  /** project */
  p: number
  /** AI employee doing it */
  who: number
  /** Gantt: start week, length in weeks (of 6) */
  g: [number, number]
  /** Calendar: day (0–4), first slot (0–5), slots */
  cal: [number, number, number]
  /** Board column (0 to do, 1 in progress, 2 done) at each of the three moments */
  k: [number, number, number]
}

const TASKS: Task[] = [
  { t: 'PRD v1', p: 0, who: 63, g: [0, 1.4], cal: [0, 0, 2], k: [2, 2, 2] },
  { t: 'App prototype', p: 0, who: 78, g: [1.1, 1.7], cal: [1, 1, 3], k: [1, 2, 2] },
  { t: 'Sheets import', p: 0, who: 86, g: [2.5, 2.2], cal: [2, 0, 3], k: [0, 1, 1] },
  { t: 'Landing page', p: 1, who: 74, g: [0.5, 2], cal: [0, 3, 2], k: [1, 1, 2] },
  { t: 'Pricing page', p: 1, who: 82, g: [2.8, 1.3], cal: [3, 2, 2], k: [0, 0, 1] },
  { t: 'Pilot onboarding', p: 2, who: 49, g: [4.3, 1.6], cal: [4, 1, 2], k: [0, 0, 0] },
]

const pct = (v: number) => `${v.toFixed(2)}%`

/** In the turning interface, Knowledge cycles through the same questions as its solo search. */
const QA_MS = 6500

/** Where each task sits in each view (percent of the window body). */
function place(view: View, i: number, step: number): { x: number; y: number; w: number; h: number; on: boolean } {
  const task = TASKS[i]
  switch (view) {
    case 'tasks':
      return { x: 0, y: 14 + i * 14, w: 100, h: 11.5, on: true }
    case 'gantt': {
      const [s, l] = task.g
      return { x: 2 + (s / 6) * 96, y: 14 + i * 14, w: (l / 6) * 96, h: 9.5, on: true }
    }
    case 'calendar': {
      const [d, s, n] = task.cal
      return { x: d * 20.2, y: 13 + s * 14.2, w: 19, h: n * 14.2 - 1.6, on: true }
    }
    case 'board': {
      const col = task.k[step]
      const row = TASKS.slice(0, i).filter((o) => o.k[step] === col).length
      return { x: col * 33.8, y: 14 + row * 15.5, w: 32.4, h: 13, on: true }
    }
    case 'product':
      return { x: (i % 2) * 51, y: 54 + Math.floor(i / 2) * 15, w: 49, h: 12, on: true }
    default:
      return { x: 30, y: 46, w: 40, h: 10, on: false }
  }
}

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = ['9:00', '10:00', '11:00', '12:00', '14:00', '15:00']
const COLS = ['To do', 'In progress', 'Done']

function ManagementScene({ sel, live }: PanelRenderProps) {
  const view = VIEW_OF[sel] ?? 'knowledge'
  const head = HEAD[view]
  const Icon = head.icon

  // On the board the same tasks move on: to do → in progress → done.
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    if (view !== 'board' || !live) {
      if (view === 'board') setStep(2)
      return
    }
    const a = window.setTimeout(() => setStep(1), 1700)
    const b = window.setTimeout(() => setStep(2), 3400)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [view, live])

  // while Knowledge stays on screen, it answers one question after another
  const [qa, setQa] = useState(0)
  useEffect(() => {
    setQa(0)
    if (view !== 'knowledge' || !live) return
    const t = window.setInterval(() => setQa((x) => (x + 1) % ANSWERS.length), QA_MS)
    return () => window.clearInterval(t)
  }, [view, live])
  const ask = ANSWERS[qa]
  // the window has room for two of the three sources
  const near = ask.sources.slice(0, 2)

  const counts = COLS.map((_, c) => TASKS.filter((t) => t.k[step] === c).length)
  const on = (v: View) => (view === v ? 'true' : 'false')
  const hot = (v: View) => `mgx-v mgx-v--${v} ${view === v ? 'is-hot' : ''}`

  return (
    <div className={`pn is-focus mgx ${live ? 'is-live' : ''}`} data-view={view}>
      <div className="pn__head mgx__head" key={view}>
        <Icon size={14} strokeWidth={1.7} aria-hidden="true" />
        <span className="pn__title">{head.title}</span>
        {/* Knowledge names the tools the current answer came from */}
        <span className="pn__meta">{view === 'knowledge' ? near.map((x) => x.app).join(' · ') : head.meta}</span>
      </div>
      <div className="pn__body mgx__body">
        <div className="mgx__stage">
          {/* ---------- 1 Knowledge ---------- */}
          <section className={hot('knowledge')} data-on={on('knowledge')} aria-hidden={view !== 'knowledge'}>
            <div className="mgx-qa" key={qa}>
              <div className="mgx-search">
                <Search size={15} strokeWidth={1.8} aria-hidden="true" />
                <Type text={ask.q} play={live && view === 'knowledge'} speed={28} delay={200} />
              </div>
              <div className="mgx-answer">
                <Sym n={1} />
                <div>
                  <p>{ask.a}</p>
                  <p className="mgx-src">
                    {near.map(({ icon: I, app, title }) => (
                      <span key={title}>
                        <I size={11} strokeWidth={1.8} aria-hidden="true" /> {app} · {title}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <p className="mgx-label mgx-late" style={{ '--k': 0 } as CSSProperties}>
                Found in
              </p>
              {near.map(({ icon: I, app, title, note }, k) => (
                <div key={title} className="mgx-doc mgx-late" style={{ '--k': k + 1 } as CSSProperties}>
                  <I size={14} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p>{title}</p>
                    <p className="mgx-quote">{note}</p>
                  </div>
                  <span className="k-mono k-muted">{app}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- 2 Notes ---------- */}
          <section className={hot('notes')} data-on={on('notes')} aria-hidden={view !== 'notes'}>
            <p className="mgx-call">
              <span className="mgx-rec" aria-hidden="true" />
              Weekly review · 32 min
              <span className="k-muted">· notes by</span>
              <Sym n={2} />
            </p>
            <p className="mgx-label">Decision</p>
            <p className="mgx-note mgx-note--d" style={{ '--k': 0 } as CSSProperties}>
              Launch the Mobile App on Nov 20
            </p>
            <p className="mgx-label">Tasks</p>
            {['Landing page copy', 'Invite five pilot customers', 'Update the pricing page'].map((t, k) => (
              <p key={t} className="mgx-note" style={{ '--k': k + 1 } as CSSProperties}>
                <span className="mgx-box" aria-hidden="true" />
                {t}
              </p>
            ))}
          </section>

          {/* ---------- 3 Goals ---------- */}
          <section className={hot('goals')} data-on={on('goals')} aria-hidden={view !== 'goals'}>
            {[
              ['Launch the Mobile App MVP', 62],
              ['Ten pilot customers', 40],
              ['Client reports in under 15 minutes', 75],
            ].map(([t, v], k) => (
              <div key={t as string} className="mgx-goal" style={{ '--k': k, '--v': `${v}%` } as CSSProperties}>
                <p>
                  <span>{t}</span>
                  <b className="k-mono">{v}%</b>
                </p>
                <span className="mgx-goal__bar">
                  <i />
                </span>
              </div>
            ))}
            <p className="mgx-foot">
              <Sym n={3} /> Set from the product and its customers
            </p>
          </section>

          {/* ---------- 7 Product ---------- */}
          <section className={hot('product')} data-on={on('product')} aria-hidden={view !== 'product'}>
            <div className="mgx-product">
              <span className="mgx-product__ic" aria-hidden="true">
                <Package size={18} strokeWidth={1.6} />
              </span>
              <div>
                <p className="mgx-product__name">Mobile App MVP</p>
                <p className="k-muted">Client reports in minutes, for small agencies</p>
              </div>
              <Sym n={7} />
            </div>
            <dl className="mgx-spec">
              {[
                ['Customers', 'Small agencies, 5–50 people'],
                ['Job to be done', 'Monday client reports'],
                ['Release', 'Nov 20'],
              ].map(([k2, v], k) => (
                <div key={k2} style={{ '--k': k } as CSSProperties}>
                  <dt>{k2}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ---------- 4 Tasks (list) ---------- */}
          <section className={hot('tasks')} data-on={on('tasks')} aria-hidden={view !== 'tasks'}>
            <p className="mgx-row-head">
              <span>6 tasks · Mobile App MVP</span>
              <Sym n={4} />
            </p>
          </section>

          {/* ---------- 6 Gantt ---------- */}
          <section className={hot('gantt')} data-on={on('gantt')} aria-hidden={view !== 'gantt'}>
            <div className="mgx-weeks">
              {WEEKS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <span className="mgx-today" aria-hidden="true" />
            <p className="mgx-legend">
              {PROJECTS.map((p, k) => (
                <span key={p} className={`mgx-proj mgx-proj--${k}`}>
                  {p}
                </span>
              ))}
              <Sym n={6} />
            </p>
          </section>

          {/* ---------- 8 Calendar ---------- */}
          <section className={hot('calendar')} data-on={on('calendar')} aria-hidden={view !== 'calendar'}>
            <div className="mgx-days">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mgx-hours" aria-hidden="true">
              {HOURS.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            <span className="mgx-now" aria-hidden="true" />
            <span className="mgx-tag-r">
              <Sym n={8} />
            </span>
          </section>

          {/* ---------- 5 Board ---------- */}
          <section className={hot('board')} data-on={on('board')} aria-hidden={view !== 'board'}>
            <div className="mgx-cols">
              {COLS.map((c, k) => (
                <span key={c}>
                  {c} <b className="k-mono">{counts[k]}</b>
                </span>
              ))}
            </div>
            <span className="mgx-tag-r">
              <Sym n={5} />
            </span>
          </section>

          {/* ---------- 9 Inbox ---------- */}
          <section className={hot('inbox')} data-on={on('inbox')} aria-hidden={view !== 'inbox'}>
            {[
              [Mail, 'Brightline · CEO', 'Can we start the pilot next week?', 'Task: Pilot onboarding'],
              [Send, 'Telegram · Product chat', 'Sheets import is merged', 'Moved to Done'],
              [MessageCircle, 'WhatsApp · Northwind', 'Where is the October report?', 'Reply drafted'],
            ].map(([Ic, from, msg, act], k) => {
              const I = Ic as LucideIcon
              return (
                <div key={from as string} className="mgx-msg" style={{ '--k': k } as CSSProperties}>
                  <I size={14} strokeWidth={1.7} aria-hidden="true" />
                  <div>
                    <p className="mgx-msg__from">{from as string}</p>
                    <p>{msg as string}</p>
                  </div>
                  <span className="mgx-msg__act">
                    <Check size={11} strokeWidth={2} aria-hidden="true" /> {act as string}
                  </span>
                </div>
              )
            })}
            <p className="mgx-foot">
              <Sym n={9} /> Email, calendar and messengers in one place
            </p>
          </section>

          {/* ---------- 10 Team ---------- */}
          <section className={hot('team')} data-on={on('team')} aria-hidden={view !== 'team'}>
            {[
              ['Product lead', 'Launch plan', 72, 0],
              ['Designer', 'App prototype', 58, 1],
              ['Engineer', 'Sheets import', 86, 2],
              ['Sales lead', 'Pilot onboarding', 44, 3],
            ].map(([role, focus, load, hue], k) => (
              <div key={role as string} className="mgx-person" style={{ '--k': k, '--v': `${load}%` } as CSSProperties}>
                <Avatar name={role as string} hue={hue as number} />
                <div>
                  <p className="mgx-person__role">{role as string}</p>
                  <p className="k-muted">{focus as string}</p>
                </div>
                <span className="mgx-goal__bar mgx-person__load">
                  <i />
                </span>
              </div>
            ))}
            <p className="mgx-foot">
              <Sym n={10} /> Roles, skills and load across the team
            </p>
          </section>

          {/* ---------- the same six tasks, moving between views ---------- */}
          <div className="mgx-tasks" aria-hidden={!['tasks', 'board', 'gantt', 'product', 'calendar'].includes(view)}>
            {TASKS.map((task, k) => {
              const r = place(view, k, step)
              const done = view === 'board' ? task.k[step] === 2 : task.k[0] === 2
              return (
                <div
                  key={task.t}
                  className={`mgx-t mgx-t--p${task.p} ${r.on ? 'is-on' : ''} ${done ? 'is-done' : ''}`}
                  style={{ '--x': pct(r.x), '--y': pct(r.y), '--w': pct(r.w), '--h': pct(r.h), '--k': k } as CSSProperties}
                >
                  <span className="mgx-t__mark" aria-hidden="true">
                    {done ? <Check size={10} strokeWidth={2.4} /> : null}
                  </span>
                  <span className="mgx-t__title">{task.t}</span>
                  <span className="mgx-t__proj">{PROJECTS[task.p]}</span>
                  <Sym n={task.who} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const management: DepartmentStage = {
  layout: 'quad',
  panels: [],
  scene: (p) => <ManagementScene {...p} />,
  // Knowledge Management on its own: just the search
  solo: { 1: { ms: ANSWER_MS, render: (p) => <KnowledgeSearch key={p.round} {...p} /> } },
}
