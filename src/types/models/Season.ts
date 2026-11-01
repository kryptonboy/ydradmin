import type { Ref } from './Ref'

export interface Season {
  '@id': string
  id: number
  seasonNumber?: number | null
  synopsis?: string | null
  anime: Ref
}
