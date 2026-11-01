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
}

/** Carte listée une seule fois, avec son nombre d'apparitions (`GET /{ressource}/{id}/cards`). */
export interface UsedCard {
  '@id': string
  id: number
  name: string
  usageCount: number
}
