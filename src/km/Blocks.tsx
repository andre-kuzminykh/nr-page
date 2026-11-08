import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import aitLogo from '../assets/ait-logo.png'
import { BrandIcon } from '../components/Brand/BrandIcon'
import { Prompt } from '../components/Prompt/Prompt'
import { useDemo } from '../components/Prompt/useDemo'
import { useDeck, type SlideProps } from '../components/SlideController/DeckContext'
import { COMPANY_URL, KM_URL, PRIVACY_URL, SOCIAL, TERMS_URL, kmHref } from '../config/links'
import '../slides/Final/Final.css'
import { SCENARIOS, VIEWERS } from './content'
import { HOW_STEPS, HowDemo } from './HowDemo'
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
      <div className="kd-side">
        <Kicker>The report generator</Kicker>
        <Title lines={['Ask a question.', 'Get a report.']} />
      </div>
      <div className="kd-report__demo rv" style={d(200)}>
        {shown && <ReportDemo live={active && !reducedMotion} />}
      </div>
    </div>
  )
}

/* ---------- 03 · how it works: ask, the graph is searched, the answer ---------- */
export function KmHow({ active, shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [step, setStep] = useState(-1)
  return (
    <div className="slide__frame kd kd--how">
      <div className="kd-side">
        <Kicker>How it works</Kicker>
        <Title lines={['From a question', 'to the answer']} />
        <ol className="kh-steps rv" style={d(300)}>
          {HOW_STEPS.map((x, i) => (
            <li key={x} className={i === step ? 'is-now' : i < step ? 'is-done' : ''}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              {x}
            </li>
          ))}
        </ol>
      </div>
      <div className="kd-how__demo rv" style={d(200)}>
        {shown && <HowDemo live={active && !reducedMotion} onStep={setStep} />}
      </div>
    </div>
  )
}

/* ---------- 04 · access ---------- */
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

/* ---------- 08 · ask your company ---------- */
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
