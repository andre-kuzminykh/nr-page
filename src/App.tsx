import type { ComponentType } from 'react'
import { ContactWidget } from './components/Contact/ContactWidget'
import { Deck } from './components/Deck/Deck'
import { TopNav } from './components/Nav/TopNav'
import type { SlideProps } from './components/SlideController/DeckContext'
import { SLIDES, type SlideMeta } from './data/slides'
import { CasesSlide } from './slides/Cases/CasesSlide'
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
  cases: CasesSlide,
  pricing: PricingSlide,
  faq: FaqSlide,
  start: FinalSlide,
}

const render = (s: SlideMeta, p: SlideProps) => {
  if (s.department) return <DepartmentSlide department={s.department} {...p} />
  const Component = COMPONENTS[s.id]
  return <Component {...p} />
}

const title = (s: SlideMeta, i: number) => (i === 0 ? 'Neuronium — AI Operating System' : `${s.label} — Neuronium`)

/** The landing: its blocks, in the deck. */
export function App() {
  return (
    <Deck slides={SLIDES} render={render} nav={<TopNav />} title={title} skip={{ to: 'context', label: 'Skip to the platform' }}>
      <ContactWidget />
    </Deck>
  )
}
