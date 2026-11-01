import type { MediaLink } from './Ref'

export interface Smiley {
  '@id': string
  id: number
  /** Texte tapé dans un commentaire pour obtenir l'image, ex. `:)` */
  code: string
  image?: MediaLink | null
}
