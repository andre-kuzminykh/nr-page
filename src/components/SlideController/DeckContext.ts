import { createContext, useContext } from 'react'

export interface DeckApi {
  index: number
  count: number
  goTo: (id: string) => void
  reducedMotion: boolean
}

export const DeckContext = createContext<DeckApi>({
  index: 0,
  count: 0,
  goTo: () => {},
  reducedMotion: false,
})

export const useDeck = () => useContext(DeckContext)

export interface SlideProps {
  /** The slide is the current one. */
  active: boolean
  /** The slide's content is revealed (true while active and during its exit transition). */
  shown: boolean
}
