import { ArrowUpRight, Check, Copy, Download } from 'lucide-react'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { EMPLOYEE_ICON, TYPE_ICON } from '../../components/ui/icons'
import { EARLY_ACCESS_URL } from '../../config/links'
import { BUSINESS_COMPONENTS, BUSINESS_TYPES, EXECUTION, OS } from '../../data/architecture'
import { EMPLOYEES, type EmployeeId } from '../../data/employees'
import './Configuration.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
type TypeId = 'native' | 'first'

/** Minimal JSON syntax colouring for the preview. */
function colorize(json: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(json))) {
    if (m.index > last) out.push(json.slice(last, m.index))
    if (m[1]) {
      out.push(
        <span key={k++} className={m[2] ? 'j-key' : 'j-str'}>
          {m[1]}
        </span>,
      )
      if (m[2]) out.push(m[2])
    } else if (m[3]) out.push(<span key={k++} className="j-bool">{m[3]}</span>)
    else if (m[4]) out.push(<span key={k++} className="j-num">{m[4]}</span>)
    last = re.lastIndex
  }
  out.push(json.slice(last))
  return out
}

/** Business Configuration — a structural demo. Nothing is created, deployed or purchased. */
export function ConfigurationSlide(_: SlideProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<TypeId>('first')
  const [team, setTeam] = useState<EmployeeId[]>(['management', 'marketing', 'sales', 'support'])
  const [context, setContext] = useState('')
  const [product, setProduct] = useState('')
  const [oversight, setOversight] = useState({ exceptions: true, importantDecisions: true })
  const [owner, setOwner] = useState('')
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')

  const toggle = (id: EmployeeId) =>
    setTeam((t) => (t.includes(id) ? t.filter((x) => x !== id) : EMPLOYEES.map((e) => e.id).filter((x) => x === id || t.includes(x))))

  const config = useMemo(() => {
    const business: Record<string, unknown> = {
      name: name.trim() || 'Untitled AI Business',
      type: type === 'native' ? 'AI-Native' : 'AI-First',
      components: BUSINESS_COMPONENTS.map((c) => c.name),
    }
    if (context.trim()) business.identity = { context: context.trim() }
    if (type === 'native') {
      business.product = {
        value: product.trim() || 'Describe the value the product creates',
        standardProcess: 'autonomous',
      }
      business.humanOversight = {
        exceptions: oversight.exceptions,
        importantDecisions: oversight.importantDecisions,
        accountableOwner: owner.trim() || 'Founder',
      }
    } else {
      business.aiEmployees = EMPLOYEES.filter((e) => team.includes(e.id)).map((e) => ({
        name: e.name,
        capabilities: e.capabilities.length,
      }))
      business.execution = EXECUTION.map((x) => x.name)
    }
    return {
      os: OS.name,
      governance: [...OS.governance.functions],
      business,
    }
  }, [name, type, team, context, product, oversight, owner])

  const json = JSON.stringify(config, null, 2)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    window.setTimeout(() => setCopied('idle'), 1800)
  }

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(name.trim() || 'ai-business').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.neuronium.json`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="slide__frame cfg">
      <header className="cfg__head">
        <div>
          <Eyebrow index={11}>Business configuration</Eyebrow>
          <h2 className="h2">
            <span className="mask" style={d(50)}>
              <span>Your business. Your system.</span>
            </span>
          </h2>
        </div>
        <p className="body cfg__intro rv" style={d(200)}>
          Sketch an AI Business and see its structure. A demonstration only — nothing is created,
          deployed or purchased.
        </p>
      </header>

      <div className="cfg__body">
        <form className="cfg__form rv" style={d(260)} onSubmit={(e) => e.preventDefault()} aria-label="AI Business configuration">
          <label className="cfg__field">
            <span className="label">Business name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northwind Studio" maxLength={60} />
          </label>

          <fieldset className="cfg__field">
            <legend className="label">AI Business type</legend>
            <div className="cfg__types" role="radiogroup" aria-label="AI Business type">
              {BUSINESS_TYPES.map((t) => {
                const Icon = TYPE_ICON[t.icon]
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={type === t.id}
                    className={`cfg__type cfg__type--${t.id}`}
                    onClick={() => setType(t.id)}
                  >
                    <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                    <span className="cfg__type-name">{t.name}</span>
                    <span className="cfg__type-promise">{t.promise}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {type === 'first' ? (
            <fieldset className="cfg__field cfg__swap" key="first">
              <legend className="label">
                AI Employees <span className="cfg__count">{team.length} of 10</span>
              </legend>
              <div className="cfg__team">
                {EMPLOYEES.map((e) => {
                  const Icon = EMPLOYEE_ICON[e.id]
                  const on = team.includes(e.id)
                  return (
                    <button key={e.id} type="button" className="cfg__emp" aria-pressed={on} onClick={() => toggle(e.id)}>
                      <span className="cfg__check" aria-hidden="true">{on && <Check size={10} strokeWidth={2.4} />}</span>
                      <Icon size={13} strokeWidth={1.6} aria-hidden="true" />
                      <span>{e.name}</span>
                    </button>
                  )
                })}
              </div>
              <div className="cfg__quick">
                <button type="button" className="text-link" onClick={() => setTeam(EMPLOYEES.map((e) => e.id))}>Select all</button>
                <button type="button" className="text-link" onClick={() => setTeam([])}>Clear</button>
              </div>
            </fieldset>
          ) : (
            <fieldset className="cfg__field cfg__swap" key="native">
              <legend className="label">Autonomous product</legend>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="What value does the product create?" maxLength={120} aria-label="Product value" />
              <div className="cfg__oversight">
                <span className="cfg__sub">People oversee</span>
                {(
                  [
                    ['exceptions', 'Exceptions'],
                    ['importantDecisions', 'Important decisions'],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    className="cfg__emp"
                    aria-pressed={oversight[k]}
                    onClick={() => setOversight((o) => ({ ...o, [k]: !o[k] }))}
                  >
                    <span className="cfg__check" aria-hidden="true">{oversight[k] && <Check size={10} strokeWidth={2.4} />}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Accountable owner (role)" maxLength={40} aria-label="Accountable owner" />
            </fieldset>
          )}

          <label className="cfg__field">
            <span className="label">Business context <span className="cfg__opt">optional · AI Identity</span></span>
            <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="Goals, customers, operating context" maxLength={140} />
          </label>
        </form>

        <div className="cfg__out rv" style={d(340)}>
          <div className="cfg__out-bar">
            <span className="label">Structure · JSON</span>
            <div className="cfg__out-actions">
              <button type="button" className="cfg__icon-btn" onClick={copy} aria-label="Copy JSON">
                {copied === 'ok' ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={1.7} />}
                <span>{copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy failed' : 'Copy'}</span>
              </button>
              <button type="button" className="cfg__icon-btn" onClick={download} aria-label="Download JSON">
                <Download size={14} strokeWidth={1.7} />
                <span>.json</span>
              </button>
            </div>
          </div>
          <pre className="cfg__json scroll-y" tabIndex={0} aria-label="Configuration preview">
            <code>{colorize(json)}</code>
          </pre>
          <div className="cfg__out-foot">
            <span className="note">Local demo · not connected to a Neuronium workspace</span>
            <a className="text-link" href={EARLY_ACCESS_URL} target={EARLY_ACCESS_URL.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              Get Early Access
              <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
