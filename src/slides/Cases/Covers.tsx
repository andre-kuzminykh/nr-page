import type { CSSProperties } from 'react'
import type { CaseArticle } from '../../data/cases'

/**
 * The covers of the case articles: small drawings of the work each one is about, in the light of
 * the site. They move only while the block is on screen.
 */
const v = (vars: Record<string, string | number>) => vars as CSSProperties

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#a071ff" />
        <stop offset="0.55" stopColor="#e06ad8" />
        <stop offset="1" stopColor="#ff8a33" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.6">
        <stop offset="0" stopColor="#8b55f6" stopOpacity="0.45" />
        <stop offset="0.55" stopColor="#d63cf5" stopOpacity="0.12" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

/** Knowledge Management: three sources flow into one answer — the Km element. */
function Knowledge() {
  const docs = [
    [58, 46],
    [302, 40],
    [92, 168],
  ]
  return (
    <>
      <Defs id="csk" />
      <rect width="400" height="250" fill="url(#csk-glow)" />
      <g fill="none" stroke="rgb(255 255 255 / 0.07)">
        <ellipse cx="200" cy="125" rx="150" ry="92" />
        <ellipse cx="200" cy="125" rx="98" ry="60" />
      </g>
      {docs.map(([x, y], i) => (
        <path
          key={`l${i}`}
          className="csv-flow"
          d={`M${x + 23} ${y + 29} Q ${(x + 223) / 2} ${y < 100 ? y + 70 : y - 30} 200 125`}
          stroke="url(#csk-g)"
          style={v({ '--k': i })}
        />
      ))}
      {docs.map(([x, y], i) => (
        <g key={`d${i}`} className="csv-doc" style={v({ '--k': i })} transform={`translate(${x} ${y})`}>
          <rect width="46" height="58" rx="9" fill="rgb(255 255 255 / 0.05)" stroke="rgb(255 255 255 / 0.22)" />
          <path d="M10 16h26M10 25h20M10 34h24M10 43h14" stroke="rgb(255 255 255 / 0.45)" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
      <g className="csv-core">
        <rect x="166" y="91" width="68" height="68" rx="15" fill="#000" stroke="url(#csk-g)" strokeWidth="1.6" />
        <text x="176" y="108" fontSize="10" fill="rgb(255 255 255 / 0.6)" fontFamily="var(--font-mono)">
          1
        </text>
        <text x="200" y="138" textAnchor="middle" fontSize="25" fontWeight="600" fill="#fff" letterSpacing="-0.5">
          Km
        </text>
      </g>
    </>
  )
}

/** From the call to the tasks: a voice becomes a checklist. */
function Calls() {
  const bars = [10, 22, 36, 18, 44, 30, 52, 26, 40, 58, 34, 20, 46, 28, 16, 38, 24, 12]
  return (
    <>
      <Defs id="csc" />
      <rect width="400" height="250" fill="url(#csc-glow)" />
      {bars.map((h, i) => (
        <rect
          key={i}
          className="csv-bar"
          x={34 + i * 7.2}
          y={125 - h / 2}
          width="3.6"
          height={h}
          rx="1.8"
          fill="url(#csc-g)"
          style={v({ '--k': i })}
        />
      ))}
      <path className="csv-flow" d="M172 125 C 196 125, 204 125, 226 125" stroke="url(#csc-g)" />
      <g transform="translate(236 58)">
        <rect width="132" height="134" rx="16" fill="rgb(255 255 255 / 0.04)" stroke="rgb(255 255 255 / 0.16)" />
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(16 ${24 + r * 36})`}>
            <circle className="csv-tick" style={v({ '--k': r })} cx="9" cy="9" r="8.5" stroke="url(#csc-g)" strokeWidth="1.4" />
            <path className="csv-check" style={v({ '--k': r })} d="M5 9.4l2.8 2.8L13.2 6.6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="26" y="6" width={[72, 56, 64][r]} height="6" rx="3" fill="rgb(255 255 255 / 0.35)" />
          </g>
        ))}
      </g>
    </>
  )
}

/** From leads to demos: points of interest find their way into the calendar. */
function Leads() {
  const dots = [
    [44, 60], [78, 92], [58, 150], [112, 54], [96, 190], [140, 118], [36, 112], [128, 168], [150, 70], [70, 212],
  ]
  const hot = [1, 5, 7]
  return (
    <>
      <Defs id="csl" />
      <rect width="400" height="250" fill="url(#csl-glow)" />
      {hot.map((d, i) => (
        <path
          key={`p${i}`}
          className="csv-flow"
          d={`M${dots[d][0]} ${dots[d][1]} C 190 ${dots[d][1]}, 200 ${[96, 128, 160][i]}, 246 ${[96, 128, 160][i]}`}
          stroke="url(#csl-g)"
          style={v({ '--k': i })}
        />
      ))}
      {dots.map(([x, y], i) => (
        <circle
          key={i}
          className={`csv-dot ${hot.includes(i) ? 'is-hot' : ''}`}
          cx={x}
          cy={y}
          r={hot.includes(i) ? 5 : 3.2}
          fill={hot.includes(i) ? 'url(#csl-g)' : 'rgb(255 255 255 / 0.4)'}
          style={v({ '--k': i })}
        />
      ))}
      <g transform="translate(250 66)">
        {Array.from({ length: 15 }, (_, c) => {
          const col = c % 5
          const row = Math.floor(c / 5)
          const booked = c === 6 || c === 13
          return (
            <rect
              key={c}
              className={booked ? 'csv-slot is-booked' : 'csv-slot'}
              x={col * 25}
              y={row * 40}
              width="20"
              height="32"
              rx="6"
              fill={booked ? 'url(#csl-g)' : 'rgb(255 255 255 / 0.06)'}
              stroke={booked ? 'none' : 'rgb(255 255 255 / 0.14)'}
              style={v({ '--k': booked ? (c === 6 ? 0 : 1) : 0 })}
            />
          )
        })}
      </g>
    </>
  )
}

/** `whole`: the drawing is shown entire (the lead story's tall cover); otherwise it fills its box. */
export function Cover({ kind, whole = false }: { kind: CaseArticle['cover']; whole?: boolean }) {
  return (
    <svg className="csv" viewBox="0 0 400 250" preserveAspectRatio={whole ? 'xMidYMid meet' : 'xMidYMid slice'} aria-hidden="true" focusable="false">
      {kind === 'knowledge' ? <Knowledge /> : kind === 'calls' ? <Calls /> : <Leads />}
    </svg>
  )
}
