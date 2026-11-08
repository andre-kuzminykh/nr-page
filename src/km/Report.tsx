import { useEffect, useState, type CSSProperties } from 'react'
import type { Figure, Scenario } from './content'

const v = (vars: Record<string, string | number>) => vars as CSSProperties

/** A number that counts up to its value once `run` is on, after `delay` ms. */
export function useCount(to: number, run: boolean, delay: number, ms = 1000) {
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
  const n = useCount(f.value, run, 500 + i * 120)
  return (
    <div className={`kr-fig is-${f.tone}`} style={v({ '--i': i })}>
      <span className="kr-fig__v">
        {num(n)}
        {f.unit && <small>{f.unit.trim()}</small>}
      </span>
      <span className="kr-fig__l">{f.label}</span>
    </div>
  )
}

/** One measure against plan, as a ring: the arc grows to the value, a tick marks where it should be by now. */
export function Ring({ value, expected, label, run }: { value: number; expected: number; label: string; run: boolean }) {
  const n = useCount(value, run, 300, 1200)
  const r = 52
  const c = 2 * Math.PI * r
  const tick = (expected / 100) * 2 * Math.PI - Math.PI / 2
  return (
    <div className="kr-ring" data-v={value} style={v({ '--v': value / 100, '--c': c })}>
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="kr-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a071ff" />
            <stop offset="0.55" stopColor="#e06ad8" />
            <stop offset="1" stopColor="#ff8a33" />
          </linearGradient>
        </defs>
        <circle className="kr-ring__track" cx="64" cy="64" r={r} />
        <circle className="kr-ring__arc" cx="64" cy="64" r={r} strokeDasharray={c} />
        <line className="kr-ring__tick" x1={64 + Math.cos(tick) * (r - 9)} y1={64 + Math.sin(tick) * (r - 9)} x2={64 + Math.cos(tick) * (r + 9)} y2={64 + Math.sin(tick) * (r + 9)} />
      </svg>
      <span className="kr-ring__n">
        {n}
        <small>%</small>
      </span>
      <span className="kr-ring__l">
        {label} · {expected}% expected
      </span>
    </div>
  )
}

/** The report: a title, one line, the figures and a chart, then what was found, what is missing, and from where. */
export function Report({ s, run }: { s: Scenario; run: boolean }) {
  let part = 0
  const next = () => v({ '--p': part++ })
  const ring = s.chart?.length === 1 ? s.chart[0] : undefined
  return (
    <article className={`kr-sheet ${run ? 'is-run' : ''} ${s.figures.length ? '' : 'is-gap'}`} aria-label={s.title}>
      <h3 className="kr-title" style={next()}>
        {s.title}
      </h3>
      <p className="kr-sum" style={next()}>
        {s.summary}
      </p>
      {(s.figures.length > 0 || s.chart) && (
        <div className={`kr-data ${ring ? 'has-ring' : ''}`} style={next()}>
          {ring && <Ring {...ring} run={run} />}
          {s.figures.length > 0 && (
            <div className="kr-figs">
              {s.figures.map((f, i) => (
                <FigureTile key={f.label} f={f} i={i} run={run} />
              ))}
            </div>
          )}
          {s.chart && !ring && (
            <div className="kr-chart">
              {s.chart.map((c, i) => (
                <div key={c.label} className="kr-bar" data-v={c.value} style={v({ '--v': `${c.value}%`, '--e': `${c.expected}%`, '--i': i })}>
                  <span className="kr-bar__l">{c.label}</span>
                  <span className="kr-bar__n">
                    {c.value}% <small>· {c.expected}% {s.words.expected}</small>
                  </span>
                  <span className="kr-bar__track">
                    <span className="kr-bar__fill" />
                    <span className="kr-bar__exp" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {s.findings.length > 0 && (
        <section className="kr-part" style={next()}>
          <h4>{s.words.findings}</h4>
          <ul>
            {s.findings.map((f) => (
              <li key={f.text}>
                <span className={`kr-badge is-${f.status.toLowerCase()}`}>{f.status}</span>
                <span className="kr-part__t">{f.text}</span>
                <span className="kr-cites">
                  {f.cites.map((c) => (
                    <i key={c}>{c.slice(1)}</i>
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
                <i>{i + 1}</i>
                {src}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  )
}
