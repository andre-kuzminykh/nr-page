import { FileSearch, FileText, Scale } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Hot, Spark } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const DOCS = {
  PRD: ['Goal · reports in under 15 minutes', 'Users · agency account managers', 'Must · Sheets and Looker import', 'Success · 5 pilots weekly active'],
  BRD: ['Process · Monday client reporting', 'Policy · client data stays in EU', 'Owner · Head of Delivery', 'Accept · signed off by 3 pilots'],
  TRD: ['API · import jobs, 60 s timeout', 'Data · 50 MB per report', 'Security · SSO and audit log', 'Latency · p95 under 2 s'],
} as const
type Doc = keyof typeof DOCS
const docFor = (sel: number): Doc => (sel === 64 ? 'BRD' : sel === 65 ? 'TRD' : 'PRD')

export const analytics: DepartmentStage = {
  layout: 'tall-right',
  panels: [
    {
      title: 'Deep research',
      icon: FileSearch,
      meta: '12 sources',
      members: [61, 62],
      area: 'a',
      render: ({ sel }) => (
        <>
          <Hot on={[61]} sel={sel}>
            <ul className="an-findings">
              <li>
                Interviewed agencies lose most of Monday to reports <sup>1</sup>
              </li>
              <li>
                Their reports usually start in spreadsheets <sup>2</sup>
              </li>
            </ul>
            <div className="k-chips">
              <span className="k-chip">Interviews · 9</span>
              <span className="k-chip">Industry report</span>
            </div>
          </Hot>
          <Hot on={[62]} sel={sel}>
            <div className="an-flow">
              <span className="an-flow__box">
                <span className="k-label">Today</span>6 h by hand
              </span>
              <span className="an-flow__arrow" aria-hidden="true" />
              <span className="an-flow__box is-to">
                <span className="k-label">Target</span>15 min
              </span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Decide',
      icon: Scale,
      meta: 'Pilot pricing',
      members: [67, 68, 70],
      area: 'b',
      render: ({ sel }) => (
        <>
          <div className="an-decide">
            <Hot on={[68]} sel={sel} className="an-decide__chart">
              <p className="k-label">Activation</p>
              <Spark values={[12, 14, 13, 18, 22, 21, 27, 31]} />
            </Hot>
            <Hot on={[67]} sel={sel} className="an-decide__risk">
              <div className="an-risk" role="img" aria-label="Risk matrix">
                {Array.from({ length: 9 }, (_, k) => (
                  <span key={k} className={`an-risk__cell ${[2, 4].includes(k) ? 'is-mid' : ''} ${k === 2 ? 'is-risk' : ''}`} />
                ))}
              </div>
            </Hot>
          </div>
          <Hot on={[70]} sel={sel}>
            <div className="an-options">
              <span className="an-opt">
                <span className="k-label">A</span>Free pilot
              </span>
              <span className="an-opt is-pick">
                <span className="k-label">B · recommended</span>Paid pilot, 50% off
              </span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Requirements',
      icon: FileText,
      meta: 'Mobile App',
      members: [63, 64, 65, 66, 69],
      area: 'c',
      render: ({ sel }) => {
        const doc = docFor(sel)
        return (
          <>
            <Hot on={[63, 64, 65]} sel={sel}>
              <div className="an-tabs" role="presentation">
                {(Object.keys(DOCS) as Doc[]).map((k) => (
                  <span key={k} className={`an-tab ${k === doc ? 'is-on' : ''}`}>
                    {k}
                  </span>
                ))}
              </div>
              <ul key={doc} className="an-doc">
                {DOCS[doc].map((line, k) => (
                  <li key={line} className="k-in" style={{ '--i': k } as CSSProperties}>
                    {line}
                  </li>
                ))}
              </ul>
            </Hot>
            <Hot on={[66]} sel={sel}>
              <p className="k-label">Backlog</p>
              <div className="k-list">
                {[
                  ['IMP-1', 'Import from Google Sheets', '5'],
                  ['REP-4', 'Export report to PDF', '3'],
                  ['AUT-2', 'Sign in with Google', '2'],
                ].map(([id, t, pts]) => (
                  <div key={id} className="k-row">
                    <span className="k-mono k-muted">{id}</span>
                    <span className="k-grow">{t}</span>
                    <span className="k-tag">{pts} pts</span>
                  </div>
                ))}
              </div>
            </Hot>
            <Hot on={[69]} sel={sel}>
              <div className="k-row">
                <span className="k-tag">Report</span>
                <span className="k-grow k-muted">Weekly product report · 4 charts</span>
              </div>
            </Hot>
          </>
        )
      },
    },
  ],
}
