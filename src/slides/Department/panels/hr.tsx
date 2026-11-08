import { HeartHandshake, Radar, UserSearch } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Avatar, Bar, Check, Hot, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const SKILLS = ['UX', 'Motion', 'Copy', 'Data']
// 0 none · 1 basic · 2 strong — per role
const MATRIX: [string, number[]][] = [
  ['Designer', [2, 0, 1, 1]],
  ['Frontend', [1, 0, 0, 2]],
  ['Marketer', [1, 1, 2, 1]],
]

export const hr: DepartmentStage = {
  layout: 'tall-left',
  panels: [
    {
      title: 'Skills map',
      icon: Radar,
      meta: 'Product team',
      members: [11, 19, 20],
      area: 'a',
      render: ({ sel, live }) => (
        <>
          <Hot on={[11]} sel={sel}>
            <p className="k-label">Role</p>
            <p className="hr-role">Motion Designer</p>
            <p className="k-muted hr-resp">
              <Type text="Brings the product to life: onboarding animations, release videos, micro-interactions." play={live && sel === 11} />
            </p>
            <div className="k-chips">
              <span className="k-chip is-on">Motion</span>
              <span className="k-chip">Figma</span>
              <span className="k-chip">After Effects</span>
            </div>
          </Hot>
          <Hot on={[19]} sel={sel}>
            <div className="hr-matrix" role="img" aria-label="Skill matrix: the team has no strong motion skills">
              <span />
              {SKILLS.map((s) => (
                <span key={s} className="k-label hr-matrix__col">
                  {s}
                </span>
              ))}
              {MATRIX.map(([role, levels]) => (
                <span key={role} className="hr-matrix__row">
                  <span className="hr-matrix__role">{role}</span>
                  {levels.map((l, k) => (
                    <span key={k} className={`hr-dot hr-dot--${l} ${k === 1 ? 'is-gap' : ''}`} />
                  ))}
                </span>
              ))}
            </div>
            <div className="hr-decide">
              <span className="k-tag is-warn">Gap · Motion</span>
              <span className="hr-option">
                <span className="k-label">Develop</span>3-week course for the Designer
              </span>
              <span className="hr-option is-pick">
                <span className="k-label">Hire</span>Motion Designer, part-time
              </span>
            </div>
          </Hot>
          <Hot on={[20]} sel={sel}>
            <div className="k-row">
              <span className="k-grow">Q3 review · Designer</span>
              <span className="k-mono">4 / 5 goals</span>
            </div>
            <Bar v={0.8} />
          </Hot>
        </>
      ),
    },
    {
      title: 'Hiring',
      icon: UserSearch,
      meta: 'Motion Designer',
      members: [12, 13, 14],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[12, 13]} sel={sel}>
            <div className="k-row">
              <span className="k-grow k-muted">24 profiles found · screened by CV</span>
            </div>
            <div className="k-list">
              {[
                ['Candidate A', 0.92, 1],
                ['Candidate B', 0.81, 3],
                ['Candidate C', 0.64, 5],
              ].map(([name, v, h]) => (
                <div key={name as string} className="k-row">
                  <Avatar name={name as string} hue={h as number} />
                  <span className="hr-cand">{name}</span>
                  <Bar v={v as number} />
                  <span className="k-mono">{Math.round((v as number) * 100)}%</span>
                </div>
              ))}
            </div>
          </Hot>
          <Hot on={[14]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">Interview</span>
              <span className="k-grow">Structured · 6 questions · scorecard</span>
            </div>
          </Hot>
        </>
      ),
    },
    {
      title: 'People',
      icon: HeartHandshake,
      meta: 'This week',
      members: [15, 16, 17, 18],
      area: 'c',
      render: ({ sel }) => (
        <div className="k-list">
          <Hot on={[15]} sel={sel}>
            <div className="k-row">
              <Check done /> <span className="k-grow">Onboarding · accounts and first task</span>
              <span className="k-mono">Day 2</span>
            </div>
          </Hot>
          <Hot on={[16]} sel={sel}>
            <div className="k-row">
              <span className="k-grow k-muted">“How do I book a vacation?” — answered</span>
            </div>
          </Hot>
          <Hot on={[17]} sel={sel}>
            <div className="hr-load">
              {[0.6, 0.9, 1.18, 0.75].map((v, k) => (
                <span key={k} className={`hr-load__bar ${v > 1 ? 'is-over' : ''}`} style={{ '--v': Math.min(v, 1.2) / 1.2 } as CSSProperties} />
              ))}
              <span className="k-mono k-muted">Workload</span>
            </div>
          </Hot>
          <Hot on={[18]} sel={sel}>
            <div className="k-row">
              <span className="k-tag is-warn">118%</span>
              <span className="k-grow k-muted">Frontend overloaded — suggest rebalancing</span>
            </div>
          </Hot>
        </div>
      ),
    },
  ],
}
