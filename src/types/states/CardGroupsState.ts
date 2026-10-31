import type { CardGroup } from '../models/CardGroup'
import type { Pagination } from './Pagination'

export interface CardGroupsState {
  items: CardGroup[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
