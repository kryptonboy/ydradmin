import type { Block, MediaMap } from '../content-blocks'
import type { Appearance } from './Appearance'
import type { NamedRef } from './Ref'

export interface Chapter {
  '@id': string
  id: number
  slug?: string
  title: string
  shortSummary?: string | null
  /** Faux : brouillon, visible des administrateurs uniquement */
  visible: boolean
  chapterNumber?: number | null
  japaneseTitle?: string | null
  romanizedJapaneseTitle?: string | null
  manga: NamedRef
  /** Détail uniquement */
  blocks?: Block[]
  media?: MediaMap
  characters?: Appearance[]
}
