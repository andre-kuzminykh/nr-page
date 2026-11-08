import { Bug, Inbox, Ticket } from 'lucide-react'
import { Bars, Hot, Sym, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

export const support: DepartmentStage = {
  layout: 'tall-left',
  panels: [
    {
      title: 'Inbox',
      icon: Inbox,
      meta: 'Email · web · messengers',
      members: [51, 52, 53, 54],
      area: 'a',
      render: ({ sel, live }) => (
        <>
          <div className="k-list sp-threads">
            <Hot on={[52]} sel={sel}>
              <div className="k-row">
                <span className="k-tag">Email</span>
                <span className="k-grow">How do I export a report to PDF?</span>
                <span className="k-mono k-muted">2m</span>
              </div>
            </Hot>
            <Hot on={[53]} sel={sel}>
              <div className="k-row">
                <span className="k-tag">Web</span>
                <span className="k-grow">Can I invite my client as a viewer?</span>
                <span className="k-mono k-muted">6m</span>
              </div>
            </Hot>
            <Hot on={[54]} sel={sel}>
              <div className="k-row">
                <span className="k-tag">Telegram</span>
                <span className="k-grow">Sync stopped after password change</span>
                <span className="k-mono k-muted">9m</span>
              </div>
              <div className="k-row">
                <span className="k-tag">WhatsApp</span>
                <span className="k-grow">Where do I find invoices?</span>
                <span className="k-mono k-muted">14m</span>
              </div>
            </Hot>
          </div>
          <Hot on={[51]} sel={sel}>
            <p className="k-label">Answer · from verified knowledge</p>
            <p className="sp-answer">
              <Type
                text="Open the report, choose Share → Export, then PDF. Large reports arrive by email within a minute."
                play={live && (sel === 51 || sel === 52)}
                speed={16}
              />
            </p>
            <span className="k-chip">Help center · Export</span>
          </Hot>
        </>
      ),
    },
    {
      title: 'Ticket 2481',
      icon: Ticket,
      meta: 'Sync stopped',
      members: [55, 56, 59],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[56]} sel={sel}>
            <div className="k-chips">
              <span className="k-chip is-on">Intent · Access</span>
              <span className="k-chip is-on">Urgency · High</span>
              <span className="k-chip">Route · Tech</span>
            </div>
          </Hot>
          <Hot on={[55]} sel={sel}>
            <div className="sp-states">
              {['Open', 'Assigned', 'Waiting', 'Resolved'].map((s, k) => (
                <span key={s} className={`sp-state ${k <= 1 ? 'is-done' : ''} ${k === 1 ? 'is-now' : ''}`}>
                  {s}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[59]} sel={sel}>
            <div className="k-row">
              <span className="k-tag is-warn">2nd line</span>
              <span className="k-grow k-muted">Tech lead · reply within 2 h</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Into the product',
      icon: Bug,
      meta: 'Tasks for Management',
      members: [57, 58, 60],
      area: 'c',
      render: ({ sel }) => (
        <>
          <Hot on={[57]} sel={sel}>
            <div className="k-row">
              <span className="k-tag is-warn">Bug</span>
              <span className="k-grow">Export fails above 50 pages</span>
            </div>
            <p className="k-mono k-muted sp-steps">1 Open report · 2 Export PDF · 3 Timeout</p>
          </Hot>
          <Hot on={[58]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">Idea</span>
              <span className="k-grow">Scheduled exports</span>
              <span className="k-mono k-muted">12 asked</span>
            </div>
          </Hot>
          <Hot on={[60]} sel={sel}>
            <Bars values={[34, 21, 14, 9]} labels={['Export', 'Access', 'Billing', 'Sync']} />
          </Hot>
          <div className="k-row sp-handoff">
            <Sym n={4} />
            <span className="k-grow k-muted">New tasks in Task Management</span>
          </div>
        </>
      ),
    },
  ],
}
