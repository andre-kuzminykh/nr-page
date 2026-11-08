import { Boxes, GitPullRequest, Plug } from 'lucide-react'
import { Hot, Sym } from '../../../components/Kit/Kit'
import type { DepartmentStage } from '../types'

export const development: DepartmentStage = {
  layout: 'top-wide',
  panels: [
    {
      title: 'Pull request 128',
      icon: GitPullRequest,
      meta: 'Stream large exports',
      members: [82, 87, 88, 89, 90],
      area: 'a',
      render: ({ sel }) => (
        <div className="dv-pr">
          <Hot on={[82, 89, 90]} sel={sel} className="dv-diff-wrap">
            <p className="k-mono k-muted dv-file">src/export/exportReport.ts</p>
            <pre className="dv-diff" aria-label="Code change">
              <code>
                <span className="dv-l is-del">
                  <b>-</b> <i className="kw">const</i> pdf = <i className="kw">await</i> <i className="fn">render</i>(report)
                </span>
                <span className="dv-l is-add">
                  <b>+</b> <i className="kw">const</i> stream = <i className="fn">renderStream</i>(report)
                </span>
                <span className="dv-l is-add">
                  <b>+</b> <i className="kw">await</i> <i className="fn">pipeline</i>(stream, <i className="fn">upload</i>(id), {'{'} timeout: <i className="num">60_000</i> {'}'})
                </span>
                <span className="dv-l">
                  <b> </b> <i className="kw">return</i> {'{'} id, status: <i className="str">'ready'</i> {'}'}
                </span>
              </code>
            </pre>
            {sel === 90 && (
              <p className="dv-review">
                <Sym n={90} /> Add a retry for upload errors — the rest looks good.
              </p>
            )}
            {sel === 89 && <p className="dv-review">Extracted renderStream() — behaviour unchanged.</p>}
          </Hot>
          <div className="dv-checks">
            <Hot on={[87]} sel={sel}>
              <div className="k-row">
                <span className="k-dot is-ok" /> <span className="k-grow">Tests</span> <span className="k-mono">128 passed</span>
              </div>
              <div className="k-row">
                <span className="k-dot is-ok" /> <span className="k-grow">New</span> <span className="k-mono">2 added</span>
              </div>
            </Hot>
            <Hot on={[88]} sel={sel}>
              <p className="k-label">Root cause</p>
              <p className="dv-cause">The whole report was held in memory before upload.</p>
            </Hot>
          </div>
        </div>
      ),
    },
    {
      title: 'Codebase',
      icon: Boxes,
      meta: 'Brightline',
      members: [81, 83, 84],
      area: 'b',
      render: ({ sel }) => (
        <>
          <Hot on={[81]} sel={sel}>
            <div className="dv-map" role="img" aria-label="Module map: web, API, worker and database, with the export path affected">
              {['web', 'api', 'worker', 'db'].map((m) => (
                <span key={m} className={`dv-mod ${m === 'api' || m === 'worker' ? 'is-hit' : ''}`}>
                  {m}
                </span>
              ))}
            </div>
          </Hot>
          <Hot on={[83]} sel={sel}>
            <p className="k-mono dv-api">
              <span className="k-tag">POST</span> /reports/:id/export
            </p>
          </Hot>
          <Hot on={[84]} sel={sel}>
            <p className="k-mono dv-api">
              <span className="k-tag">TABLE</span> exports · id · status · size
            </p>
          </Hot>
        </>
      ),
    },
    {
      title: 'AI and integrations',
      icon: Plug,
      meta: 'Events',
      members: [85, 86],
      area: 'c',
      render: ({ sel }) => (
        <>
          <Hot on={[85]} sel={sel}>
            <div className="k-row">
              <span className="k-grow">Summary agent</span>
              <span className="k-tag">AI feature</span>
            </div>
            <div className="k-chips dv-gap">
              <span className="k-chip">sheets.read</span>
              <span className="k-chip">report.write</span>
            </div>
          </Hot>
          <Hot on={[86]} sel={sel}>
            <div className="dv-pipe">
              <span>Sheets</span>
              <i aria-hidden="true" />
              <span>Brightline</span>
              <i aria-hidden="true" />
              <span>Slack</span>
            </div>
          </Hot>
        </>
      ),
    },
  ],
}
