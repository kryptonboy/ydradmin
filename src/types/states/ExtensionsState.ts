import type { Extension } from '../models/Extension'
import type { Pagination } from './Pagination'

export interface ExtensionsState {
  items: Extension[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
