import type { Ref } from './Ref'

export interface Arc {
  '@id': string
  id: number
  name: string
  slug?: string
  synopsis?: string | null
  position?: number | null
  anime: Ref
}
