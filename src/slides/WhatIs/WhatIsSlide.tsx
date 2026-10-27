import { useEffect, useState, type CSSProperties } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { Eyebrow } from '../../components/ui/Eyebrow'
import './WhatIs.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** Familiar, separate AI tools — the same items, later placed into one system. */
const GROUPS = [
  { title: 'Business knowledge', items: ['Documents', 'Notes', 'Files'] },
  { title: 'Work management', items: ['Tasks', 'Calendars', 'Projects'] },
  { title: 'AI execution', items: ['Chats', 'Automations', 'Agents'] },
]

/** Scattered starting points (% of stage) and tilt for each item, in GROUPS order. */
const SCATTER: [number, number, number][] = [
  [14, 22, -9],
  [70, 82, 7],
  [42, 60, -4],
  [86, 18, 10],
  [24, 74, 6],
  [58, 30, -12],
  [36, 12, 5],
  [80, 52, -7],
  [12, 48, 12],
]

const COL_X = [17, 50, 83]
const ROW_Y = [37, 53, 69]

export function WhatIsSlide({ shown }: SlideProps) {
  const { reducedMotion } = useDeck()
  const [ordered, setOrdered] = useState(false)

  useEffect(() => {
    if (!shown) {
      setOrdered(false)
      return
    }
    if (reducedMotion) {
      setOrdered(true)
      return
    }
    const t = window.setTimeout(() => setOrdered(true), 1150)
    return () => window.clearTimeout(t)
  }, [shown, reducedMotion])

  return (
    <div className="slide__frame what">
      <div className="what__text">
        <Eyebrow index={2} delay={0}>What is Neuronium</Eyebrow>
        <h2 className="h2 what__title">
          <span className="mask" style={d(60)}>
            <span>From AI tools</span>
          </span>
          <span className="mask" style={d(150)}>
            <span>to AI Business.</span>
          </span>
        </h2>
        <p className="lead what__lead rv" style={d(320)}>
          Chats, automations, documents and agents become more useful when they share context and
          operate within one system.
        </p>
        <p className="what__body rv" style={d(420)}>
          Neuronium brings <strong>business knowledge</strong>, <strong>work management</strong> and{' '}
          <strong>AI execution</strong> together.
        </p>
      </div>

      <figure
        className={`what__stage rv rv--fade ${ordered ? 'is-ordered' : ''}`}
        style={d(200)}
        aria-label="Separate AI tools arranged into one system: business knowledge, work management and AI execution, connected by shared context."
      >
        <div className="what__frame" aria-hidden="true">
          <span className="what__frame-label mono">Neuronium</span>
        </div>

        {GROUPS.map((g, gi) => (
          <span
            key={g.title}
            className="what__group mono"
            style={{ left: `${COL_X[gi]}%`, '--i': gi } as CSSProperties}
          >
            {g.title}
          </span>
        ))}

        {GROUPS.flatMap((g, gi) =>
          g.items.map((item, ii) => {
            const k = gi * 3 + ii
            const [sx, sy, sr] = SCATTER[k]
            return (
              <span
                key={item}
                className="what__item"
                style={
                  {
                    '--sx': `${sx}%`,
                    '--sy': `${sy}%`,
                    '--sr': `${sr}deg`,
                    '--ox': `${COL_X[gi]}%`,
                    '--oy': `${ROW_Y[ii]}%`,
                    '--k': k,
                  } as CSSProperties
                }
              >
                {item}
              </span>
            )
          }),
        )}

        <div className="what__context" aria-hidden="true">
          {COL_X.map((x) => (
            <span key={x} className="what__drop" style={{ left: `${x}%` }} />
          ))}
          <span className="what__rail">
            <span className="what__pulse" />
          </span>
          <span className="what__context-label mono">Shared context</span>
        </div>
      </figure>
    </div>
  )
}
