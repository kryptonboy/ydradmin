import type { Block, MediaMap } from '../content-blocks'
import type { ActualityCategory } from './ActualityCategory'

export interface Actuality {
  /** Résumé pour les moteurs (320 car. max) ; absent des réponses tant qu'il est vide */
  metaDescription?: string | null
  /** Texte alternatif de l'image de couverture (255 car. max) ; absent tant qu'il est vide */
  imageAlt?: string | null
  /** Auteur affiché de l'article (120 car. max), saisi par la rédaction : pas un lien vers un compte */
  authorName?: string | null
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
