import type { NamedRef } from './Ref'

export interface Ruling {
  '@id': string
  id: number
  name: string
  slug?: string
  /** Texte du ruling */
  ruling: string
  /** Cartes concernées, lues avec leur nom (le lien appartient à la carte abstraite) */
  abstractCards?: NamedRef[]
}
