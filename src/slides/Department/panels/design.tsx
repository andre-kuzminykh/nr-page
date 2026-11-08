import { Palette, Route, Smartphone } from 'lucide-react'
import { Hot } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

export const design: DepartmentStage = {
  layout: 'tall-left',
  panels: [
    {
      title: 'Prototype',
      icon: Smartphone,
      meta: '6 screens',
      members: [78, 79, 80],
      area: 'a',
      render: ({ sel, live }) => (
        <div className="ds-proto">
          <Hot on={[78]} sel={sel} className="ds-proto__phone-wrap">
            <div className="ds-phone" role="img" aria-label="Phone prototype showing a list of reports">
              <span className="ds-phone__bar" />
              <span className="ds-phone__title">Reports</span>
              {['Northwind · Monday', 'Acme · Monthly', 'Globex · Q3'].map((t, k) => (
                <span key={t} className={`ds-phone__card ${k === 0 ? 'is-hot' : ''}`}>
                  {t}
                </span>
              ))}
              <span className="ds-phone__btn">Export</span>
              {live && <span className="ds-tap" />}
            </div>
          </Hot>
          <div className="ds-proto__side">
            <Hot on={[79]} sel={sel}>
              <p className="k-label">Simulated users</p>
              <div className="k-list">
                <div className="k-row">
                  <span className="k-dot is-ok" /> <span className="k-grow">Account manager</span> <span className="k-mono">2:10</span>
                </div>
                <div className="k-row">
                  <span className="k-dot" style={{ background: '#f9894b' }} /> <span className="k-grow">New client</span> <span className="k-mono">stuck</span>
                </div>
                <div className="k-row">
                  <span className="k-dot is-ok" /> <span className="k-grow">Agency owner</span> <span className="k-mono">1:45</span>
                </div>
              </div>
            </Hot>
            <Hot on={[80]} sel={sel}>
              <div className="k-row">
                <span className="k-tag is-warn">High</span>
                <span className="k-grow k-muted">Export is hard to find</span>
              </div>
              <p className="k-mono k-muted ds-fix">Move to the report header</p>
            </Hot>
          </div>
        </div>
      ),
    },
    {
      title: 'Design system',
      icon: Palette,
      meta: 'Brightline',
      members: [71, 72],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[71]} sel={sel}>
            <div className="ds-dirs">
              {['A', 'B', 'C'].map((l, k) => (
                <span key={l} className={`ds-dir ds-dir--${k} ${k === 1 ? 'is-pick' : ''}`}>
                  {l}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[72]} sel={sel}>
            <div className="k-row ds-tokens">
              {['#16132a', '#7c5cff', '#c9b5ff', '#ffb36b', '#f4f1ff'].map((c) => (
                <span key={c} className="ds-swatch" style={{ background: c }} />
              ))}
              <span className="ds-scale">
                <b>Aa</b>
                <span>Aa</span>
                <small>Aa</small>
              </span>
            </div>
            <div className="k-row ds-comps">
              <span className="ds-btn">Get report</span>
              <span className="ds-input">client@agency.com</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Flows and pages',
      icon: Route,
      meta: 'Onboarding',
      members: [73, 74, 75, 76, 77],
      area: 'c',
      render: ({ sel }) => (
        <>
          <Hot on={[75, 76]} sel={sel}>
            <div className="ds-flow">
              {['Sign up', 'Connect data', 'First report'].map((s, k) => (
                <span key={s} className="ds-flow__node">
                  {k > 0 && <span className="ds-flow__line" aria-hidden="true" />}
                  {s}
                </span>
              ))}
            </div>
          </Hot>
          <div className="ds-thumbs">
            <Hot on={[74]} sel={sel} className="ds-thumb">
              <span className="ds-wire ds-wire--hero" />
              <span className="ds-wire" />
              <span className="ds-wire ds-wire--short" />
              <span className="k-label">Landing</span>
            </Hot>
            <Hot on={[73]} sel={sel} className="ds-thumb">
              <span className="ds-slide" />
              <span className="k-label">Deck</span>
            </Hot>
            <Hot on={[77]} sel={sel} className="ds-thumb">
              <span className="ds-ui">
                <i />
                <i />
                <i />
              </span>
              <span className="k-label">UI</span>
            </Hot>
          </div>
        </>
      ),
    },
  ],
}
