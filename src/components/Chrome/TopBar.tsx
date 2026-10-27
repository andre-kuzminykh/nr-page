import { BrandMark } from './BrandMark'
import './Chrome.css'

interface Props {
  onHome: () => void
}

/** Transparent top line with the Nr logo only — no header block, no counters. */
export function TopBar({ onHome }: Props) {
  return (
    <header className="topbar">
      <a
        className="topbar__brand"
        href="#hero"
        onClick={(e) => {
          e.preventDefault()
          onHome()
        }}
        aria-label="Neuronium — back to start"
      >
        <span className="topbar__logo">
          <BrandMark />
        </span>
      </a>
    </header>
  )
}
