import type { MonsterEffect } from '../models/MonsterEffect'
import type { Pagination } from './Pagination'

export interface MonsterEffectsState {
  items: MonsterEffect[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
