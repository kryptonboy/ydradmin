import type { Ref } from './Ref'

export interface ArcSeason {
  '@id': string
  id: number
  arc: Ref
  season: Ref
}
