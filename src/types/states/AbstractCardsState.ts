import type { AbstractCard } from '../models/AbstractCard'
import type { Pagination } from './Pagination'

export interface AbstractCardsState {
  items: AbstractCard[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
