import { Check, Printer } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Prompt } from '../components/Prompt/Prompt'
import { kmHref } from '../config/links'
import { SCENARIOS, STAGES, type Figure, type Scenario } from './content'

const v = (vars: Record<string, string | number>) => vars as CSSProperties
/** The stages take this long each; the finished report stays this long before the next request. */
const STAGE_MS = 700
const READ_MS = 7600

/** A number that counts up to its value once `run` is on, after `delay` ms. */
function useCount(to: number, run: boolean, delay: number, ms = 1000) {
  const [now, setNow] = useState(run ? 0 : to)
  useEffect(() => {
    if (!run) {
      setNow(to)
      return
    }
    setNow(0)
    let raf = 0
    const t0 = performance.now() + delay
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms))
      setNow(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, run, delay, ms])
  return now
}

const num = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n))

function FigureTile({ f, i, run }: { f: Figure; i: number; run: boolean }) {
  const n = useCount(f.value, run, 700 + i * 120)
  return (
    <div className={`kr-fig is-${f.tone}`} style={v({ '--i': i })}>
      <span className="kr-fig__v">
        {num(n)}
        {f.unit && <small>{f.unit}</small>}
      </span>
      <span className="kr-fig__l">{f.label}</span>
    </div>
  )
}

/** The report document: it slides up, its parts appear in turn, figures count and bars grow. */
export function Report({ s, run }: { s: Scenario; run: boolean }) {
  let part = 0
  const next = () => v({ '--p': part++ })
  return (
    <article className={`kr-sheet ${run ? 'is-run' : ''}`} aria-label={s.title}>
      <header className="kr-head" style={next()}>
        <span className="kr-intent">intent: {s.intent}</span>
        <span className="kr-kicker">REPORT · NEURONIUM · MANAGEMENT</span>
        <Printer className="kr-print" size={15} strokeWidth={1.8} aria-hidden="true" />
      </header>
      <h3 className="kr-title" style={next()}>
        {s.title}
      </h3>
      <p className="kr-prep" style={next()}>
        {s.prepared} · request: “{s.query}”
      </p>
      <p className={`kr-sum ${s.figures.length ? '' : 'is-gap'}`} style={next()}>
        {s.summary}
      </p>
      {s.figures.length > 0 && (
        <div className="kr-figs" style={next()}>
          {s.figures.map((f, i) => (
            <FigureTile key={f.label} f={f} i={i} run={run} />
          ))}
        </div>
      )}
      {s.chart && (
        <div className="kr-chart" style={next()}>
          {s.chart.map((c, i) => (
            <div key={c.label} className="kr-bar" style={v({ '--v': `${c.value}%`, '--e': `${c.expected}%`, '--i': i })}>
              <span className="kr-bar__l">{c.label}</span>
              <span className="kr-bar__track">
                <span className="kr-bar__fill" />
                <span className="kr-bar__exp" />
              </span>
              <span className="kr-bar__n">
                {c.value}% · {s.words.expected} {c.expected}%
              </span>
            </div>
          ))}
        </div>
      )}
      {s.findings.length > 0 && (
        <section className="kr-part" style={next()}>
          <h4>{s.words.findings}</h4>
          <ul>
            {s.findings.map((f) => (
              <li key={f.text}>
                <span className={`kr-badge is-${f.status.toLowerCase()}`}>{f.status}</span>
                <span>{f.text}</span>
                <span className="kr-cites">
                  {f.cites.map((c) => (
                    <i key={c}>{c}</i>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {s.limits.length > 0 && (
        <section className="kr-part kr-limits" style={next()}>
          <h4>{s.words.limits}</h4>
          <ul>
            {s.limits.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      )}
      {s.sources.length > 0 && (
        <section className="kr-part kr-sources" style={next()}>
          <h4>{s.words.sources}</h4>
          <ol>
            {s.sources.map((src, i) => (
              <li key={src}>
                <i>c{i + 1}</i>
                {src}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}

/**
 * The report generator, playing by itself. It opens on a finished report; then a request is typed
 * and sent, the four stages run, and its report arrives. Then the next request. A template plays its report at once; a request
 * written by the visitor opens Knowledge Management with it.
 */
export function ReportDemo({ live }: { live: boolean }) {
  const [k, setK] = useState(0)
  const [run, setRun] = useState(0)
  // the block opens on a finished report (no empty panel); the next request types itself after it
  const [phase, setPhase] = useState<'type' | 'stages' | 'report'>('report')
  const [first, setFirst] = useState(true)
  const [stage, setStage] = useState(0)
  const [own, setOwn] = useState(false)
  const s = SCENARIOS[k]
  const timer = useRef(0)

  const play = (i: number) => {
    setFirst(false)
    setK(i)
    setRun((r) => r + 1)
    setStage(0)
    setPhase(live ? 'type' : 'report')
  }

  // the stages, one after another, then the report; then the next request
  useEffect(() => {
    window.clearTimeout(timer.current)
    if (!live || own) return
    if (phase === 'stages') {
      timer.current = window.setTimeout(() => {
        if (stage < STAGES.length - 1) setStage(stage + 1)
        else setPhase('report')
      }, STAGE_MS)
    } else if (phase === 'report') {
      timer.current = window.setTimeout(() => play((k + 1) % SCENARIOS.length), READ_MS)
    }
    return () => window.clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, stage, live, own, k])

  useEffect(() => {
    if (!live) setPhase('report')
  }, [live])

  return (
    <div className={`kr ${live ? 'is-live' : 'is-still'}`}>
      <div className="kr-bar-row">
        <Prompt
          key={`${s.id}-${run}`}
          label="Ask Knowledge Management"
          placeholder="Ask anything about your company"
          href={kmHref}
          live={live && !own && !first}
          text={s.query}
          sent={phase !== 'type'}
          onSent={() => {
            if (phase === 'type') {
              setStage(0)
              setPhase('stages')
            }
          }}
          delay={500}
          onTake={() => setOwn(true)}
          onLeave={() => setOwn(false)}
        />
      </div>

      <div className="kr-templates" role="group" aria-label="Report templates">
        {SCENARIOS.map((x, i) => (
          <button key={x.id} type="button" className={`kr-tpl ${i === k ? 'is-on' : ''}`} onClick={() => play(i)}>
            {x.template}
          </button>
        ))}
      </div>

      <div className="kr-stage" aria-live="polite">
        {phase === 'stages' && (
          <ol className="kr-steps">
            {STAGES.map((label, i) => (
              <li key={label} className={i < stage ? 'is-done' : i === stage ? 'is-now' : ''}>
                <span className="kr-steps__dot">{i < stage ? <Check size={12} strokeWidth={2.6} aria-hidden="true" /> : null}</span>
                {label}
                {i === 1 && i <= stage && <em> — {s.walked} records</em>}
              </li>
            ))}
          </ol>
        )}
        {phase === 'report' && <Report key={`${s.id}-${run}`} s={s} run={live} />}
      </div>
    </div>
  )
}
