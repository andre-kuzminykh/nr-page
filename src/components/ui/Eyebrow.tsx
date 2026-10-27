import type { CSSProperties } from 'react'

interface Props {
  index: number
  children: string
  delay?: number
}

/** "03 — Complete architecture" — mono section marker. */
export function Eyebrow({ index, children, delay = 0 }: Props) {
  return (
    <p className="eyebrow rv" style={{ '--d': delay } as CSSProperties}>
      <span className="eyebrow__num">{String(index).padStart(2, '0')}</span>
      <span className="eyebrow__rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
