import type { Block, MediaMap } from '../content-blocks'
import type { ChapterRef } from './Ref'

export interface Manga {
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
  chapters?: ChapterRef[]
  /** Détail uniquement : contenu en blocs et médias qu'il référence */
  blocks?: Block[]
  media?: MediaMap
}
