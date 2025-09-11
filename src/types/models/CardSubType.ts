import type { CardType } from './CardType'

export interface CardSubType {
  '@id': string
  id: number
  name: string
  position: number
  cssClass: string
  cardType: CardType
  icon?: string
}
