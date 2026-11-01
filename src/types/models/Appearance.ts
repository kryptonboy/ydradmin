import type { ApiCardUsage } from '../api-types'

/** Un personnage dans un épisode ou un chapitre, avec les cartes qu'il y utilise. */
export interface Appearance {
  '@id'?: string
  id: number
  character: {
    '@id'?: string
    id: number
    name: string
    slug?: string
    photo?: { contentUrl?: string | null } | null
  }
  cards?: { '@id'?: string; id: number; name?: string }[]
  /** Films uniquement : personnage principal et ordre d'apparition */
  mainCharacter?: boolean
  position?: number
}

/** Carte listée une seule fois, avec son nombre d'apparitions (`GET /{ressource}/{id}/cards`). */
export type UsedCard = ApiCardUsage
