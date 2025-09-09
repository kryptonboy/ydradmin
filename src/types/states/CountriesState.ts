import type { Country } from '../models/Country'
import type { Pagination } from './Pagination'

export interface CountriesState {
  items: Country[]
  loading: boolean
  error: string | null
  pagination: Pagination
}
