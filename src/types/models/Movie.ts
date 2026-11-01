import type { Block, MediaMap } from '../content-blocks'
import type { Appearance } from './Appearance'
import type { MediaLink } from './Ref'

export interface Movie {
  '@id': string
  id: number
  slug?: string
  title: string
  /** Résumé court en texte brut ; le résumé complet est dans `blocks` */
  synopsis?: string | null
  /** Faux : brouillon, visible des administrateurs uniquement */
  visible: boolean
  japaneseName?: string | null
  romanizedJapaneseName?: string | null
  usReleaseDate?: string | null
  japanReleaseDate?: string | null
  europeReleaseDate?: string | null
  coverImage?: MediaLink | null
  titleImage?: MediaLink | null
  /** Détail uniquement */
  blocks?: Block[]
  media?: MediaMap
  /** Détail uniquement : personnages du film triés par position, avec leurs cartes */
  characters?: Appearance[]
}
