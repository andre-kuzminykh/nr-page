import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { LightField } from './components/LightField/LightField'
import { TopNav } from './components/Nav/TopNav'
import { ProgressBar } from './components/ProgressBar/ProgressBar'
import { DeckContext, type DeckApi, type SlideProps } from './components/SlideController/DeckContext'
import { Slide } from './components/SlideController/Slide'
import { TRANSITION_MS, useSlideController } from './components/SlideController/useSlideController'
import { SLIDES, slideIndex } from './data/slides'
import { useReducedMotion } from './hooks/useReducedMotion'
import { ContextSlide } from './slides/Context/ContextSlide'
import { CustomSlide } from './slides/Custom/CustomSlide'
import { DepartmentSlide } from './slides/Department/DepartmentSlide'
import { EmployeesSlide } from './slides/Employees/EmployeesSlide'
import { FaqSlide } from './slides/Faq/FaqSlide'
import { FinalSlide } from './slides/Final/FinalSlide'
import { HeroSlide } from './slides/Hero/HeroSlide'
import { PricingSlide } from './slides/Pricing/PricingSlide'

const COMPONENTS: Record<string, ComponentType<SlideProps>> = {
  hero: HeroSlide,
  context: ContextSlide,
  employees: EmployeesSlide,
  custom: CustomSlide,
  pricing: PricingSlide,
  faq: FaqSlide,
  start: FinalSlide,
}

const fromHash = () => {
  const i = slideIndex(decodeURIComponent(window.location.hash.slice(1)))
  return i < 0 ? 0 : i
}

export function App() {
  const count = SLIDES.length
  const [initial] = useState(fromHash)
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
    const hash = `#${SLIDES[index].id}`
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
    document.title =
      index === 0 ? 'Neuronium — AI Operating System' : `${SLIDES[index].label} — Neuronium`
  }, [index])

  useEffect(() => {
    const onHash = () => {
      const i = slideIndex(decodeURIComponent(window.location.hash.slice(1)))
      // a link to a block that is not open yet goes nowhere
      if (i >= 0) go(i)
      else history.replaceState(null, '', `#${SLIDES[index].id}`)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [go, index])

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
      const i = slideIndex(id)
      if (i >= 0) go(i)
    },
    [go],
  )
  const api = useMemo<DeckApi>(
    () => ({ index, count, goTo, reducedMotion }),
    [index, count, goTo, reducedMotion],
  )

  return (
    <DeckContext.Provider value={api}>
      <a className="skip-link" href="#context" onClick={(e) => { e.preventDefault(); goTo('context') }}>
        Skip to the platform
      </a>
      <LightField preset={SLIDES[index].light} reducedMotion={reducedMotion} pulseKey={index} />
      <TopNav />
      <main className="stage" aria-roledescription="carousel" aria-label="Neuronium">
        {SLIDES.map((s, i) => {
          const Component = COMPONENTS[s.id]
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
              {s.department ? (
                <DepartmentSlide department={s.department} active={isActive} shown={isShown} />
              ) : (
                <Component active={isActive} shown={isShown} />
              )}
            </Slide>
          )
        })}
      </main>
      <ProgressBar index={index} count={count} />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Slide ${index + 1} of ${count}: ${SLIDES[index].label}`}
      </p>
    </DeckContext.Provider>
  )
}
