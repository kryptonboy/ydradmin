import type { NamedRef, Ref } from './Ref'

/** Impression de carte embarquée dans un prix (l'API peut n'envoyer que l'IRI) */
export type CardPriceCard = Ref & {
  name?: string
  reference?: string
  extension?: NamedRef
}

/** Prix de référence d'une impression dans une rareté, en euros */
export interface CardPrice {
  '@id': string
  id: number
  card: CardPriceCard
  rarity: NamedRef
  amount: number
  updatedAt?: string
}

/** Point de la courbe de prix : montant à partir de la date d'enregistrement (jamais modifié) */
export interface CardPriceHistory {
  '@id': string
  id: number
  card?: CardPriceCard
  rarity?: NamedRef
  amount: number
  recordedAt?: string
}
