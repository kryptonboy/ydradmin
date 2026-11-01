import type { MediaLink } from './Ref'

export interface CardType {
  '@id': string
  id: number
  name: string
  position: number
  icon?: MediaLink | null
}
