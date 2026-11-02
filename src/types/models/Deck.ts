import type { NamedRef, Ref } from './Ref'

export type DeckSection = 'main' | 'extra' | 'side'

export const SECTION_LABELS: Record<DeckSection, string> = {
  main: 'Main',
  extra: 'Extra',
  side: 'Side',
}

export interface DeckCard {
  abstractCard: NamedRef
  /** Impression choisie par le joueur (facultative) */
  card?: Ref | null
  section: DeckSection
  quantity: number
  extraDeck?: boolean
}

/** Deck d'un joueur, vu par la modération */
export interface Deck {
  '@id': string
  id: number
  name: string
  description?: string | null
  gameFormat?: NamedRef | null
  public: boolean
  /** Masqué par la modération : plus visible publiquement, son propriétaire le voit encore */
  hidden: boolean
  /** Pseudo du propriétaire */
  author?: string | null
  createdAt?: string
  updatedAt?: string
  cards?: DeckCard[]
}
