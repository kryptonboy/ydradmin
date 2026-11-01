import type { NamedRef, SeasonRef } from './Ref'

export interface ArcSeason {
  '@id': string
  id: number
  arc: NamedRef
  season: SeasonRef
}
