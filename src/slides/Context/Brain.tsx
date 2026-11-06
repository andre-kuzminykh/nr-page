import {
  BrainCircuit,
  CalendarDays,
  Database,
  FileText,
  GitBranch,
  HardDrive,
  Hash,
  Mail,
  MessageCircle,
  Plug,
  Send,
  Sheet,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/*
 * The shared context as a brain: a graph of points and connections, side view, the front to the right.
 * The tools are nodes in it. The AI Superagent starts in the middle and runs strictly along the
 * connections — two ways at once — through every tool: the connections on its way light up and
 * thicken, each tool swells as it arrives and shows its icon, its name appears and fades.
 * Then a fast wave runs the whole way again, the way fades out the way it came, and it starts over.
 */

/** [x, y, r, warm] — the silhouette (46 points); their colour follows the position (see hue). */
const V: [number, number, number, number][] = [
  [40, 205, 2.2, 0], [50.7, 158.2, 2.6, 0], [82.8, 114.8, 2.4, 0], [130.9, 78.1, 2, 0], [189.8, 54.7, 1.9, 0],
  [254, 41.3, 2, 1], [318.2, 38, 2.3, 0], [382.4, 44.7, 2, 1], [441.2, 61.4, 2.5, 1], [494.8, 88.1, 2.5, 1],
  [537.5, 128.2, 2.9, 1], [564.3, 171.6, 2.8, 1], [575, 211.7, 2, 1], [558.9, 248.4, 2.2, 1], [521.5, 275.1, 2.1, 1],
  [468, 288.5, 2.5, 1], [419.8, 288.5, 2.4, 1], [379.7, 271.8, 2, 1], [395.8, 311.9, 2.6, 1], [366.3, 345.3, 2.2, 1],
  [307.5, 363.6, 2.4, 1], [237.9, 360.3, 2.7, 0], [173.8, 338.6, 2.1, 0], [114.9, 305.2, 2.4, 0], [72.1, 258.4, 2.6, 0],
  [323.6, 243.4, 2.9, 1], [270, 223.4, 2.3, 0], [227.2, 195, 2.1, 0], [326.2, 94.8, 1.9, 0], [342.3, 148.2, 2.7, 1],
  [353, 196.7, 2.8, 1], [462.7, 138.2, 2.6, 1], [414.5, 98.1, 2.5, 1], [500.1, 205, 2.7, 1], [430.6, 225, 2.4, 1],
  [393.1, 158.2, 2, 1], [254, 104.8, 2.5, 0], [189.8, 128.2, 2.7, 0], [264.7, 161.6, 2.3, 0], [130.9, 178.3, 1.9, 0],
  [157.7, 238.4, 2.1, 0], [216.6, 265.1, 2, 0], [291.4, 301.9, 2, 1], [109.5, 138.2, 2.3, 0], [200.5, 318.6, 2, 0],
  [361, 78.1, 2.4, 0],
]

/** Connections — pairs of point numbers. */
const E = [
  0, 1, 0, 24, 1, 2, 2, 3, 2, 43, 3, 4, 3, 37, 4, 5, 4, 36, 4, 37, 5, 6, 5, 36, 6, 7, 6, 28, 6, 45, 7, 8, 7, 32, 7, 45, 8, 9, 8, 32, 9,
  10, 9, 31, 10, 11, 10, 31, 11, 12, 11, 33, 12, 13, 12, 33, 13, 14, 13, 33, 14, 15, 14, 33, 15, 16, 16, 17, 16, 34, 17, 18, 17, 25,
  17, 34, 18, 19, 19, 20, 20, 21, 20, 42, 21, 22, 21, 42, 21, 44, 22, 23, 22, 44, 23, 24, 23, 40, 24, 39, 24, 40, 25, 26, 25, 30, 25,
  42, 26, 27, 26, 38, 26, 41, 27, 37, 27, 38, 27, 40, 27, 41, 28, 29, 28, 36, 28, 45, 29, 30, 29, 35, 29, 38, 30, 34, 30, 35, 31, 32,
  31, 33, 31, 34, 31, 35, 32, 35, 32, 45, 33, 34, 34, 35, 36, 37, 36, 38, 37, 39, 37, 43, 39, 40, 39, 43, 40, 41, 41, 42, 41, 44,
]

interface ToolNode {
  v: number
  icon: LucideIcon
  label: string
}

/** The Superagent sits in the middle; the tools around it. */
const CORE: ToolNode = { v: 26, icon: BrainCircuit, label: 'AI Superagent' }
const TOOLS: ToolNode[] = [
  // conversations and time — up and along the top to the front
  { v: 37, icon: Mail, label: 'Gmail' },
  { v: 3, icon: CalendarDays, label: 'Calendar' },
  { v: 5, icon: Video, label: 'Meet' },
  { v: 7, icon: Hash, label: 'Slack' },
  { v: 9, icon: Send, label: 'Telegram' },
  { v: 11, icon: MessageCircle, label: 'WhatsApp' },
  // knowledge and data — down and along the bottom to the front
  { v: 41, icon: HardDrive, label: 'Drive' },
  { v: 23, icon: FileText, label: 'Docs' },
  { v: 21, icon: Sheet, label: 'Sheets' },
  { v: 19, icon: Database, label: 'Apollo' },
  { v: 15, icon: GitBranch, label: 'Code' },
  { v: 13, icon: Plug, label: 'APIs' },
]
const NODES = [CORE, ...TOOLS]
/** Two ways at once from the core (node indices into NODES). */
const BRANCHES = [
  [0, 1, 2, 3, 4, 5, 6],
  [0, 7, 8, 9, 10, 11, 12],
]

const POP = 600
const GAP = 420
const SPEED = 0.24 // px per ms along the connections
const WAVE = 3.4
const FADE = 3
const HOLD = 900
const LEAD = 1050

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u))
const out3 = (u: number) => 1 - (1 - u) ** 3
const backOut = (t: number) => {
  const u = t - 1
  return 1 + 2.70158 * u * u * u + 1.70158 * u * u
}
const f1 = (v: number) => (Math.round(v * 10) / 10).toString()
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}
/**
 * Colour by place, left to right: violet through most of the brain, then pink, and orange only near
 * its right side. [position 0–1, colour, light colour]
 */
