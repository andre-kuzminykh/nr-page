import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import aitLogo from '../assets/ait-logo.png'
import { BrandIcon } from '../components/Brand/BrandIcon'
import { ContactWidget } from '../components/Contact/ContactWidget'
import { LightField } from '../components/LightField/LightField'
import { Prompt } from '../components/Prompt/Prompt'
import { COMPANY_URL, GITHUB_URL, HOME_URL, KM_URL, PRIVACY_URL, SOCIAL, TERMS_URL, kmHref } from '../config/links'
import type { LightPreset } from '../data/slides'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { DOMAINS, GAPS, INTENTS, PIPELINE, SCENARIOS, VIEWERS } from './content'
import { KnowledgeGraph } from './KnowledgeGraph'
import { Report, ReportDemo } from './ReportDemo'
import './km.css'

const v = (vars: Record<string, string | number>) => vars as CSSProperties
const ext = { target: '_blank', rel: 'noreferrer' } as const

/** Where the light sits while each part of the page is in view. */
const LIGHT: Record<string, LightPreset> = {
  hero: { x: 0.72, y: 0.36, radius: 0.58, energy: 1.0, spread: 1.0 },
  how: { x: 0.2, y: 0.5, radius: 0.5, energy: 0.8, spread: 1.05 },
  rules: { x: 0.82, y: 0.6, radius: 0.5, energy: 0.78, spread: 1.1 },
  ask: { x: 0.18, y: 0.38, radius: 0.5, energy: 0.8, spread: 1.0 },
  graph: { x: 0.6, y: 0.62, radius: 0.56, energy: 0.85, spread: 1.15 },
  ontology: { x: 0.3, y: 0.3, radius: 0.55, energy: 0.8, spread: 1.1 },
  access: { x: 0.8, y: 0.4, radius: 0.5, energy: 0.8, spread: 1.0 },
  gaps: { x: 0.25, y: 0.65, radius: 0.5, energy: 0.78, spread: 1.05 },
  grow: { x: 0.5, y: 0.5, radius: 0.6, energy: 0.9, spread: 0.9 },
  end: { x: 0.5, y: 0.56, radius: 0.62, energy: 1.2, spread: 0.8 },
}

/** Marks a section as seen (its parts arrive) and tells the page which one is in view. */
function useSections(onCurrent: (id: string) => void) {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('[data-sec]')]
    const seen = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.setAttribute('data-in', '')),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    const middle = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onCurrent((e.target as HTMLElement).dataset.sec!)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => {
      seen.observe(el)
      middle.observe(el)
    })
    return () => {
      seen.disconnect()
      middle.disconnect()
    }
  }, [onCurrent])
}

function Section({ id, className = '', children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} data-sec={id} className={`kp-sec kp-s-${id} ${className}`}>
      {children}
    </section>
  )
}

function Head({ kicker, title, text }: { kicker: string; title: ReactNode; text?: ReactNode }) {
  return (
    <header className="kp-head">
      <p className="kp-kicker k-rv">{kicker}</p>
      <h2 className="kp-h2 k-rv" style={v({ '--d': 1 })}>
        {title}
      </h2>
      {text && (
        <p className="kp-lead k-rv" style={v({ '--d': 2 })}>
          {text}
        </p>
      )}
    </header>
  )
}

function Big({ to, on }: { to: number; on: boolean }) {
  const [n, setN] = useState(on ? 0 : to)
  useEffect(() => {
    if (!on) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, on])
  return <>{n}</>
}

/** Seen once it scrolls into view (for counters and the graph). */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen] as const
}

