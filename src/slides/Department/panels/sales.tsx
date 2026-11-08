import { Briefcase, Funnel, Mail, MessagesSquare } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Bar, Hot, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const FUNNEL: [string, number][] = [
  ['Contacts', 312],
  ['Sent', 280],
  ['Replies', 41],
  ['Qualified', 18],
  ['Meetings', 9],
  ['Purchases', 3],
]

export const sales: DepartmentStage = {
  layout: 'quad',
  panels: [
    {
      title: 'Offers and audience',
      icon: Briefcase,
      meta: 'Apollo',
      members: [41, 42, 43],
      area: 'a',
      render: ({ sel }) => (
        <>
          <Hot on={[41]} sel={sel}>
            <div className="k-row sl-product-row">
              <span className="sl-product">Brightline Pro</span>
              <span className="k-grow" />
              <span className="k-mono">€49 / seat</span>
            </div>
            <div className="k-chips sl-gap">
              <span className="k-chip is-on">Small agencies</span>
              <span className="k-chip">Case · 2 days saved</span>
              <span className="k-chip">FAQ · 6</span>
            </div>
          </Hot>
          <Hot on={[42]} sel={sel}>
            <div className="k-chips">
              <span className="k-chip">Agencies</span>
              <span className="k-chip">5–50 people</span>
              <span className="k-chip">EU</span>
            </div>
            <p className="k-muted sl-note">312 companies · 18 duplicates removed</p>
          </Hot>
          <Hot on={[43]} sel={sel}>
            <p className="sl-fact">
              Northwind Studio builds client reports in Sheets every Monday.
              <span className="k-mono k-muted"> Source · website</span>
            </p>
          </Hot>
        </>
      ),
    },
    {
      title: 'Sequence',
      icon: Mail,
      meta: 'Northwind Studio',
      members: [44, 45],
      area: 'b',
      render: ({ sel, live }) => (
        <>
          <Hot on={[44]} sel={sel}>
            <div className="sl-seq">
              <span className="k-tag">Day 0</span>
              <span className="sl-subject">
                <Type text="Your Monday reports, done by 9:00" play={live && sel === 44} speed={28} />
              </span>
            </div>
            <div className="sl-seq is-next">
              <span className="k-tag">Day 3</span>
              <span className="k-muted">Follow-up · a 2-minute example</span>
            </div>
            <div className="sl-seq is-next">
              <span className="k-tag">Day 7</span>
              <span className="k-muted">Last touch · case study</span>
            </div>
          </Hot>
          <Hot on={[45]} sel={sel}>
            <div className="k-row">
              <span className="k-dot is-ok" />
              <span className="k-grow k-muted">3 mailboxes · stops on reply, unsubscribe or bounce</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Conversations',
      icon: MessagesSquare,
      meta: 'Email · Telegram · WhatsApp',
      members: [46, 48],
      area: 'c',
      render: ({ sel, live }) => (
        <>
          <Hot on={[46]} sel={sel}>
            <div className="sl-chat">
              <p className="sl-msg">Sounds good, but we already use Looker.</p>
              <p className="sl-msg is-ai">Brightline reads Looker exports too. Shall I share three slots for a 15-minute demo?</p>
            </div>
            <span className="k-chip sl-hand">Hand over to you</span>
          </Hot>
          <Hot on={[48]} sel={sel}>
            <p className="k-label">LinkedIn · you send it</p>
            <p className="sl-li">
              <Type text="Thanks for the reply — happy to show how agencies cut reporting to minutes. Free on Thursday?" play={live && sel === 48} speed={18} />
            </p>
          </Hot>
        </>
      ),
    },
    {
      title: 'Qualify, book, measure',
      icon: Funnel,
      meta: 'This month',
      members: [47, 49, 50],
      area: 'd',
      render: ({ sel }) => (
        <>
          <Hot on={[47]} sel={sel}>
            <div className="sl-classes">
              <span className="sl-class is-match">
                Small business <span className="k-muted">→ Starter</span>
              </span>
              <span className="sl-class">
                Medium business <span className="k-muted">→ Pro</span>
              </span>
            </div>
          </Hot>
          <Hot on={[49]} sel={sel}>
            <div className="sl-slots">
              {['Tue 10:00', 'Tue 14:30', 'Wed 11:00'].map((s, k) => (
                <span key={s} className={`sl-slot ${k === 1 ? 'is-booked' : ''}`}>
                  {s}
                </span>
              ))}
              <span className="k-mono k-muted">Google Meet</span>
            </div>
          </Hot>
          <Hot on={[50]} sel={sel}>
            <div className="sl-funnel">
              {FUNNEL.map(([label, v], k) => (
                <span key={label} className="sl-funnel__row" style={{ '--i': k } as CSSProperties}>
                  <span className="sl-funnel__label">{label}</span>
                  <Bar v={v / FUNNEL[0][1]} />
                  <span className="k-mono">{v}</span>
                </span>
              ))}
            </div>
          </Hot>
        </>
      ),
    },
  ],
}
