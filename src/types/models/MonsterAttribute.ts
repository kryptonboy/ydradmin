import type { MediaLink } from './Ref'

export interface MonsterAttribute {
  '@id': string
  id: number
  name: string
  icon?: MediaLink | null
}
