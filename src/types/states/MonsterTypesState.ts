import type { MonsterType } from '../models/MonsterType'
import type { Pagination } from './Pagination'

export interface MonsterTypesState {
  items: MonsterType[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
