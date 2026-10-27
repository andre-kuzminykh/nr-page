import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { TopBar } from './components/Chrome/TopBar'
import { LightField } from './components/LightField/LightField'
import { ProgressBar } from './components/ProgressBar/ProgressBar'
import { DeckContext, type DeckApi, type SlideProps } from './components/SlideController/DeckContext'
import { Slide } from './components/SlideController/Slide'
import { TRANSITION_MS, useSlideController } from './components/SlideController/useSlideController'
import { SLIDES, slideIndex } from './data/slides'
import { useReducedMotion } from './hooks/useReducedMotion'
import { ArchitectureSlide } from './slides/Architecture/ArchitectureSlide'
import { BusinessContextSlide } from './slides/BusinessContext/BusinessContextSlide'
import { BusinessTypesSlide } from './slides/BusinessTypes/BusinessTypesSlide'
import { CapabilitiesSlide } from './slides/Capabilities/CapabilitiesSlide'
import { ConfigurationSlide } from './slides/Configuration/ConfigurationSlide'
import { EmployeesSlide } from './slides/Employees/EmployeesSlide'
import { ExecutionSlide } from './slides/Execution/ExecutionSlide'
import { FinalSlide } from './slides/Final/FinalSlide'
import { HeroSlide } from './slides/Hero/HeroSlide'
import { ManagementSlide } from './slides/Management/ManagementSlide'
import { WhatIsSlide } from './slides/WhatIs/WhatIsSlide'
import { WorkflowSlide } from './slides/Workflow/WorkflowSlide'

const COMPONENTS: Record<string, ComponentType<SlideProps>> = {
  hero: HeroSlide,
  what: WhatIsSlide,
  architecture: ArchitectureSlide,
  'business-types': BusinessTypesSlide,
  employees: EmployeesSlide,
  management: ManagementSlide,
  workflow: WorkflowSlide,
  execution: ExecutionSlide,
  context: BusinessContextSlide,
  capabilities: CapabilitiesSlide,
  configuration: ConfigurationSlide,
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
      index === 0 ? 'Neuronium — Run AI Workplaces.' : `${SLIDES[index].label} — Neuronium`
  }, [index])

  useEffect(() => {
    const onHash = () => go(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [go])

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

  const goTo = useCallback((id: string) => go(slideIndex(id)), [go])
  const api = useMemo<DeckApi>(
    () => ({ index, count, goTo, reducedMotion }),
    [index, count, goTo, reducedMotion],
  )

  return (
    <DeckContext.Provider value={api}>
      <a className="skip-link" href="#capabilities" onClick={(e) => { e.preventDefault(); goTo('capabilities') }}>
        Skip to capabilities
      </a>
      <LightField preset={SLIDES[index].light} reducedMotion={reducedMotion} pulseKey={index} />
      <TopBar onHome={() => go(0)} />
      <main className="stage" aria-roledescription="carousel" aria-label="Neuronium">
        {SLIDES.map((s, i) => {
          const Component = COMPONENTS[s.id]
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
              shown={shown.includes(i)}
              className={`slide--${s.id}`}
            >
              <Component active={i === index} shown={shown.includes(i)} />
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
