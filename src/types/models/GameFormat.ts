import type { Ref } from './Ref'

/** Extension d'un format de jeu, lue avec son nom et sa référence. */
export interface GameFormatExtension extends Ref {
  name: string
  reference: string
}

export interface GameFormat {
  '@id': string
  id: number
  name: string
  slug?: string
  description: string
  /** Lecture seule : les extensions se lient depuis l'extension (`gameFormats`) */
  extensions?: GameFormatExtension[]
}
