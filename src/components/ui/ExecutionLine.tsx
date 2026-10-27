import type { CSSProperties } from 'react'
import { EXECUTION } from '../../data/architecture'
import { EXECUTION_ICON } from './icons'
import './ExecutionLine.css'

interface Props {
  delay?: number
  className?: string
  lead?: string
}

/** One slim horizontal line: [icon] AI Agents · [icon] AI Workflows · [icon] AI Skills */
export function ExecutionLine({ delay = 0, className = '', lead }: Props) {
  return (
    <div className={`exec-line ${className}`}>
      {lead && (
        <span className="exec-line__lead rv rv--fade" style={{ '--d': delay } as CSSProperties}>
          {lead}
        </span>
      )}
      <ul className="exec-line__list" aria-label="Every AI Employee uses">
        {EXECUTION.map((unit, i) => {
          const Icon = EXECUTION_ICON[unit.id]
          return (
            <li key={unit.id} className="exec-line__item rv" style={{ '--d': delay + 60 + i * 70 } as CSSProperties}>
              <Icon size={14} strokeWidth={1.6} aria-hidden="true" />
              <span>{unit.name}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
