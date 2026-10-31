import type { AbstractCard } from './AbstractCard'
import type { Extension } from './Extension'
import type { Rarity } from './Rarity'

export interface Card {
  '@id': string
  id: number
  name: string
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
