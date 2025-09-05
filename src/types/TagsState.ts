import type { Pagination } from './Pagination'
import type { Tag } from './Tag'

export interface TagsState {
  items: Tag[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
