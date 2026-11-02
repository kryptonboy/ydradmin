import type { MediaLink } from './Ref'
import type { CardType } from './CardType'

export interface CardSubType {
  '@id': string
  id: number
  name: string
  position: number
  cssClass: string
  /** La carte de ce sous-type va dans l'Extra Deck (Fusion, Synchro, Xyz, Lien) */
  extraDeck: boolean
  cardType: CardType
  icon?: MediaLink | null
}
