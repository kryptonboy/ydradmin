import type { MonsterSubType } from '../models/MonsterSubType'
import type { Pagination } from './Pagination'

export interface MonsterSubTypesState {
  items: MonsterSubType[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
