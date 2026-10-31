import type { AbstractCardInput } from '../api-types'

// TODO: monsterEffects et tags sont envoyés mais ignorés par l'API (absents de AbstractCardInput côté backend)
export type AbstractCardForm = AbstractCardInput & {
  monsterEffects: string[]
  tags: string[]
}
