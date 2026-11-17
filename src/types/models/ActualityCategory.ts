export interface ActualityCategory {
  /** Résumé pour les moteurs (320 car. max) ; absent des réponses tant qu'il est vide */
  metaDescription?: string | null
  '@id': string
  id: number
  label: string
  slug?: string
  active: boolean
}
