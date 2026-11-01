import type { NamedRef } from './Ref'

export interface Arc {
  '@id': string
  id: number
  name: string
  slug?: string
  synopsis?: string | null
  position?: number | null
  anime: NamedRef
}
