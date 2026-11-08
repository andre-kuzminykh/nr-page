import { Activity, Rocket, ShieldCheck, Siren } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Check, Hot, Spark } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const ROLES = ['Admin', 'Developer', 'Support']
const RES = ['Prod', 'Staging', 'Billing']
const GRANTS = [
  [1, 1, 1],
  [0, 1, 0],
  [0, 0, 1],
]

export const engineering: DepartmentStage = {
  layout: 'quad',
  panels: [
    {
      title: 'Pipeline',
      icon: Rocket,
      meta: 'main → production',
      members: [97, 92, 93],
      area: 'a',
      render: ({ sel, live }) => (
        <>
          <Hot on={[97]} sel={sel}>
            <div className={`en-stages ${live && sel === 97 ? 'is-run' : 'is-done'}`}>
              {['Build', 'Test', 'Scan', 'Deploy'].map((s, k) => (
                <span key={s} className="en-stage" style={{ '--i': k } as CSSProperties}>
                  <span className="en-stage__dot" />
                  {s}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[92]} sel={sel}>
            <p className="k-mono en-iac">
              <span className="k-tag">IaC</span> plan · 3 to add · 0 to destroy
            </p>
          </Hot>
          <Hot on={[93]} sel={sel}>
            <div className="k-chips">
              <span className="k-chip is-on">staging · v2.4.1</span>
              <span className="k-chip is-on">production · v2.4.0</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Access and security',
      icon: ShieldCheck,
      meta: 'Least privilege',
      members: [91, 94, 95],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[91]} sel={sel}>
            <div className="en-acl" role="img" aria-label="Access matrix of roles and resources">
              <span />
              {RES.map((r) => (
                <span key={r} className="k-label en-acl__col">
                  {r}
                </span>
              ))}
              {ROLES.map((role, ri) => (
                <span key={role} className="en-acl__row">
                  <span className="en-acl__role">{role}</span>
                  {GRANTS[ri].map((g, k) => (
                    <span key={k} className={`en-acl__cell ${g ? 'is-on' : ''}`} />
                  ))}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[94]} sel={sel}>
            <div className="k-row">
              <Check done /> <span className="k-grow">Secrets rotated</span> <span className="k-mono k-muted">2d ago</span>
            </div>
          </Hot>
          <Hot on={[95]} sel={sel}>
            <div className="k-row">
              <span className="k-dot is-ok" /> <span className="k-grow k-muted">Private network · 2 public ports</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Health',
      icon: Activity,
      meta: 'Last 24 h',
      members: [99, 96],
      area: 'c',
      render: ({ sel }) => (
        <>
          <Hot on={[99]} sel={sel}>
            <div className="k-row">
              <span className="k-dot is-ok" /> <span className="k-grow">All services healthy</span>
              <span className="k-mono">5 / 5</span>
            </div>
            <Spark values={[38, 40, 36, 41, 39, 72, 44, 37, 36, 35, 38, 36]} />
          </Hot>
          <Hot on={[96]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">p95</span>
              <span className="k-grow k-muted">Export API · 210 ms after fix</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'Recovery and incidents',
      icon: Siren,
      meta: 'On call',
      members: [98, 100],
      area: 'd',
      render: ({ sel }) => (
        <>
          <Hot on={[98]} sel={sel}>
            <div className="k-row">
              <Check done /> <span className="k-grow">Nightly backup · 02:00</span>
            </div>
            <div className="k-row en-gap">
              <Check done /> <span className="k-grow k-muted">Restore tested this week</span>
            </div>
          </Hot>
          <Hot on={[100]} sel={sel}>
            <div className="k-row">
              <span className="k-tag is-ok">Resolved</span>
              <span className="k-grow">Latency spike on exports</span>
            </div>
            <div className="en-timeline">
              {['Detected', 'Triaged', 'Fixed', 'Postmortem'].map((s, k) => (
                <span key={s} className="en-tl" style={{ '--i': k } as CSSProperties}>
                  {s}
                </span>
              ))}
            </div>
          </Hot>
        </>
      ),
    },
  ],
}
