import type { Block, MediaMap } from '../content-blocks'
import type { ActualityCategory } from './ActualityCategory'

export interface Actuality {
  '@id': string
  id: number
  title: string
  slug?: string
  headnote: string
  image?: { '@id': string; id?: number; contentUrl?: string | null } | null
  commentable: boolean
  visible: boolean
  publishedAt?: string | null
  /** Dans une actualité, la catégorie est embarquée sans son champ `active` */
  actualityCategory?: Omit<ActualityCategory, 'active'> | null
  /** Détail uniquement */
  blocks?: Block[]
  /** Détail uniquement : médias référencés par les blocs, indexés par identifiant */
  media?: MediaMap
}
