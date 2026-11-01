import type { Ref } from './Ref'

export interface GameFormat {
  '@id': string
  id: number
  name: string
  slug?: string
  description: string
  /** Lecture seule : les extensions sont liées depuis l'extension (identifiants seulement) */
  extensions?: Ref[]
}
