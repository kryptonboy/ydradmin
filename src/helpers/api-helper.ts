import type { Filters, PaginatedApiResponse, Sort } from '@/types/Api'
import type { Pagination } from '@/types/states/Pagination'

export function buildApiPlatformQuery(filters: Filters, sort: Sort, page: number): string {
  const params = new URLSearchParams()

  Object.entries(filters)
    .filter(([_, value]) => value !== null && value !== undefined)
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(`${key}[]`, String(v)))
      } else {
        params.set(key, String(value))
      }
    })

  params.set('order[' + sort.sortBy + ']', sort.sortDir)
  params.set('page', page.toString())

  return params.toString()
}

export function hydratePaginatedState<T>(
  state: { items: T[]; pagination: Pagination },
  data: PaginatedApiResponse<T>,
) {
  state.items = data.member ?? []
  state.pagination.totalItems = data.totalItems ?? state.items.length
  state.pagination.firstPage = data.view?.first ?? null
  state.pagination.previousPage = data.view?.previous ?? null
  state.pagination.nextPage = data.view?.next ?? null
  state.pagination.lastPage = data.view?.last ?? null
}

export function toApiPayload<T extends Record<string, any>>(form: T): Record<string, any> {
  const payload: Record<string, any> = {}

  for (const key in form) {
    const value = form[key]
    if (value && typeof value === 'object' && '@id' in value) {
      // Gestion ToOne
      payload[key] = value['@id']
    } else if (
      Array.isArray(value) &&
      value.every((v: any) => typeof v === 'object' && '@id' in v)
    ) {
      // Gestion ToMany
      payload[key] = value.map((v: any) => v['@id'])
    } else {
      payload[key] = value
    }
  }

  return payload
}
