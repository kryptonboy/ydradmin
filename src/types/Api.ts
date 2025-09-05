export interface Filters {
  [key: string]: string | number | boolean | null | (string | number)[]
}

export interface Sort {
  sortBy: string
  sortDir: 'asc' | 'desc'
}

export interface PaginatedApiResponse<T> {
  member?: T[]
  totalItems?: number
  view?: {
    first?: string
    previous?: string
    next?: string
    last?: string
  }
}
