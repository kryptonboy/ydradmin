import type { NamedRef } from './Ref'

/** Nombre d'exemplaires autorisés d'un groupe de cartes dans un format : 0, 1 ou 2. */
export type LimitNumber = 0 | 1 | 2

export interface Restriction {
  '@id': string
  id: number
  cardGroup: NamedRef
  gameFormat: NamedRef
  limitNumber: number
}

export const LIMIT_LABELS: Record<LimitNumber, string> = {
  0: 'Interdite (0)',
  1: 'Limitée (1)',
  2: 'Semi-limitée (2)',
}
