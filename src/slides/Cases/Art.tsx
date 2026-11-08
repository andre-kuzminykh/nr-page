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

/** Report: one sheet with a title line, a row of figures and bars that rise. */
function Sheet() {
  return (
    <>
      <rect x="240" y="210" width="320" height="380" rx="28" fill="rgb(7 6 11 / 0.55)" stroke="rgb(255 255 255 / 0.3)" strokeWidth="1.5" />
      <rect x="276" y="250" width="170" height="14" rx="7" fill="rgb(255 255 255 / 0.75)" />
      <rect x="276" y="278" width="230" height="9" rx="4.5" fill="rgb(255 255 255 / 0.25)" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={276 + k * 84} y="312" width="72" height="56" rx="12" fill="rgb(255 255 255 / 0.08)" />
      ))}
      {[0.82, 0.55, 0.68, 0.38].map((w, k) => (
        <g key={k}>
          <rect x="276" y={400 + k * 40} width="248" height="12" rx="6" fill="rgb(255 255 255 / 0.08)" />
          <rect className="ca-bar" style={v({ '--k': k })} x="276" y={400 + k * 40} width={248 * w} height="12" rx="6" fill="url(#ca-g)" />
        </g>
      ))}
    </>
  )
}

/** Graph: records as points, joined by links; one walk through them is lit. */
function Graph() {
  const pts = [
    [400, 220],
    [250, 330],
    [550, 330],
    [180, 480],
    [330, 470],
    [470, 480],
    [620, 470],
    [400, 600],
  ]
  const links = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
    [4, 7],
    [5, 7],
  ]
  const lit = [0, 2, 5, 7]
  return (
    <>
      {links.map(([a, b], i) => {
        const on = lit.includes(a) && lit.includes(b)
        return <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={on ? 'url(#ca-g)' : 'rgb(255 255 255 / 0.25)'} strokeWidth={on ? 4 : 1.5} />
      })}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={lit.includes(i) ? 16 : 10} fill={lit.includes(i) ? '#fff' : 'rgb(255 255 255 / 0.3)'} />
      ))}
    </>
  )
}

/** Ring: progress against plan — an arc, and a mark where it should be by now. */
function Ring() {
  const r = 150
  const c = 2 * Math.PI * r
  const tick = 0.6 * 2 * Math.PI - Math.PI / 2
  return (
    <>
      <circle cx="400" cy="400" r={r} fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="26" />
      <circle cx="400" cy="400" r={r} fill="none" stroke="url(#ca-g)" strokeWidth="26" strokeLinecap="round" strokeDasharray={`${c * 0.33} ${c}`} transform="rotate(-90 400 400)" />
      <line x1={400 + Math.cos(tick) * (r - 30)} y1={400 + Math.sin(tick) * (r - 30)} x2={400 + Math.cos(tick) * (r + 30)} y2={400 + Math.sin(tick) * (r + 30)} stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="400" cy="400" r="60" fill="rgb(7 6 11 / 0.5)" />
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
      {art === 'knowledge' ? <Knowledge /> : art === 'calls' ? <Calls /> : art === 'report' ? <Sheet /> : art === 'graph' ? <Graph /> : art === 'ring' ? <Ring /> : <Leads />}
    </svg>
  )
}