export function KmPage() {
  const reduced = useReducedMotion()
  const [current, setCurrent] = useState('hero')
  const [viewer, setViewer] = useState(VIEWERS[0].id)
  const [domain, setDomain] = useState<number | null>(5)
  const [graphRef, graphSeen] = useSeen<HTMLDivElement>()
  const [numsRef, numsSeen] = useSeen<HTMLDivElement>()
  useSections(setCurrent)
  const who = VIEWERS.find((x) => x.id === viewer)!

  return (
    <>
      <LightField preset={LIGHT[current] ?? LIGHT.hero} reducedMotion={reduced} pulseKey={Object.keys(LIGHT).indexOf(current)} />

      <header className="kp-nav">
        <a className="kp-logo" href={HOME_URL} aria-label="Neuronium — home">
          Nr
        </a>
        <a className="more kp-back" href={HOME_URL}>
          Neuronium
        </a>
        <span className="kp-nav__end">
          <a className="kp-oss" href={GITHUB_URL} {...ext} aria-label="Open source on GitHub">
            <BrandIcon brand="github" size={15} />
            <span>Open source</span>
          </a>
          <a className="kp-cta" href={KM_URL}>
            Open Knowledge Management
            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </span>
      </header>

      <main className="kp">
        {/* ---------- hero: the report generator, live ---------- */}
        <Section id="hero">
          <div className="kp-hero">
            <div className="kp-hero__text">
              <p className="kp-kicker k-rv">Neuronium · Management · 1 · Km</p>
              <h1 className="kp-h1 k-rv" style={v({ '--d': 1 })}>
                AI Knowledge
                <br />
                Management
              </h1>
              <p className="kp-lead k-rv" style={v({ '--d': 2 })}>
                Order any report about your company in your own words — and get a real document: a summary, key figures, a chart against plan, findings, limitations and numbered sources.
              </p>
              <p className="kp-note k-rv" style={v({ '--d': 3 })}>
                In English or Russian — the report answers in the language you asked in.
              </p>
            </div>
            <div className="kp-hero__demo k-rv" style={v({ '--d': 2 })}>
              <ReportDemo live={!reduced} />
            </div>
          </div>
        </Section>

        {/* ---------- how it works ---------- */}
        <Section id="how">
          <Head kicker="How it works" title="GraphRAG over your company" text="Every report is built from the company’s own knowledge graph, in five steps." />
          <ol className="kp-pipe">
            <span className="kp-pipe__line" aria-hidden="true">
              <i />
            </span>
            {PIPELINE.map((p, i) => (
              <li key={p.n} className="k-rv" style={v({ '--d': i + 2, '--k': i })}>
                <span className="kp-pipe__n">{p.n}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ---------- three principles ---------- */}
        <Section id="rules">
          <Head kicker="Three principles" title="A report you can check" />
          <div className="kp-rules">
            <article className="kp-card k-rv" style={v({ '--d': 2 })}>
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
            <article className="kp-card k-rv" style={v({ '--d': 3 })}>
              <div className="kp-card__art kp-nodata" aria-hidden="true">
                <span className="kp-nodata__v">—</span>
                <span className="kp-nodata__l">Profit · Finance module not connected</span>
              </div>
              <h3>No data — no number</h3>
              <p>No module, record, link or measurement? The report states a limitation and its reason — never a number made up to fill the space.</p>
            </article>
            <article className="kp-card k-rv" style={v({ '--d': 4 })}>
              <div className="kp-card__art kp-same" aria-hidden="true">
                <span className="kp-same__doc" />
                <span className="kp-same__eq">=</span>
                <span className="kp-same__doc" />
              </div>
              <h3>Same question, same report</h3>
              <p>The same data and the same request always give the same report — so a figure can be reproduced, compared and trusted.</p>
            </article>
          </div>
        </Section>

        {/* ---------- ask in your own words ---------- */}
        <Section id="ask">
          <Head kicker="Ask in your own words" title="Every kind of question, its own report" text="It reads what is being asked — why, how many, how it is going, what is linked, what effect — and finds the records you named." />
          <div className="kp-intents">
            {INTENTS.map((x, i) => (
              <div key={x.report} className="kp-intent k-rv" style={v({ '--d': (i % 3) + 2 })}>
                <p className="kp-intent__q">“{x.ask}”</p>
                <p className="kp-intent__ru">“{x.ru}”</p>
                <p className="kp-intent__r">
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                  {x.report}
                </p>
                <p className="kp-intent__note">{x.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- the knowledge graph ---------- */}
        <Section id="graph">
          <Head
            kicker="The company knowledge graph"
            title="Records, joined by what they mean"
            text="Goals, tasks, people, processes, bookings and money — each a record with its type, joined by 22 kinds of directed links. One person is one record: “AM” on the board and the account AM are one Alex Mercer."
          />
          <div ref={graphRef} className="kp-graph k-rv" style={v({ '--d': 2 })}>
            <KnowledgeGraph on={graphSeen && !reduced} />
            <p className="kp-graph__legend">
              <span className="is-link">stored link</span>
              <span className="is-hyp">hypothesis — a name found in text</span>
              <span className="is-walk">the walk a question takes</span>
            </p>
          </div>
        </Section>

        {/* ---------- the ontology ---------- */}
        <Section id="ontology">
          <Head kicker="The company ontology" title="A map of everything you can ask about" />
          <div ref={numsRef} className="kp-nums">
            {[
              [27, 'domains'],
              [156, 'entity types'],
              [25, 'Neuronium modules'],
            ].map(([n, l], i) => (
              <div key={l} className="kp-num k-rv" style={v({ '--d': i + 2 })}>
                <span>
                  <Big to={n as number} on={numsSeen} />
                </span>
                <small>{l}</small>
              </div>
            ))}
          </div>
          <div className="kp-domains" role="list">
            {DOMAINS.map((dm, i) => (
              <button
                key={dm.name}
                type="button"
                role="listitem"
                className={`kp-domain k-rv ${domain === i ? 'is-open' : ''}`}
                style={v({ '--d': 2 + (i % 9) * 0.35 })}
                aria-expanded={domain === i}
                onClick={() => setDomain(domain === i ? null : i)}
                onMouseEnter={() => setDomain(i)}
              >
                <span className="kp-domain__n">{String(i).padStart(2, '0')}</span>
                <span className="kp-domain__name">{dm.name}</span>
              </button>
            ))}
          </div>
          <p className="kp-domain__types" aria-live="polite">
            {domain !== null ? (
              <>
                <b>{DOMAINS[domain].name}:</b> {DOMAINS[domain].types}
              </>
            ) : (
              'Point at a domain to see its types.'
            )}
          </p>
          <p className="kp-small k-rv">Fifteen types are answered with data today; the other 141 are recognised and answered with an honest gap until their module connects.</p>
        </Section>

        {/* ---------- access ---------- */}
        <Section id="access">
          <Head
            kicker="Access"
            title="Each reader sees only their part"
            text="Rights are given to a person, a team or a role. What is outside them never enters the reader’s graph — it cannot be found by name, walked to, counted or quoted."
          />
          <div className="kp-access k-rv" style={v({ '--d': 2 })}>
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
        </Section>

        {/* ---------- honesty ---------- */}
        <Section id="gaps">
          <Head kicker="Honesty" title="Gaps instead of made-up numbers" text="When something is missing, the report says what and why. Money is counted only from money records, summed per currency, never mixed — and never replaced by a count of something else." />
          <div className="kp-gaps">
            {GAPS.map((g, i) => (
              <article key={g.code} className="kp-gap k-rv" style={v({ '--d': (i % 3) + 2 })}>
                <span className="kp-gap__code">{g.code}</span>
                <p>{g.text}</p>
              </article>
            ))}
          </div>
          <div className="kp-gap-report k-rv" style={v({ '--d': 3 })}>
            <Report s={SCENARIOS.find((x) => x.id === 'gap')!} run={false} />
          </div>
        </Section>

        {/* ---------- it grows ---------- */}
        <Section id="grow">
          <div className="kp-grow">
            <svg className="kp-ring k-rv" viewBox="0 0 300 300" aria-hidden="true">
              {Array.from({ length: 25 }, (_, i) => {
                const a = (i / 25) * Math.PI * 2 - Math.PI / 2
                return <circle key={i} className={i === 0 ? 'is-on' : ''} style={v({ '--i': i })} cx={150 + Math.cos(a) * 120} cy={150 + Math.sin(a) * 120} r={i === 0 ? 10 : 6} />
              })}
              <text x="150" y="146" textAnchor="middle" className="kp-ring__n">
                1 of 25
              </text>
              <text x="150" y="170" textAnchor="middle" className="kp-ring__l">
                modules connected
              </text>
            </svg>
            <div>
              <Head
                kicker="It grows with Neuronium"
                title="Every module that connects turns its gaps into answers"
                text="Today Management is connected. When Finance connects, “What was profit last month?” comes back with numbers, and the company report stops listing it among its limitations — with no change to the ontology or the screen."
              />
            </div>
          </div>
        </Section>

        {/* ---------- ask ---------- */}
        <Section id="end">
          <div className="kp-end">
            <h2 className="kp-h1 k-rv">Ask your company</h2>
            <div className="kp-end__bar k-rv" style={v({ '--d': 1 })}>
              <Prompt label="Ask Knowledge Management" placeholder="Why is a goal at risk? How much do we owe?" href={kmHref} live={false} goEmpty />
            </div>
            <a className="more kp-end__more k-rv" style={v({ '--d': 2 })} href={KM_URL}>
              Open Knowledge Management
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </Section>
      </main>

      <footer className="kp-foot">
        <a className="kp-foot__logo" href={COMPANY_URL} {...ext}>
          <img src={aitLogo} alt="Andre AI Technologies" width={186} height={96} />
        </a>
        <ul className="kp-foot__social" aria-label="Neuronium elsewhere">
          {SOCIAL.map((s) => (
            <li key={s.brand}>
              <a href={s.href} aria-label={s.label} title={s.label} {...ext}>
                <BrandIcon brand={s.brand} size={s.brand === 'github' ? 16 : 17} />
              </a>
            </li>
          ))}
        </ul>
        <nav className="kp-foot__legal" aria-label="Legal">
          <a href={TERMS_URL} {...ext}>
            Terms of Use
          </a>
          <a href={PRIVACY_URL} {...ext}>
            Privacy Policy
          </a>
        </nav>
      </footer>

      <ContactWidget />
    </>
  )
}
