import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import aitLogo from '../assets/ait-logo.png'
import { BrandIcon } from '../components/Brand/BrandIcon'
import { Prompt } from '../components/Prompt/Prompt'
import { useDemo } from '../components/Prompt/useDemo'
import { useDeck, type SlideProps } from '../components/SlideController/DeckContext'
import { COMPANY_URL, KM_URL, PRIVACY_URL, SOCIAL, TERMS_URL, kmHref } from '../config/links'
import '../slides/Final/Final.css'
import { DOMAINS, GAPS, INTENTS, PIPELINE, SCENARIOS, USE_CASES, VIEWERS } from './content'
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

/** A number that counts up once its block is shown. */
function Count({ to, on }: { to: number; on: boolean }) {
  const [n, setN] = useState(on ? 0 : to)
  useEffect(() => {
    if (!on) {
      setN(to)
      return
    }
    setN(0)
    let raf = 0
    const t0 = performance.now() + 300
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / 1400))
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, on])
  return <>{n}</>
}

/* ---------- 01 · the name, and the bar ---------- */
export function KmOverview({ active, shown }: SlideProps) {
  const { reducedMotion, goTo } = useDeck()
  const live = active && !reducedMotion
  const asks = SCENARIOS.map((s) => s.query)
  const demo = useDemo(asks.length, { live, shown, after: 1400 })
  return (
    <div className="slide__frame kd kd--overview">
      <Kicker>Neuronium · Management · 1 · Km</Kicker>
      <h1 className="kd-h1">
        {['AI Knowledge', 'Management'].map((line, k) => (
          <span key={k} className="mask" style={d(80 + k * 90)}>
            <span>{line}</span>
          </span>
        ))}
      </h1>
      <p className="kd-lead rv" style={d(380)}>
        Order any report about your company in your own words — and get a real document: a summary, key figures, a chart against plan, findings, limitations and numbered sources.
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
        In English or Russian — the report answers in the language you asked in.
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
        <Title lines={['A real document,', 'not a chat reply']} />
        <ul className="kd-anatomy rv" style={d(300)}>
          {['Summary', 'Key figures', 'Chart against plan', 'Findings — calculated, confirmed, hypothesis', 'Limitations', 'Numbered sources'].map((x) => (
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
      <Title lines={['GraphRAG over your company']} />
      <p className="kd-lead rv" style={d(260)}>
        Every report is built from the company’s own knowledge graph, in five steps.
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
          <p>Confirmed — a stored record, linked to its field. Calculated — by a named rule. Hypothesis — found in text. Every confirmed claim points to its source.</p>
        </article>
        <article className="kp-card rv" style={d(420)}>
          <div className="kp-card__art kp-nodata" aria-hidden="true">
            <span className="kp-nodata__v">—</span>
            <span className="kp-nodata__l">Profit · Finance module not connected</span>
          </div>
          <h3>No data — no number</h3>
          <p>No module, record, link or measurement? The report states a limitation and its reason — never a number made up to fill the space.</p>
        </article>
        <article className="kp-card rv" style={d(540)}>
          <div className="kp-card__art kp-same" aria-hidden="true">
            <span className="kp-same__doc" />
            <span className="kp-same__eq">=</span>
            <span className="kp-same__doc" />
          </div>
          <h3>Same question, same report</h3>
          <p>The same data and the same request always give the same report — so a figure can be reproduced, compared and trusted.</p>
        </article>
      </div>
    </div>
  )
}

/* ---------- 05 · ask in your own words ---------- */
export function KmAsk(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--ask">
      <Kicker>Ask in your own words</Kicker>
      <Title lines={['Every kind of question,', 'its own report']} />
      <div className="kp-intents">
        {INTENTS.map((x, i) => (
          <div key={x.report} className="kp-intent rv" style={d(300 + i * 80)}>
            <p className="kp-intent__q">“{x.ask}”</p>
            <p className="kp-intent__ru">“{x.ru}”</p>
            <p className="kp-intent__r">
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
              {x.report}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 06 · the knowledge graph ---------- */
export function KmGraph({ active }: SlideProps) {
  const { reducedMotion } = useDeck()
  return (
    <div className="slide__frame kd kd--graph">
      <div className="kd-graph__text">
        <Kicker>The company knowledge graph</Kicker>
        <Title lines={['Records, joined', 'by what they mean']} />
        <p className="kd-lead rv" style={d(260)}>
          Goals, tasks, people, processes, bookings and money — each a record with its type, joined by 22 kinds of directed links. One person is one record: “AM” on the board and the account AM are one Alex Mercer.
        </p>
        <p className="kp-graph__legend rv" style={d(380)}>
          <span className="is-link">stored link</span>
          <span className="is-hyp">hypothesis — a name found in text</span>
          <span className="is-walk">the walk a question takes</span>
        </p>
      </div>
      <div className="kp-graph rv" style={d(200)}>
        <KnowledgeGraph on={active && !reducedMotion} />
      </div>
    </div>
  )
}

/* ---------- 07 · the ontology ---------- */
export function KmOntology({ shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [open, setOpen] = useState<number | null>(5)
  return (
    <div className="slide__frame kd kd--ontology">
      <Kicker>The company ontology</Kicker>
      <Title lines={['A map of everything you can ask about']} />
      <div className="kp-nums">
        {(
          [
            [27, 'domains'],
            [156, 'entity types'],
            [25, 'Neuronium modules'],
          ] as const
        ).map(([n, l], i) => (
          <div key={l} className="kp-num rv" style={d(260 + i * 100)}>
            <span>
              <Count to={n} on={shown && !reducedMotion} />
            </span>
            <small>{l}</small>
          </div>
        ))}
      </div>
      <div className="kp-domains">
        {DOMAINS.map((dm, i) => (
          <button
            key={dm.name}
            type="button"
            className={`kp-domain rv ${open === i ? 'is-open' : ''}`}
            style={d(420 + (i % 9) * 40)}
            aria-pressed={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            onMouseEnter={() => setOpen(i)}
          >
            <span className="kp-domain__n">{String(i).padStart(2, '0')}</span>
            <span className="kp-domain__name">{dm.name}</span>
          </button>
        ))}
      </div>
      <p className="kp-domain__types rv" style={d(700)} aria-live="polite">
        {open !== null ? (
          <>
            <b>{DOMAINS[open].name}:</b> {DOMAINS[open].types}
          </>
        ) : (
          'Point at a domain to see its types.'
        )}
      </p>
    </div>
  )
}

/* ---------- 08 · access ---------- */
export function KmAccess(_: SlideProps) {
  const [viewer, setViewer] = useState(VIEWERS[0].id)
  const who = VIEWERS.find((x) => x.id === viewer)!
  return (
    <div className="slide__frame kd kd--access">
      <Kicker>Access</Kicker>
      <Title lines={['Each reader sees', 'only their part']} />
      <p className="kd-lead rv" style={d(260)}>
        Rights are given to a person, a team or a role. What is outside them never enters the reader’s graph — it cannot be found by name, walked to, counted or quoted.
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
            {who.name} — {who.role}. Sees: {who.sees}
          </p>
          <p className={`kp-answer__a is-${who.answer.kind}`}>{who.answer.text}</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- 09 · honesty ---------- */
export function KmGaps(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--gaps">
      <Kicker>Honesty</Kicker>
      <Title lines={['Gaps instead of', 'made-up numbers']} />
      <p className="kd-lead rv" style={d(260)}>
        Money is counted only from money records, summed per currency, never mixed — and never replaced by a count of something else.
      </p>
      <div className="kp-gaps">
        {GAPS.map((g, i) => (
          <article key={g.code} className="kp-gap rv" style={d(340 + i * 80)}>
            <span className="kp-gap__code">{g.code}</span>
            <p>{g.text}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ---------- 10 · it grows ---------- */
export function KmGrow(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--grow">
      <svg className="kp-ring rv rv--scale" style={d(200)} viewBox="0 0 300 300" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => {
          const a = (i / 25) * Math.PI * 2 - Math.PI / 2
          return <circle key={i} className={i === 0 ? 'is-on' : ''} style={{ '--i': i } as CSSProperties} cx={150 + Math.cos(a) * 120} cy={150 + Math.sin(a) * 120} r={i === 0 ? 10 : 6} />
        })}
        <text x="150" y="146" textAnchor="middle" className="kp-ring__n">
          1 of 25
        </text>
        <text x="150" y="170" textAnchor="middle" className="kp-ring__l">
          modules connected
        </text>
      </svg>
      <div>
        <Kicker>It grows with Neuronium</Kicker>
        <Title lines={['Every module that connects', 'turns its gaps into answers']} />
        <p className="kd-lead rv" style={d(300)}>
          Today Management is connected. When Finance connects, “What was profit last month?” comes back with numbers, and the company report stops listing it among its limitations — with no change to the ontology or the screen.
        </p>
      </div>
    </div>
  )
}

/* ---------- 11 · use cases ---------- */
export function KmCases(_: SlideProps) {
  return (
    <div className="slide__frame kd kd--cases">
      <Kicker>Use cases</Kicker>
      <Title lines={['One question, one report']} />
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

/* ---------- 14 · ask your company ---------- */
export function KmEnd(_: SlideProps) {
  return (
    <div className="slide__frame fin kd--end">
      <div className="fin__center">
        <h2 className="fin__title kd-end__title">
          <span className="mask" style={d(80)}>
            <span>Ask your company</span>
          </span>
        </h2>
        <p className="fin__sub rv rv--blur" style={d(360)}>
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
