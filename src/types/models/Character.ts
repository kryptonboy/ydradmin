import type { NamedRef } from './Ref'

export interface Character {
  '@id': string
  id: number
  name: string
  slug?: string
  japaneseName?: string | null
  romanizedJapaneseName?: string | null
  astrologicalSign?: NamedRef | null
  description?: string | null
  gender: NamedRef
  height?: string | null
  weight?: string | null
  hairColor?: string | null
  eyeColor?: string | null
  birthDate?: string | null
  photo?: { '@id': string; id?: number; contentUrl?: string | null } | null
  banner?: { '@id': string; id?: number; contentUrl?: string | null } | null
}
