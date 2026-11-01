import type { Block, MediaMap } from '../content-blocks'
import type { Appearance } from './Appearance'
import type { NamedRef } from './Ref'

export interface VideoGame {
  '@id': string
  id: number
  slug?: string
  title: string
  /** Résumé court en texte brut ; la présentation et le test sont dans `blocks` */
  summary?: string | null
  /** Faux : brouillon, visible des administrateurs uniquement */
  visible: boolean
  videoGameSupport: NamedRef
  /** Détail uniquement */
  blocks?: Block[]
  media?: MediaMap
  /** Détail uniquement : personnages du jeu (sans cartes) */
  characters?: Appearance[]
}
