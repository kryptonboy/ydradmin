import type { Block, MediaMap } from '../content-blocks'
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
  /** Détail uniquement : contenu en blocs et médias qu'il référence */
  blocks?: Block[]
  media?: MediaMap
}
