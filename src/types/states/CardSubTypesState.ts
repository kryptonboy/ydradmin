import type { CardSubType } from '../models/CardSubType'
import type { Pagination } from './Pagination'

export interface CardSubTypesState {
  items: CardSubType[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
