/**
 * Neuronium logo — the "Nr" element tile: atomic number 0, symbol Nr, name Neuronium.
 * Drawn as SVG so it stays crisp at any size; text widths are fixed with textLength.
 */
export function BrandMark({ size = 44, title }: { size?: number; title?: string }) {
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
      <rect width="100" height="100" rx="13" fill="#000" />
      <text x="18.5" y="23" fill="#fff" fontSize="11.5" fontWeight="500" className="brand-mark__text">
        0
      </text>
      <text
        x="17"
        y="68"
        fill="#fff"
        fontSize="52"
        fontWeight="700"
        textLength="66"
        lengthAdjust="spacingAndGlyphs"
        className="brand-mark__text"
      >
        Nr
      </text>
      <text
        x="18"
        y="86.5"
        fill="#fff"
        fontSize="12.5"
        fontWeight="600"
        textLength="65"
        lengthAdjust="spacingAndGlyphs"
        className="brand-mark__text"
      >
        Neuronium
      </text>
    </svg>
  )
}
