import type { ExtensionType } from '../models/ExtensionType'
import type { Pagination } from './Pagination'

export interface ExtensionTypesState {
  items: ExtensionType[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
