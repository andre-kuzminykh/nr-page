import type { CSSProperties } from 'react'
import type { CaseStudy } from '../../data/cases'

const v = (vars: Record<string, number>) => vars as CSSProperties

/** Knowledge: three sheets fan out behind one glass tile — every source, one answer. */
function Knowledge() {
  return (
    <>
      {[-1, 0, 1].map((k) => (
        <rect
          key={k}
          className="ca-sheet"
          style={v({ '--k': k })}
          x="290"
          y="250"
          width="220"
          height="290"
          rx="26"
          fill="rgb(255 255 255 / 0.06)"
          stroke="rgb(255 255 255 / 0.28)"
          strokeWidth="1.5"
        />
      ))}
      <g className="ca-tile">
        <rect x="318" y="318" width="164" height="164" rx="36" fill="#07060b" stroke="url(#ca-g)" strokeWidth="2.5" />
        <text x="400" y="420" textAnchor="middle" fontSize="64" fontWeight="600" letterSpacing="-2" fill="#fff">
          Km
        </text>
      </g>
    </>
  )
}

/** Calls: a voice spreads in rings around one point. */
function Calls() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} className="ca-ring" style={v({ '--k': k })} cx="400" cy="400" r="250" fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth="1.5" />
      ))}
      <circle cx="400" cy="400" r="150" fill="none" stroke="rgb(255 255 255 / 0.12)" />
      <circle className="ca-core" cx="400" cy="400" r="22" fill="url(#ca-g)" />
    </>
  )
}

/** Leads: a field of points; a few find one way to a single booked moment. */
function Leads() {
  const dots = []
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) dots.push([190 + c * 70, 190 + r * 70])
  const way = 'M190 470 C 260 470, 290 330, 400 330 S 540 470, 610 400'
  return (
    <>
      {dots.map(([x, y], i) => (
        <circle key={i} className="ca-dot" style={v({ '--k': i % 9 })} cx={x} cy={y} r="3.2" fill="rgb(255 255 255 / 0.32)" />
      ))}
      <path className="ca-way" d={way} fill="none" stroke="url(#ca-g)" strokeWidth="3" strokeLinecap="round" />
      {[
        [190, 470],
        [400, 330],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" fill="#fff" />
      ))}
      <circle className="ca-book" cx="610" cy="400" r="26" fill="none" stroke="#fff" strokeWidth="2.5" />
      <circle cx="610" cy="400" r="11" fill="url(#ca-g)" />
    </>
  )
}

/** A drawn picture for a case: a soft field of its colour and one quiet motif in the middle. */
export function Art({ art }: { art: CaseStudy['art'] }) {
  return (
    <svg className="ca" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ca-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b48cff" />
          <stop offset="0.5" stopColor="#ee7ad8" />
          <stop offset="1" stopColor="#ffa25c" />
        </linearGradient>
      </defs>
      {art === 'knowledge' ? <Knowledge /> : art === 'calls' ? <Calls /> : <Leads />}
    </svg>
  )
}
