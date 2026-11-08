import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import aitLogo from '../assets/ait-logo.png'
import { BrandIcon } from '../components/Brand/BrandIcon'
import { Prompt } from '../components/Prompt/Prompt'
import { useDemo } from '../components/Prompt/useDemo'
import { useDeck, type SlideProps } from '../components/SlideController/DeckContext'
import { COMPANY_URL, KM_URL, PRIVACY_URL, SOCIAL, TERMS_URL, kmHref } from '../config/links'
import '../slides/Final/Final.css'
import { PIPELINE, SCENARIOS, USE_CASES, VIEWERS } from './content'
import { KnowledgeGraph } from './KnowledgeGraph'
import { ReportDemo } from './ReportDemo'
import './km.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const ext = { target: '_blank', rel: 'noreferrer' } as const

/** A block's title: its lines rise through their masks, as on the landing. */
function Title({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <h2 className={`h2 kd-title ${className}`}>
      {lines.map((line, k) => (
        <span key={k} className="mask" style={d(40 + k * 80)}>
          <span>{line}</span>
        </span>
      ))}
    </h2>
  )
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="kd-kicker rv" style={d(0)}>
      {children}
    </p>
  )
}

/* ---------- 01 · the name, and the bar ---------- */
export function KmOverview({ active, shown }: SlideProps) {
  const { reducedMotion, goTo } = useDeck()
  const live = active && !reducedMotion
  const asks = SCENARIOS.map((s) => s.query)
  const demo = useDemo(asks.length, { live, shown, after: 1400 })
  return (
    <div className="slide__frame kd kd--overview">
      <Kicker>Neuronium · AI employee</Kicker>
      <h1 className="kd-h1">
        {['AI Knowledge', 'Management'].map((line, k) => (
          <span key={k} className="mask" style={d(80 + k * 90)}>
            <span>{line}</span>
          </span>
        ))}
      </h1>
      <p className="kd-lead rv" style={d(380)}>
        Ask about goals, tasks, people or money in plain words. Get a report with figures, findings and sources, ready to print.
      </p>
      <div className="kd-hero-bar rv" style={d(520)}>
        <Prompt
          {...demo.bar}
          label="Ask Knowledge Management"
          placeholder="Ask anything about your company"
          href={kmHref}
          text={asks[demo.k]}
          live={live}
          delay={demo.k === 0 ? 1600 : 500}
        />
      </div>
      <p className="kd-note rv" style={d(640)}>
        Ask in English or Russian; the report comes back in the same language.
      </p>
      <button type="button" className="more kd-more rv" style={d(760)} onClick={() => goTo('report')}>
        See a report being written
        <ArrowDown size={16} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  )
}

