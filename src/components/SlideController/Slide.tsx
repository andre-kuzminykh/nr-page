import { forwardRef, useCallback, useRef, type ReactNode } from 'react'
import { useFitToHeight } from '../../hooks/useFitToHeight'

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
  const own = useRef<HTMLElement | null>(null)
  const setRef = useCallback(
    (el: HTMLElement | null) => {
      own.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) ref.current = el
    },
    [ref],
  )
  // a block never scrolls inside: too tall a block is drawn smaller
  useFitToHeight(own, active)
  return (
    <section
      ref={setRef}
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
