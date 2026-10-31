import type { Rarity } from '../models/Rarity'
import type { Pagination } from './Pagination'

export interface RaritiesState {
  items: Rarity[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
