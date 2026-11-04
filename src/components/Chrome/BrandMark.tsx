/** Neuronium mark: the Nr element tile — two letters, nothing else. */
export function BrandMark({ size = 40, title }: { size?: number; title?: string }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="100" height="100" rx="20" fill="#000" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fill="#fff"
        fontSize="52"
        fontWeight="700"
        textLength="62"
        lengthAdjust="spacingAndGlyphs"
        className="brand-mark__text"
      >
        Nr
      </text>
    </svg>
  )
}
