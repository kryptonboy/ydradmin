import type { MonsterAttribute } from '../models/MonsterAttribute'
import type { Pagination } from './Pagination'

export interface MonsterAttributesState {
  items: MonsterAttribute[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
