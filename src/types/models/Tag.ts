export interface Tag {
  '@id': string
  id: number
  name: string
  /** Généré par l'API depuis le nom (lecture seule) */
  slug?: string
  description: string
  visible: boolean
}
