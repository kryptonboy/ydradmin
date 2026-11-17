import type { AbstractCard } from './AbstractCard'
import type { Extension } from './Extension'
import type { Rarity } from './Rarity'

export interface Card {
  /** Résumé pour les moteurs (320 car. max) ; absent des réponses tant qu'il est vide */
  metaDescription?: string | null
  '@id': string
  id: number
  name: string
  /** Généré par l'API depuis le nom (lecture seule) */
  slug?: string
  description?: string
  reference: string
  code?: string
  image?: { '@id': string; id?: number; contentUrl?: string | null } | null
  bbCodeDescription?: string
  pendulumDescription?: string
  bbCodePendulumDescription?: string
  abstractCard: AbstractCard
  extension: Extension
  rarities: Rarity[]
}