/* ---------- 02 · the report generator ---------- */
export function KmReport({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  return (
    <div className="slide__frame kd kd--report">
      <div className="kd-report__text">
        <Kicker>The report generator</Kicker>
        <Title lines={['Ask a question.', 'Get a report.']} />
        <ul className="kd-anatomy rv" style={d(300)}>
          {['Summary', 'Key figures', 'Chart against plan', 'Findings: calculated, confirmed or hypothesis', 'Limitations', 'Numbered sources'].map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div className="kd-report__demo rv" style={d(200)}>
        {shown && <ReportDemo live={active && !reducedMotion} />}
      </div>
    </div>
  )
}

/* ---------- 03 · how it works ---------- */
export function KmHow(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--how">
      <Kicker>How it works</Kicker>
      <Title lines={['How a report gets built']} />
      <p className="kd-lead rv" style={d(260)}>
        Five steps from your question to a sourced report.
      </p>
      <ol className="kp-pipe">
        <span className="kp-pipe__line rv rv--fade" style={d(400)} aria-hidden="true">
          <i />
        </span>
        {PIPELINE.map((p, i) => (
          <li key={p.n} className="rv" style={{ ...d(380 + i * 110), '--k': i } as CSSProperties}>
            <span className="kp-pipe__n">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ---------- 04 · three principles ---------- */
export function KmRules(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--rules">
      <Kicker>Three principles</Kicker>
      <Title lines={['A report you can check']} />
      <div className="kp-rules">
        <article className="kp-card rv" style={d(300)}>
          <div className="kp-card__art kp-badges" aria-hidden="true">
            <span className="kr-badge is-confirmed">Confirmed</span>
            <span className="kr-badge is-calculated">Calculated</span>
            <span className="kr-badge is-hypothesis">Hypothesis</span>
            <span className="kr-cites">
              <i>c1</i>
              <i>c2</i>
            </span>
          </div>
          <h3>Every claim is labelled</h3>
          <p>Confirmed: a stored record, linked to its field. Calculated: by a named rule. Hypothesis: found in text. Every confirmed claim points to its source.</p>
        </article>
        <article className="kp-card rv" style={d(420)}>
          <div className="kp-card__art kp-nodata" aria-hidden="true">
            <span className="kp-nodata__v">—</span>
            <span className="kp-nodata__l">Profit · Finance module not connected</span>
          </div>
          <h3>When data is missing, it says so</h3>
          <p>A missing module, record, link or measurement becomes a limitation with its reason. Money is summed per currency and never replaced by a count of something else.</p>
        </article>
        <article className="kp-card rv" style={d(540)}>
          <div className="kp-card__art kp-same" aria-hidden="true">
            <span className="kp-same__doc" />
            <span className="kp-same__eq">=</span>
            <span className="kp-same__doc" />
          </div>
          <h3>Same question, same report</h3>
          <p>The same data and the same request always give the same report, so a figure can be checked, compared and trusted.</p>
        </article>
      </div>
    </div>
  )
}

/* ---------- 05 · the knowledge graph ---------- */
export function KmGraph({ active }: SlideProps) {
  const { reducedMotion } = useDeck()
  return (
    <div className="slide__frame kd kd--graph">
      <div className="kd-graph__text">
        <Kicker>The company knowledge graph</Kicker>
        <Title lines={['Your company as', 'connected records']} />
        <p className="kd-lead rv" style={d(260)}>
          Goals, tasks, people, processes, bookings and money: each a record with its type, joined by typed links. One person is one record, so “AM” on the board and the account AM are both Alex Mercer.
        </p>
        <p className="kp-graph__legend rv" style={d(380)}>
          <span className="is-link">stored link</span>
          <span className="is-hyp">hypothesis: a name found in text</span>
          <span className="is-walk">the walk a question takes</span>
        </p>
      </div>
      <div className="kp-graph rv" style={d(200)}>
        <KnowledgeGraph on={active && !reducedMotion} />
      </div>
    </div>
  )
}

/* ---------- 06 · access ---------- */
export function KmAccess(_: SlideProps) {
  const [viewer, setViewer] = useState(VIEWERS[0].id)
  const who = VIEWERS.find((x) => x.id === viewer)!
  return (
    <div className="slide__frame kd kd--access">
      <Kicker>Access</Kicker>
      <Title lines={['Each reader sees', 'only their part']} />
      <p className="kd-lead rv" style={d(260)}>
        Rights are given to a person, a team or a role. What is outside them never enters the reader’s graph: it cannot be found, counted or quoted.
      </p>
      <div className="kp-access rv" style={d(380)}>
        <div className="kp-viewers" role="radiogroup" aria-label="Viewing as">
          <span className="kp-viewers__l">Viewing as</span>
          {VIEWERS.map((x) => (
            <button key={x.id} type="button" role="radio" aria-checked={viewer === x.id} className={viewer === x.id ? 'is-on' : ''} onClick={() => setViewer(x.id)}>
              {x.name}
            </button>
          ))}
        </div>
        <div key={viewer} className="kp-answer">
          <p className="kp-answer__q">“How much do we owe Lena Stone?”</p>
          <p className="kp-answer__who">
            {who.name} · {who.role}. Sees: {who.sees}
          </p>
          <p className={`kp-answer__a is-${who.answer.kind}`}>{who.answer.text}</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- 07 · use cases ---------- */
export function KmCases(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--cases">
      <Kicker>Use cases</Kicker>
      <Title lines={['Six questions it answers']} />
      <div className="kp-uses">
        {USE_CASES.map((u, i) => (
          <article key={u.who} className="kp-use rv" style={d(260 + i * 90)}>
            <p className="kp-use__who">{u.who}</p>
            <p className="kp-use__ask">“{u.ask}”</p>
            <p className="kp-use__r">{u.report}</p>
            <p className="kp-use__res">{u.result}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ---------- 10 · ask your company ---------- */
export function KmEnd(_: SlideProps) {
  return (
    <div className="slide__frame fin kd--end">
      <div className="fin__center">
        <h2 className="fin__title kd-end__title">
          <span className="mask" style={d(80)}>
            <span>Ask your company</span>
          </span>
        </h2>
        <p className="fin__sub rv" style={d(360)}>
          with AI Knowledge Management
        </p>
        <div className="fin__bar rv" style={d(480)}>
          <Prompt label="Ask Knowledge Management" placeholder="Why is a goal at risk? How much do we owe?" href={kmHref} live={false} goEmpty />
        </div>
        <a className="more kd-end__more rv" style={d(600)} href={KM_URL}>
          Open Knowledge Management
          <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
        </a>
      </div>

      <footer className="fin__foot rv rv--fade" style={d(800)}>
        <a className="fin__by" href={COMPANY_URL} {...ext}>
          <img src={aitLogo} alt="Andre AI Technologies" width={186} height={96} />
        </a>
        <ul className="fin__social" aria-label="Neuronium elsewhere">
          {SOCIAL.map((s) => (
            <li key={s.brand}>
              <a className="fin__icon" href={s.href} aria-label={s.label} title={s.label} {...ext}>
                <BrandIcon brand={s.brand} size={s.brand === 'github' ? 16 : 17} />
              </a>
            </li>
          ))}
        </ul>
        <nav className="fin__legal" aria-label="Legal">
          <a href={TERMS_URL} {...ext}>
            Terms of Use
          </a>
          <a href={PRIVACY_URL} {...ext}>
            Privacy Policy
          </a>
        </nav>
      </footer>
    </div>
  )
}
