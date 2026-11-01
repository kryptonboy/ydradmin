import type { Ref } from './Ref'

export interface ActualityComment {
  '@id': string
  id: number
  content: string
  hidden?: boolean
  /** Pseudo de l'auteur : le compte utilisateur n'est pas exposé */
  author?: string
  actuality: Ref
  actualityTitle?: string
  postedAt?: string | null
}
