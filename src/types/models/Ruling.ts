import type { NamedRef } from './Ref'

export interface Ruling {
  /** Résumé pour les moteurs (320 car. max) ; absent des réponses tant qu'il est vide */
  metaDescription?: string | null
  '@id': string
  id: number
  name: string
  slug?: string
  /** Texte du ruling */
  ruling: string
  /** Cartes concernées, lues avec leur nom (le lien appartient à la carte abstraite) */
  abstractCards?: NamedRef[]
}
