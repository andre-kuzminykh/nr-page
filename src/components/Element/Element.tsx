import type { CSSProperties } from 'react'
import './Element.css'

/** Family colour for each AI Employee row, sampled along the brand gradient. */
export const FAMILY = ['#8b55f6', '#a24cf5', '#b944f3', '#cf3fe0', '#e23fc0', '#ef43a3', '#f44f8a', '#f66173', '#f8745f', '#f9894b']

interface Props {
  n: number
  symbol: string
  name?: string
  family?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

/** A capability drawn as a chemical element — the same language as the Nr logo (element 0). */
export function Element({ n, symbol, name, family, size = 'md', className = '' }: Props) {
  return (
    <span
      className={`el el--${size} ${className}`}
      style={family === undefined ? undefined : ({ '--fam': FAMILY[family] } as CSSProperties)}
      aria-hidden="true"
    >
      <span className="el__n">{n}</span>
      <span className="el__sym">{symbol}</span>
      {name && <span className="el__name">{name}</span>}
    </span>
  )
}
