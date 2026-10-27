import type { CSSProperties } from 'react'
import './ProgressBar.css'

interface Props {
  index: number
  count: number
}

/** Thin violet → orange rule along the bottom edge; advances 1/12 per slide. */
export function ProgressBar({ index, count }: Props) {
  const value = (index + 1) / count
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="Presentation progress"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={index + 1}
      aria-valuetext={`Slide ${index + 1} of ${count}`}
      style={{ '--p': value } as CSSProperties}
    >
      <div className="progress__fill" />
      <div className="progress__head" />
    </div>
  )
}