const RAMP: [number, number[], number[]][] = [
  [0, [138, 92, 255], [188, 160, 255]],
  [0.5, [160, 113, 255], [200, 174, 255]],
  [0.74, [220, 96, 216], [238, 162, 232]],
  [0.92, [255, 138, 51], [255, 179, 122]],
]
const X0 = 40
const X1 = 575
const rgb = (c: number[]) => `rgb(${c.map(Math.round).join(',')})`
function hue(x: number, light = false) {
  const u = clamp((x - X0) / (X1 - X0), 0, 1)
  let k = 0
  while (k < RAMP.length - 2 && u > RAMP[k + 1][0]) k++
  const [u0, a0, l0] = RAMP[k]
  const [u1, a1, l1] = RAMP[k + 1]
  const t = clamp((u - u0) / (u1 - u0), 0, 1)
  const a = light ? l0 : a0
  const b = light ? l1 : a1
  return rgb(a.map((v, i) => lerp(v, b[i], t)))
}

/** Shortest way between two points along the connections. */
function route(from: number, to: number): number[] {
  const adj: number[][] = V.map(() => [])
  for (let i = 0; i < E.length; i += 2) {
    adj[E[i]].push(E[i + 1])
    adj[E[i + 1]].push(E[i])
  }
  const prev = new Array(V.length).fill(-1)
  const seen = new Set([from])
  const q = [from]
  while (q.length) {
    const n = q.shift()!
    if (n === to) break
    for (const m of adj[n]) {
      if (!seen.has(m)) {
        seen.add(m)
        prev[m] = n
        q.push(m)
      }
    }
  }
  const path = [to]
  while (path[0] !== from) path.unshift(prev[path[0]])
  return path
}

interface Leg {
  from: number
  to: number
  pts: number[]
  len: number
  st: number
  du: number
}

