import type { NamedRef } from './Ref'

/** Personnage d'un manga, avec son statut de personnage principal et sa position. */
export interface MangaCharacter {
  '@id': string
  id: number
  manga: NamedRef
  character: NamedRef
  mainCharacter: boolean
  position: number
}
