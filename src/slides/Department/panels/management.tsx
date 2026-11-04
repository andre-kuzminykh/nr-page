import { CalendarDays, SquareKanban, Target, Video } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Bar, Check, Hot, Sym, Ticker, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const i = (n: number) => ({ '--i': n }) as CSSProperties

export const management: DepartmentStage = {
  layout: 'quad',
  panels: [
    {
      title: 'Weekly review',
      icon: Video,
      meta: 'Google Meet · live',
      members: [1, 2],
      area: 'a',
      render: ({ sel, live }) => (
        <>
          <Hot on={[1]} sel={sel}>
            <p className="mg-say">
              <span className="k-muted">CEO</span> What did we agree on pilot pricing?
            </p>
            <div className="mg-answer">
              <Sym n={1} />
              <p>
                <Type text="Pilot price stays fixed for three months — decided on Oct 12." play={live && sel === 1} />
                <span className="mg-src">Drive · Pricing notes</span>
              </p>
            </div>
          </Hot>
          <Hot on={[2]} sel={sel}>
            <p className="k-row">
              <span className="k-label k-grow">Notes after the call</span>
              <span className="k-mono k-muted">Docs · Keep</span>
            </p>
            <ul className="mg-notes">
              <li className="k-in" style={i(0)}>
                <span className="k-tag">Decision</span> Launch on Nov 20
              </li>
              <li className="k-in" style={i(1)}>
                <Check /> Landing page copy
              </li>
              <li className="k-in" style={i(2)}>
                <Check /> Invite five pilot customers
              </li>
            </ul>
          </Hot>
        </>
      ),
    },
    {
      title: 'Goals and tasks',
      icon: Target,
      meta: 'Google Tasks',
      members: [3, 4, 7],
      area: 'b',
      render: ({ sel, live }) => (
        <>
          <Hot on={[3, 7]} sel={sel}>
            <div className="k-row">
              <span className="k-grow mg-goal">Launch MVP</span>
              <span className="k-mono">62%</span>
            </div>
            <Bar v={0.62} />
            <div className="k-row mg-product">
              <span className="k-tag">Product</span>
              <span className="k-grow k-muted">Mobile App · small agencies · subscription</span>
            </div>
          </Hot>
          <Hot on={[4]} sel={sel}>
            <div className="k-list">
              <div className="k-row">
                <Check done /> <span className="k-grow">Competitor analysis</span> <span className="k-tag is-ok">Done</span>
              </div>
              <div className="k-row">
                <Check /> <span className="k-grow">PRD v1</span> <span className="k-tag">Do now</span>
              </div>
              <div className="k-row">
                <Check /> <span className="k-grow">Pilot list</span> <span className="k-tag is-warn">Delegate</span>
              </div>
            </div>
            <div className="k-row mg-focus">
              <span className="k-dot" /> <span className="k-grow k-muted">Pomodoro · PRD v1</span>
              <Ticker from={24 * 60 + 12} play={live && sel === 4} />
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Board and timeline',
      icon: SquareKanban,
      meta: 'Daily · weekly · monthly',
      members: [5, 6],
      area: 'c',
      render: ({ sel, live }) => (
        <>
          <Hot on={[5]} sel={sel}>
            <div className={`mg-board ${live && sel === 5 ? 'is-moving' : ''}`}>
              {['To do', 'Doing', 'Done'].map((col) => (
                <div key={col} className="mg-col">
                  <span className="k-label">{col}</span>
                </div>
              ))}
              <span className="mg-card" style={{ gridColumn: 1, gridRow: 2 }}>Pilot list</span>
              <span className="mg-card" style={{ gridColumn: 1, gridRow: 3 }}>Content plan</span>
              <span className="mg-card mg-card--move" style={{ gridColumn: 2, gridRow: 2 }}>PRD v1</span>
              <span className="mg-card is-done" style={{ gridColumn: 3, gridRow: 2 }}>Competitors</span>
            </div>
          </Hot>
          <Hot on={[6]} sel={sel}>
            <div className="mg-gantt">
              {[
                ['Research', 0, 3],
                ['PRD', 2, 5],
                ['Prototype', 5, 8],
              ].map(([label, s, e], k) => (
                <div key={label as string} className="mg-gantt__row">
                  <span className="mg-gantt__label">{label}</span>
                  <span className="mg-gantt__track">
                    <span
                      className="mg-gantt__bar"
                      style={{ '--s': s, '--e': e, '--i': k } as CSSProperties}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Calendar, inbox and team',
      icon: CalendarDays,
      meta: 'Google Calendar',
      members: [8, 9, 10],
      area: 'd',
      render: ({ sel }) => (
        <>
          <Hot on={[8]} sel={sel}>
            <div className="mg-week">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, k) => (
                <div key={day} className="mg-day">
                  <span className="k-label">{day}</span>
                  {k === 0 && <span className="mg-ev mg-ev--meet">Review</span>}
                  {k === 1 && <span className="mg-ev">PRD v1</span>}
                  {k === 3 && <span className="mg-ev mg-ev--meet">Pilot call</span>}
                  {k === 4 && <span className="mg-ev">Report</span>}
                </div>
              ))}
            </div>
          </Hot>
          <Hot on={[9]} sel={sel}>
            <div className="k-row">
              <span className="k-chips">
                <span className="k-chip">Gmail</span>
                <span className="k-chip">Telegram</span>
                <span className="k-chip">Slack</span>
                <span className="k-chip">WhatsApp</span>
              </span>
            </div>
            <p className="k-muted mg-report">Daily report ready · 7 tasks found in conversations</p>
          </Hot>
          <Hot on={[10]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">KPI</span> <span className="k-grow k-muted">Support · first reply under 2 h</span>
            </div>
            <div className="k-row">
              <span className="k-tag">OKR</span> <span className="k-grow k-muted">MVP · 5 pilots signed</span>
            </div>
          </Hot>
        </>
      ),
    },
  ],
}