function plan() {
  const arr: number[] = new Array(NODES.length).fill(0)
  arr[0] = POP
  const legs: Leg[] = []
  for (const br of BRANCHES) {
    for (let k = 1; k < br.length; k++) {
      const a = br[k - 1]
      const b = br[k]
      const pts = route(NODES[a].v, NODES[b].v)
      let len = 0
      for (let j = 1; j < pts.length; j++) len += Math.hypot(V[pts[j]][0] - V[pts[j - 1]][0], V[pts[j]][1] - V[pts[j - 1]][1])
      const du = Math.max(600, len / SPEED)
      const st = arr[a] + GAP
      legs.push({ from: a, to: b, pts, len, st, du })
      arr[b] = st + du
    }
  }
  const segs: { a: number; b: number; l0: number; len: number; leg: number; t1: number; tm: number }[] = []
  const mids: { p: number; l: number; leg: number; t: number }[] = []
  const legT = (L: Leg, l: number) => {
    const f = clamp(l / L.len, 0, 1)
    let lo = 0
    let hi = 1
    for (let q = 0; q < 24; q++) {
      const m = (lo + hi) / 2
      if (ease(m) < f) lo = m
      else hi = m
    }
    return L.st + ((lo + hi) / 2) * L.du
  }
  legs.forEach((L, li) => {
    let acc = 0
    for (let k = 1; k < L.pts.length; k++) {
      const a = L.pts[k - 1]
      const b = L.pts[k]
      const len = Math.hypot(V[b][0] - V[a][0], V[b][1] - V[a][1])
      segs.push({ a, b, l0: acc, len, leg: li, t1: legT(L, acc + len), tm: legT(L, acc + len / 2) })
      acc += len
      if (k < L.pts.length - 1) mids.push({ p: b, l: acc, leg: li, t: legT(L, acc) })
    }
  })
  const last = Math.max(...arr)
  const run = last - arr[0]
  const W0 = last + 450
  const D0 = W0 + run / WAVE + HOLD
  const CL = D0 + run / FADE + 600
  return { arr, legs, segs, mids, W0, D0, CL }
}

const legDone = (L: Leg, c: number) => L.len * ease(clamp((c - L.st) / L.du, 0, 1))
function legPoint(L: Leg, l: number): [number, number] {
  for (let k = 1; k < L.pts.length; k++) {
    const a = V[L.pts[k - 1]]
    const b = V[L.pts[k]]
    const s = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (l <= s || k === L.pts.length - 1) {
      const f = clamp(l / s, 0, 1)
      return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]
    }
    l -= s
  }
  return [V[L.pts[0]][0], V[L.pts[0]][1]]
}

type Attr = Record<string, string>
function set(el: Element | null | undefined, k: string, v: string) {
  if (!el) return
  const c = ((el as Element & { _c?: Attr })._c ??= {})
  if (c[k] !== v) {
    c[k] = v
    el.setAttribute(k, v)
  }
}

