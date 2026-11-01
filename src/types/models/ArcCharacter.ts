import type { NamedRef } from './Ref'

/** Personnage d'un arc. */
export interface ArcCharacter {
  '@id': string
  id: number
  arc: NamedRef
  character: NamedRef
}
