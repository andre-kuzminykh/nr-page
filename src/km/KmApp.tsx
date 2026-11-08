import type { ComponentType } from 'react'
import { ContactWidget } from '../components/Contact/ContactWidget'
import { Deck } from '../components/Deck/Deck'
import { TopNav } from '../components/Nav/TopNav'
import type { SlideProps } from '../components/SlideController/DeckContext'
import { HOME_URL } from '../config/links'
import type { SlideMeta } from '../data/slides'
import { FaqSlide } from '../slides/Faq/FaqSlide'
import { PricingSlide } from '../slides/Pricing/PricingSlide'
import { KmAccess, KmCases, KmEnd, KmGraph, KmHow, KmOverview, KmReport, KmRules } from './Blocks'
import { KM_FAQ } from './content'
import { KM_NAV, KM_SLIDES } from './slides'

const KmFaq = (p: SlideProps) => <FaqSlide {...p} questions={KM_FAQ} />

const BLOCKS: Record<string, ComponentType<SlideProps>> = {
  overview: KmOverview,
  report: KmReport,
  how: KmHow,
  rules: KmRules,
  graph: KmGraph,
  access: KmAccess,
  cases: KmCases,
  pricing: PricingSlide,
  faq: KmFaq,
  start: KmEnd,
}

const render = (s: SlideMeta, p: SlideProps) => {
  const Block = BLOCKS[s.id]
  return <Block {...p} />
}

const title = (s: SlideMeta, i: number) => (i === 0 ? 'AI Knowledge Management — Neuronium' : `${s.label} — AI Knowledge Management`)

/** The AI Knowledge Management page: a deck of its own, with the landing's motion, menu and light. */
export function KmApp() {
  return (
    <Deck
      slides={KM_SLIDES}
      render={render}
      nav={<TopNav slides={KM_SLIDES} items={KM_NAV} home={HOME_URL} />}
      title={title}
      skip={{ to: 'report', label: 'Skip to the report generator' }}
    >
      <ContactWidget />
    </Deck>
  )
}
