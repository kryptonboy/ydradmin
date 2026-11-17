export interface Tag {
  /** Résumé pour les moteurs (320 car. max) ; absent des réponses tant qu'il est vide */
  metaDescription?: string | null
  '@id': string
  id: number
  name: string
  /** Généré par l'API depuis le nom (lecture seule) */
  slug?: string
  description: string
  visible: boolean
}
