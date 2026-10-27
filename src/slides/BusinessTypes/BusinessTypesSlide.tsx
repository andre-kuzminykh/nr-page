import type { CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import { TYPE_ICON } from '../../components/ui/icons'
import { BUSINESS_TYPES } from '../../data/architecture'
import './BusinessTypes.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** The real differences between the two types, row by row. */
const ROWS: { label: string; native: string; first: string }[] = [
  {
    label: 'What it is',
    native: 'An AI product. AI is built into how value is created.',
    first: 'A business with people in the loop. AI performs the core operational work.',
  },
  {
    label: 'Standard process',
    native: 'Can run autonomously, end to end.',
    first: 'Executed by AI, directed by people.',
  },
  {
    label: 'People',
    native: 'Oversee exceptions and important decisions. Remain accountable.',
    first: 'Manage decisions and control the results.',
  },
  {
    label: 'Structure',
    native: 'Its own arrangement — no fixed set of AI Employees.',
    first: 'Ten AI Employees, from Management to Engineering.',
  },
]

/** AI-Native: the value loop runs on its own; exceptions branch out to a person. */
function NativeLoop({ live }: { live: boolean }) {
  return (
    <svg className="types__diagram" viewBox="0 0 300 112" role="img" aria-label="Autonomous loop: input, AI, value — with exceptions escalated to a person">
      <path id="bt-loop" className="types__path" d="M40 56 C40 18 190 18 190 56 C190 94 40 94 40 56 Z" />
      <path className="types__path types__path--dash" d="M190 56 H252" />
      <g className="types__node">
        <circle cx="40" cy="56" r="4" />
        <text x="40" y="83" textAnchor="middle">Input</text>
      </g>
      <g className="types__node types__node--ai">
        <circle cx="115" cy="27" r="5" />
        <text x="115" y="14" textAnchor="middle">AI</text>
      </g>
      <g className="types__node">
        <circle cx="190" cy="56" r="4" />
        <text x="190" y="83" textAnchor="middle">Value</text>
      </g>
      <g className="types__person" transform="translate(268 56)">
        <circle r="13" />
        <circle cy="-3" r="3.2" className="types__glyph" />
        <path d="M-6 7 C-5 2 5 2 6 7" className="types__glyph" />
      </g>
      <text x="268" y="88" textAnchor="middle" className="types__caption">Exceptions</text>
      {live && (
        <>
          <circle r="3.2" className="types__token">
            <animateMotion dur="3.4s" repeatCount="indefinite" rotate="auto">
              <mpath href="#bt-loop" />
            </animateMotion>
          </circle>
          <circle r="2.4" className="types__token types__token--warm">
            <animateMotion dur="6.8s" repeatCount="indefinite" path="M190 56 H255" keyTimes="0;0.15;1" keyPoints="0;1;1" calcMode="linear" />
            <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;1;0;0" keyTimes="0;0.05;0.16;1" />
          </circle>
        </>
      )}
    </svg>
  )
}

/** AI-First: a person decides, AI executes the steps, a person controls the result. */
function FirstLine({ live }: { live: boolean }) {
  return (
    <svg className="types__diagram" viewBox="0 0 300 112" role="img" aria-label="A person decides, AI executes the work, a person controls the result">
      <path id="bt-line" className="types__path" d="M32 56 H268" />
      <g className="types__person" transform="translate(32 56)">
        <circle r="13" />
        <circle cy="-3" r="3.2" className="types__glyph" />
        <path d="M-6 7 C-5 2 5 2 6 7" className="types__glyph" />
      </g>
      <text x="32" y="88" textAnchor="middle" className="types__caption">Decide</text>
      {[92, 150, 208].map((x, i) => (
        <g key={x} className="types__node types__node--ai">
          <circle cx={x} cy="56" r="5" />
          <text x={x} y="38" textAnchor="middle">{i === 1 ? 'AI executes' : ''}</text>
        </g>
      ))}
      <g className="types__person" transform="translate(268 56)">
        <circle r="13" />
        <circle cy="-3" r="3.2" className="types__glyph" />
        <path d="M-6 7 C-5 2 5 2 6 7" className="types__glyph" />
      </g>
      <text x="268" y="88" textAnchor="middle" className="types__caption">Control</text>
      {live && (
        <circle r="3.2" className="types__token types__token--warm">
          <animateMotion dur="3.4s" repeatCount="indefinite" keyTimes="0;0.85;1" keyPoints="0;1;1" calcMode="spline" keySplines="0.45 0 0.3 1;0 0 1 1">
            <mpath href="#bt-line" />
          </animateMotion>
        </circle>
      )}
    </svg>
  )
}

export function BusinessTypesSlide({ active }: SlideProps) {
  const { reducedMotion } = useDeck()
  const live = active && !reducedMotion
  const [native, first] = BUSINESS_TYPES
  const NativeIcon = TYPE_ICON[native.icon]
  const FirstIcon = TYPE_ICON[first.icon]

  return (
    <div className="slide__frame types">
      <header className="types__head">
        <Eyebrow index={4}>AI Business types</Eyebrow>
        <h2 className="h2">
          <span className="mask" style={d(50)}>
            <span>Two ways to build with AI.</span>
          </span>
        </h2>
      </header>

      <div className="types__split">
        <div className="types__divider rv rv--line-y" style={d(240)} aria-hidden="true" />

        <div className="types__side types__side--native">
          <div className="types__top rv" style={d(160)}>
            <span className="types__icon"><NativeIcon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
            <span className="label">Type 01</span>
          </div>
          <h3 className="types__name rv rv--blur" style={d(200)}>{native.name}</h3>
          <p className="types__promise rv" style={d(280)}>{native.promise}</p>
          <div className="types__visual rv rv--fade" style={d(380)}><NativeLoop live={live} /></div>
        </div>

        <div className="types__side types__side--first">
          <div className="types__top rv" style={d(220)}>
            <span className="types__icon"><FirstIcon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
            <span className="label">Type 02</span>
          </div>
          <h3 className="types__name rv rv--blur" style={d(260)}>{first.name}</h3>
          <p className="types__promise rv" style={d(340)}>{first.promise}</p>
          <div className="types__visual rv rv--fade" style={d(440)}><FirstLine live={live} /></div>
        </div>

        {ROWS.map((row, i) => (
          <div key={row.label} className={`types__row types__row--${i}`}>
            <div className="types__cell types__cell--native rv" style={d(480 + i * 70)}>
              <span className="types__row-label mono">
                <span className="sr-only">AI-Native — </span>
                {row.label}
              </span>
              <span>{row.native}</span>
            </div>
            <div className="types__cell types__cell--first rv" style={d(520 + i * 70)}>
              <span className="types__row-label mono">
                <span className="sr-only">AI-First — </span>
                {row.label}
              </span>
              <span>{row.first}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
