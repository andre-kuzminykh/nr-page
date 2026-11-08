import { LayoutGrid, Play, Send, WandSparkles } from 'lucide-react'
import { Bars, Hot, Type } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

const CH = { blog: 'Blog', tg: 'Telegram', li: 'LinkedIn', ig: 'Instagram' } as const
type Ch = keyof typeof CH
const WEEK: [string, Ch[]][] = [
  ['Mon', ['li', 'tg']],
  ['Tue', ['ig']],
  ['Wed', ['blog', 'li']],
  ['Thu', ['ig', 'tg']],
  ['Fri', ['li']],
  ['Sat', ['ig']],
  ['Sun', []],
]

export const smm: DepartmentStage = {
  layout: 'top-wide',
  panels: [
    {
      title: 'Content plan',
      icon: LayoutGrid,
      meta: 'Week 46',
      members: [31, 32, 33],
      area: 'a',
      render: ({ sel }) => (
        <div className="sm-plan">
          <Hot on={[32]} sel={sel} className="sm-plan__week">
            <div className="sm-week">
              {WEEK.map(([day, posts]) => (
                <div key={day} className="sm-day">
                  <span className="k-label">{day}</span>
                  {posts.map((p, k) => (
                    <span key={k} className={`sm-post sm-post--${p}`}>
                      {CH[p]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Hot>
          <div className="sm-plan__side">
            <Hot on={[31]} sel={sel}>
              <p className="k-label">Engagement by channel</p>
              <Bars values={[42, 68, 35, 80]} labels={['Blog', 'TG', 'LI', 'IG']} />
            </Hot>
            <Hot on={[33]} sel={sel}>
              <div className="k-row">
                <span className="k-tag">Blog</span>
                <span className="k-grow">How agencies win back a day a week</span>
              </div>
            </Hot>
          </div>
        </div>
      ),
    },
    {
      title: 'Studio',
      icon: WandSparkles,
      meta: 'Instagram post',
      members: [34, 35, 36, 37],
      area: 'b',
      render: ({ sel, live }) => (
        <>
          <Hot on={[35, 36]} sel={sel}>
            <div className={`sm-art ${sel === 36 ? 'is-video' : ''}`} role="img" aria-label="Generated visual for the post">
              <span className="sm-art__glow" />
              <span className="sm-art__title">Reports in minutes</span>
              {sel === 36 && (
                <span className="sm-art__play">
                  <Play size={14} strokeWidth={2} fill="currentColor" />
                </span>
              )}
            </div>
          </Hot>
          <Hot on={[37]} sel={sel}>
            <div className="sm-clips" aria-hidden="true">
              <span style={{ flex: 3 }} />
              <span style={{ flex: 2 }} />
              <span style={{ flex: 4 }} />
              <span style={{ flex: 1.5 }} />
              <i className="sm-clips__head" />
            </div>
          </Hot>
          <Hot on={[34]} sel={sel}>
            <p className="sm-caption">
              <Type text="Your clients want answers, not spreadsheets. Here’s how we ship reports in minutes →" play={live && sel === 34} speed={18} />
            </p>
          </Hot>
        </>
      ),
    },
    {
      title: 'Publish and listen',
      icon: Send,
      meta: '3 channels',
      members: [38, 39, 40],
      area: 'c',
      render: ({ sel }) => (
        <>
          <Hot on={[38]} sel={sel}>
            <div className="k-list">
              {[
                ['Today 10:00', 'LinkedIn', true],
                ['Today 18:30', 'Instagram', false],
                ['Tue 09:00', 'Telegram', false],
              ].map(([t, c, done]) => (
                <div key={t as string} className="k-row">
                  <span className={`k-dot ${done ? 'is-ok' : ''}`} />
                  <span className="k-mono k-muted">{t}</span>
                  <span className="k-grow">{c}</span>
                </div>
              ))}
            </div>
          </Hot>
          <Hot on={[39]} sel={sel}>
            <p className="sm-comment">
              <span className="k-muted">“Does it work with Google Sheets?”</span>
              <span className="sm-reply">Yes — connect a sheet and the report updates itself.</span>
            </p>
          </Hot>
          <Hot on={[40]} sel={sel}>
            <div className="k-row">
              <span className="k-tag">Insight</span>
              <span className="k-grow k-muted">Carousels get the most saves this week</span>
            </div>
          </Hot>
        </>
      ),
    },
  ],
}
