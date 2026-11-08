import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SlideMeta } from '../../data/slides'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { LightField } from '../LightField/LightField'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import { DeckContext, type DeckApi, type SlideProps } from '../SlideController/DeckContext'
import { Slide } from '../SlideController/Slide'
import { TRANSITION_MS, useSlideController } from '../SlideController/useSlideController'

export interface DeckProps {
  slides: SlideMeta[]
  /** One block's content. */
  render: (s: SlideMeta, p: SlideProps) => ReactNode
  /** The top menu. */
  nav: ReactNode
  /** The document title while a block is current. */
  title: (s: SlideMeta, index: number) => string
  /** The skip link: where it jumps and what it says. */
  skip: { to: string; label: string }
  /** Anything fixed over the deck (e.g. the “Write to us” widget). */
  children?: ReactNode
}

/**
 * A deck of full-screen blocks: one gesture turns one block, over one continuous light field.
 * The landing and the AI Knowledge Management page are both decks.
 */
export function Deck({ slides, render, nav, title, skip, children }: DeckProps) {
  const count = slides.length
  const indexOf = useCallback((id: string) => slides.findIndex((s) => s.id === id), [slides])
  const [initial] = useState(() => {
    const i = indexOf(decodeURIComponent(window.location.hash.slice(1)))
    return i < 0 ? 0 : i
  })
  const { index, go } = useSlideController(count, initial)
  const reducedMotion = useReducedMotion()
  const [shown, setShown] = useState<number[]>([initial])
  const refs = useRef<(HTMLElement | null)[]>([])
  // Reveal the arriving slide now; reset the departing one once it has left the screen,
  // so its content animates in again on the next visit.
  useEffect(() => {
    setShown((s) => (s.includes(index) ? s : [...s, index]))
    const t = window.setTimeout(() => setShown([index]), TRANSITION_MS + 80)
    return () => window.clearTimeout(t)
  }, [index])

  // Deep links: keep the hash in sync, and follow manual hash changes.
  useEffect(() => {
    const hash = `#${slides[index].id}`
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
    document.title = title(slides[index], index)
  }, [index, slides, title])

  useEffect(() => {
    const onHash = () => {
      const i = indexOf(decodeURIComponent(window.location.hash.slice(1)))
      // a link to a block that is not open yet goes nowhere
      if (i >= 0) go(i)
      else history.replaceState(null, '', `#${slides[index].id}`)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [go, index, indexOf, slides])

  // Keyboard & screen-reader continuity: focus follows the slide when it was left behind.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = refs.current[index]
    const activeEl = document.activeElement
    if (!el || (activeEl && activeEl !== document.body && el.contains(activeEl))) return
    const inStage = activeEl?.closest('[data-slide]')
    if (activeEl === document.body || inStage) el.focus({ preventScroll: true })
  }, [index])

  // The stage never scrolls; undo any scroll the browser applies (e.g. focus or fragment jumps).
  useEffect(() => {
    const pin = (e: Event) => {
      const el = e.target as HTMLElement
      if ((el.id === 'root' || el.classList?.contains('stage') || el.dataset?.slide !== undefined) && (el.scrollTop || el.scrollLeft)) {
        el.scrollTop = 0
        el.scrollLeft = 0
      }
    }
    document.addEventListener('scroll', pin, true)
    return () => document.removeEventListener('scroll', pin, true)
  }, [])

  // a link to a block that is not open yet goes nowhere
  const goTo = useCallback(
    (id: string) => {
      const i = indexOf(id)
      if (i >= 0) go(i)
    },
    [go, indexOf],
  )
  const api = useMemo<DeckApi>(
    () => ({ index, count, goTo, reducedMotion }),
    [index, count, goTo, reducedMotion],
  )

  return (
    <DeckContext.Provider value={api}>
      <a
        className="skip-link"
        href={`#${skip.to}`}
        onClick={(e) => {
          e.preventDefault()
          goTo(skip.to)
        }}
      >
        {skip.label}
      </a>
      <LightField preset={slides[index].light} reducedMotion={reducedMotion} pulseKey={index} />
      {nav}
      <main className="stage" aria-roledescription="carousel" aria-label="Neuronium">
        {slides.map((s, i) => {
          const isActive = i === index
          const isShown = shown.includes(i)
          const state = i === index ? 'active' : i < index ? 'before' : 'after'
          return (
            <Slide
              key={s.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              id={s.id}
              label={s.label}
              position={i}
              total={count}
              state={state}
              shown={isShown}
              className={`slide--${s.id}`}
            >
              {render(s, { active: isActive, shown: isShown })}
            </Slide>
          )
        })}
      </main>
      <ProgressBar index={index} count={count} />
      {children}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${index + 1} of ${count}: ${slides[index].label}`}
      </p>
    </DeckContext.Provider>
  )
}
