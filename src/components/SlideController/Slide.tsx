import { forwardRef, type ReactNode } from 'react'

interface Props {
  id: string
  label: string
  position: number
  total: number
  state: 'active' | 'before' | 'after'
  shown: boolean
  className?: string
  children: ReactNode
}

/** A full-screen module. Inactive slides are inert: invisible to assistive tech and Tab. */
export const Slide = forwardRef<HTMLElement, Props>(function Slide(
  { id, label, position, total, state, shown, className, children },
  ref,
) {
  const active = state === 'active'
  return (
    <section
      ref={ref}
      id={`slide-${id}`}
      data-slide={position}
      data-state={state}
      data-shown={shown || undefined}
      className={`slide ${className ?? ''}`}
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${total}: ${label}`}
      inert={!active}
      tabIndex={-1}
    >
      {children}
    </section>
  )
})
