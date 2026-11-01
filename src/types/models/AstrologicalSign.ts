export interface AstrologicalSign {
  '@id': string
  id: number
  name: string
  slug?: string
  icon?: { '@id': string; id?: number; contentUrl?: string | null } | null
  startMonth?: number
  startDay?: number
  endMonth?: number
  endDay?: number
}
