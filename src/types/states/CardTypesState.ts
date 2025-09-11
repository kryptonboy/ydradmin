import type { CardType } from '../models/CardType'
import type { Pagination } from './Pagination'

export interface CardTypesState {
  items: CardType[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
