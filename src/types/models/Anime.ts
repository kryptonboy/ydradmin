import type { NamedRef, SeasonRef } from './Ref'

export interface Anime {
  '@id': string
  id: number
  name: string
  slug?: string
  synopsis?: string | null
  japaneseName?: string | null
  romanizedJapaneseName?: string | null
  usReleaseDate?: string | null
  japanReleaseDate?: string | null
  europeReleaseDate?: string | null
  arcs?: NamedRef[]
  seasons?: SeasonRef[]
}
