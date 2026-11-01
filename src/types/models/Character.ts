import type { Ref } from './Ref'

export interface Character {
  '@id': string
  id: number
  name: string
  slug?: string
  japaneseName?: string | null
  romanizedJapaneseName?: string | null
  astrologicalSign?: Ref | null
  description?: string | null
  gender: Ref
  height?: string | null
  weight?: string | null
  hairColor?: string | null
  eyeColor?: string | null
  birthDate?: string | null
  photo?: { '@id': string; id?: number; contentUrl?: string | null } | null
  banner?: { '@id': string; id?: number; contentUrl?: string | null } | null
}
