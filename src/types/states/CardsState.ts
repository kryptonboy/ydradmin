import type { Card } from '../models/Card'
import type { Pagination } from './Pagination'

export interface CardsState {
  items: Card[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