export function Brain({ active, shown, still }: { active: boolean; shown: boolean; still: boolean }) {
  const P = useMemo(plan, [])
  const [phone, setPhone] = useState(() => window.matchMedia?.('(max-width: 767px)').matches ?? false)
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 767px)')
    if (!mq) return
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const R = phone ? 17 : 13
  const IS = phone ? 17 : 13.5
  /** On a phone the brain is drawn at about 0.6: lines and points get heavier to stay visible. */
  const K = phone ? 1.7 : 1

  const svg = useRef<SVGSVGElement>(null)
  const rg = useRef<(SVGLineElement | null)[]>([])
  const rc = useRef<(SVGLineElement | null)[]>([])
  const vh = useRef<(SVGCircleElement | null)[]>([])
  const vd = useRef<(SVGCircleElement | null)[]>([])
  const nodes = useRef<(SVGGElement | null)[]>([])
  const heads = useRef<(SVGGElement | null)[]>([])

  useEffect(() => {
    const root = svg.current
    if (!root) return
    let raf = 0
    const draw = (T: number, fixed: boolean) => {
      let c = fixed ? T : T - LEAD
      if (c < 0) c = -1
      else if (!fixed) c %= P.CL
      const wc = !fixed && c > P.W0 ? P.arr[0] + (c - P.W0) * WAVE : -1e9
      const dc = !fixed && c > P.D0 ? P.arr[0] + (c - P.D0) * FADE : -1e9

      // connections on the way: drawn behind the agent, brighter and thicker as it passes, wiped by the fade
      P.segs.forEach((e, i) => {
        const L = P.legs[e.leg]
        const p = clamp((legDone(L, c) - e.l0) / e.len, 0, 1)
        const q = clamp((legDone(L, dc) - e.l0) / e.len, 0, 1)
        const g = rg.current[i]
        const k = rc.current[i]
        if (p - q < 0.004) {
          set(g, 'display', 'none')
          set(k, 'display', 'none')
          return
        }
        const heat = c < e.t1 ? 1 : Math.exp(-(c - e.t1) / 700)
        const w = Math.exp(-(((wc - e.tm) / 380) ** 2))
        const cw = (1.5 + 1.8 * heat + 1.4 * w) * K
        const da = `${f1(e.len * (p - q))} 9999`
        const off = f1(-e.len * q)
        for (const el of [g, k]) {
          set(el, 'display', 'inline')
          set(el, 'stroke-dasharray', da)
          set(el, 'stroke-dashoffset', off)
        }
        set(k, 'stroke-width', f1(cw))
        set(g, 'stroke-width', f1(cw * 3.6))
        set(k, 'opacity', (0.78 + 0.22 * Math.max(heat, w)).toFixed(2))
        set(g, 'opacity', (0.12 + 0.3 * heat + 0.34 * w).toFixed(2))
      })
      // points on the way flash as the agent passes and stay brighter than the rest
      P.mids.forEach((m, i) => {
        const k = c - m.t
        if (k < 0 || dc >= m.t) {
          set(vh.current[i], 'r', '0')
          set(vd.current[i], 'r', '0')
          return
        }
        const s = k < 140 ? k / 140 : Math.exp(-(k - 140) / 420)
        const w = Math.exp(-(((wc - m.t) / 380) ** 2))
        set(vd.current[i], 'r', f1((V[m.p][2] * 1.25 + 3 * s + 1.4 * w) * K))
        set(vh.current[i], 'r', f1((6 + 9 * s + 6 * w) * K))
        set(vh.current[i], 'opacity', (0.22 + 0.55 * s + 0.4 * w).toFixed(2))
      })
      // tools swell as the agent arrives: a ripple, the icon; the name shows and fades, the icon stays
      NODES.forEach((n, i) => {
        const g = nodes.current[i]
        if (!g) return
        const [ripple, halo, base, icon] = Array.from(g.children) as SVGElement[]
        const isCore = i === 0
        const k = c - P.arr[i]
        let z = dc > -1e8 ? clamp((dc - P.arr[i]) / (420 * FADE), 0, 1) : 0
        if (isCore) z = 0
        if (k < 0 || z >= 1) {
          set(base, 'r', '0')
          set(halo, 'r', '0')
          set(ripple, 'r', '0')
          set(icon, 'opacity', '0')
          g.classList.remove('is-named')
          return
        }
        const w = Math.exp(-(((wc - P.arr[i]) / 420) ** 2))
        z *= z
        const s = backOut(clamp(k / 560, 0, 1)) * (1 + 0.18 * w) * (1 - z)
        const r0 = V[n.v][2]
        set(base, 'r', f1(Math.max(r0, (isCore ? R * 1.08 : R) * s)))
        set(base, 'opacity', (1 - z * 0.6).toFixed(2))
        const rp = clamp(k / 950, 0, 1)
        set(ripple, 'r', rp < 1 ? f1(R + 26 * out3(rp)) : '0')
        set(ripple, 'opacity', (0.9 * (1 - rp)).toFixed(2))
        set(halo, 'r', f1((R + 6) * Math.min(1, s) + 4 * w))
        set(halo, 'opacity', ((0.16 + 0.05 * Math.sin(T / 650 + i) + 0.3 * w) * (1 - z)).toFixed(2))
        const si = backOut(clamp((k - 150) / 440, 0, 1))
        set(icon, 'opacity', (clamp((k - 150) / 220, 0, 1) * (1 - z)).toFixed(2))
        set(icon, 'transform', `scale(${Math.max(0.001, si * (1 + 0.12 * w) * (1 - z)).toFixed(3)})`)
        g.classList.toggle('is-named', !fixed && k > 80 && k < (isCore ? 2600 : 2000))
      })
      // the agent: one bright point on each way, and the spark of the wave
      P.legs.forEach((L, i) => {
        const hd = heads.current[i]
        let tt = -1
        let sc = 1
        if (c >= L.st && c <= L.st + L.du) tt = c
        else if (wc >= L.st && wc <= L.st + L.du) {
          tt = wc
          sc = 0.75
        }
        if (tt < 0) {
          set(hd, 'display', 'none')
          return
        }
        const u = (tt - L.st) / L.du
        const p = legPoint(L, legDone(L, tt))
        const s = Math.min(1, Math.min(u, 1 - u) * 8)
        set(hd, 'display', 'inline')
        set(hd, 'transform', `translate(${f1(p[0])} ${f1(p[1])}) scale(${((0.6 + 0.4 * s) * sc * K).toFixed(2)})`)
        set(hd, 'opacity', s.toFixed(2))
      })
    }

    if (still) {
      root.classList.add('is-still')
      draw(P.W0 - 1, true)
      return
    }
    if (!shown) {
      root.classList.remove('is-run')
      draw(-1, true)
      return
    }
    if (!active) return
    root.classList.remove('is-run')
    void root.getBoundingClientRect()
    root.classList.add('is-run')
    const t0 = performance.now()
    const frame = (now: number) => {
      draw(now - t0, false)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [P, active, shown, still, R, K])

  return (
    <svg ref={svg} className="cb" viewBox="26 22 562 362" role="img" aria-label={`Shared context: ${TOOLS.map((t) => t.label).join(', ')} — the AI Superagent runs through all of them`}>
      <defs>
        {/* the connections and the way follow the same colours as the points */}
        <linearGradient id="cbL" gradientUnits="userSpaceOnUse" x1={X0} y1="0" x2={X1} y2="0">
          {RAMP.map(([u, c]) => (
            <stop key={u} offset={u} stopColor={rgb(c)} />
          ))}
        </linearGradient>
        <linearGradient id="cbP" gradientUnits="userSpaceOnUse" x1={X0} y1="0" x2={X1} y2="0">
          {RAMP.map(([u, , c]) => (
            <stop key={u} offset={u} stopColor={rgb(c)} />
          ))}
        </linearGradient>
        <radialGradient id="cbDot">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#e6b8ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the brain: connections and points arrive in a wave from back to front, then the points twinkle */}
      <g className="cb-base">
        {Array.from({ length: E.length / 2 }, (_, k) => {
          const a = V[E[k * 2]]
          const b = V[E[k * 2 + 1]]
          const d = 0.2 + ((Math.min(a[0], b[0]) - 40) / 535) * 0.9 + rnd(k * 2) * 0.15
          return <line key={k} className="cb-e" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{ '--d': `${d.toFixed(2)}s` } as CSSProperties} />
        })}
        {V.map((p, n) => {
          const d = 0.28 + ((p[0] - 40) / 535) * 0.9 + rnd(n + 99) * 0.15
          return (
            <circle
              key={n}
              className="cb-v"
              cx={p[0]}
              cy={p[1]}
              r={p[2] * K}
              fill={hue(p[0])}
              style={{ '--d': `${d.toFixed(2)}s`, '--tw': `${(2.6 + rnd(n + 7) * 1.6).toFixed(2)}s` } as CSSProperties}
            />
          )
        })}
      </g>

      {/* the way */}
      <g fill="none" strokeLinecap="round" stroke="url(#cbP)">
        {P.segs.map((e, i) => (
          <line
            key={`g${i}`}
            ref={(el) => {
              rg.current[i] = el
            }}
            x1={V[e.a][0]}
            y1={V[e.a][1]}
            x2={V[e.b][0]}
            y2={V[e.b][1]}
            display="none"
          />
        ))}
        {P.segs.map((e, i) => (
          <line
            key={`c${i}`}
            ref={(el) => {
              rc.current[i] = el
            }}
            x1={V[e.a][0]}
            y1={V[e.a][1]}
            x2={V[e.b][0]}
            y2={V[e.b][1]}
            display="none"
          />
        ))}
      </g>
      <g>
        {P.mids.map((m, k) => {
          const p = V[m.p]
          return (
            <g key={k}>
              <circle
                ref={(el) => {
                  vh.current[k] = el
                }}
                cx={p[0]}
                cy={p[1]}
                r={0}
                fill="url(#cbDot)"
              />
              <circle
                ref={(el) => {
                  vd.current[k] = el
                }}
                cx={p[0]}
                cy={p[1]}
                r={0}
                fill={hue(p[0])}
              />
            </g>
          )
        })}
      </g>

      {/* the tools */}
      {NODES.map((n, i) => {
        const [x, y] = V[n.v]
        const Icon = n.icon
        const anchor = x > 540 ? 'end' : x < 80 ? 'start' : 'middle'
        const lx = anchor === 'end' ? R + 2 : anchor === 'start' ? -R - 2 : 0
        return (
          <g
            key={n.label}
            ref={(el) => {
              nodes.current[i] = el
            }}
            className={`cb-n ${i === 0 ? 'cb-n--core' : ''}`} transform={`translate(${x} ${y})`}>
            <circle r={0} fill="none" stroke={hue(x)} strokeWidth={1.4} />
            <circle r={0} fill={hue(x)} />
            <circle r={0} fill="#130d1f" stroke={hue(x, true)} strokeWidth={1.6} />
            <g opacity={0}>
              <Icon x={-IS / 2} y={-IS / 2} width={IS} height={IS} color={hue(x, true)} strokeWidth={1.9} aria-hidden="true" />
            </g>
            <text className="cb-lab" x={lx} y={f1(R + (phone ? 21 : 17))} textAnchor={anchor}>
              {n.label}
            </text>
          </g>
        )
      })}

      {/* the agent */}
      {P.legs.map((_, i) => (
        <g
          key={i}
          ref={(el) => {
            heads.current[i] = el
          }}
          display="none"
        >
          <circle r={11} fill="url(#cbDot)" />
          <circle r={3.4} fill="#fff" />
        </g>
      ))}
    </svg>
  )
}
