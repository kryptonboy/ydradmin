import type { MediaLink } from './Ref'

export interface AstrologicalSign {
  '@id': string
  id: number
  name: string
  slug?: string
  icon?: MediaLink | null
  startMonth?: number
  startDay?: number
  endMonth?: number
  endDay?: number
}
