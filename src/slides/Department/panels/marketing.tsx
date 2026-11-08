import { Lightbulb, Map, Quote } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Hot, Spark, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const DOTS: [string, number, number][] = [
  ['A', 22, 30],
  ['B', 70, 24],
  ['C', 58, 66],
  ['D', 30, 74],
]

export const marketing: DepartmentStage = {
  layout: 'tall-right',
  panels: [
    {
      title: 'Market map',
      icon: Map,
      meta: 'AI tools for agencies',
      members: [21, 22],
      area: 'a',
      render: ({ sel }) => (
        <>
          <Hot on={[21]} sel={sel}>
            <div className="mk-map" role="img" aria-label="Positioning map with four competitors and an open opportunity">
              <span className="mk-map__ax mk-map__ax--x k-label">Price →</span>
              <span className="mk-map__ax mk-map__ax--y k-label">Depth →</span>
              <span className="mk-map__gap">Opportunity</span>
              {DOTS.map(([l, x, y], k) => (
                <span key={l} className="mk-map__dot" style={{ left: `${x}%`, top: `${y}%`, '--i': k } as CSSProperties}>
                  {l}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[22]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">B</span>
              <span className="k-grow k-muted">Changed pricing · new free plan</span>
              <span className="k-mono">2d</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Customers',
      icon: Quote,
      meta: 'Small agencies',
      members: [23, 28, 30],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[23, 30]} sel={sel}>
            <p className="mk-quote">“We lose a day every week on client reports.”</p>
            <div className="k-chips">
              <span className="k-chip is-on">Pain · 14 mentions</span>
              <span className="k-chip">5–20 people</span>
            </div>
          </Hot>
          <Hot on={[28]} sel={sel}>
            <div className="mk-journey">
              {['Aware', 'Consider', 'Buy', 'Use'].map((s, k) => (
                <span key={s} className={`mk-step ${k === 2 ? 'is-friction' : ''}`}>
                  {s}
                </span>
              ))}
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Product concept',
      icon: Lightbulb,
      meta: 'v1',
      members: [24, 25, 26, 27, 29],
      area: 'c',
      render: ({ sel, live }) => (
        <>
          <Hot on={[24]} sel={sel}>
            <p className="k-label">Positioning</p>
            <p className="mk-statement">
              <Type
                text="For small agencies who lose time on reporting, Brightline turns client data into ready reports in minutes."
                play={live && sel === 24}
                speed={16}
              />
            </p>
          </Hot>
          <Hot on={[25]} sel={sel}>
            <div className="mk-model">
              <span>
                <span className="k-label">Value</span>Reports in minutes
              </span>
              <span>
                <span className="k-label">Channel</span>Agency partners
              </span>
              <span>
                <span className="k-label">Revenue</span>Per seat
              </span>
            </div>
          </Hot>
          <Hot on={[26]} sel={sel}>
            <div className="k-row mk-brand">
              <span className="mk-sw" style={{ background: '#1d1a3a' }} />
              <span className="mk-sw" style={{ background: '#7c5cff' }} />
              <span className="mk-sw" style={{ background: '#ffb36b' }} />
              <span className="mk-aa">Aa</span>
              <span className="k-grow k-muted">Clear · warm · expert</span>
            </div>
          </Hot>
          <Hot on={[27]} sel={sel}>
            <div className="mk-gtm">
              {[
                ['Pilot', 'Nov'],
                ['Launch', 'Jan'],
                ['Partners', 'Mar'],
              ].map(([s, m]) => (
                <span key={s} className="mk-gtm__step">
                  <span className="k-dot" />
                  {s}
                  <span className="k-mono k-muted">{m}</span>
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[29]} sel={sel}>
            <div className="k-row">
              <span className="k-grow k-muted">Sign-ups per week</span>
            </div>
            <Spark values={[3, 4, 4, 6, 5, 8, 9, 12, 11, 15]} />
          </Hot>
        </>
      ),
    },
  ],
}
