import type { Block, MediaMap } from '../content-blocks'
import type { Appearance } from './Appearance'
import type { Ref } from './Ref'

export interface Episode {
  '@id': string
  id: number
  episodeNumber?: number | null
  title: string
  synopsis?: string | null
  /** Faux : brouillon, visible des administrateurs uniquement */
  visible: boolean
  japaneseTitle?: string | null
  romanizedJapaneseTitle?: string | null
  arcSeason: Ref
  /** Déduits de `arcSeason` par l'API (identifiants seulement) */
  arc?: Ref | null
  season?: Ref | null
  anime?: Ref | null
  /** Détail uniquement */
  blocks?: Block[]
  media?: MediaMap
  characters?: Appearance[]
}
