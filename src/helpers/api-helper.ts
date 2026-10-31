import type { Filters, Sort } from '@/types/Api'

export function buildApiPlatformQuery(filters: Filters, sort: Sort, page: number): string {
  const params = new URLSearchParams()

  Object.entries(filters)
    .filter(([, value]) => value !== null && value !== undefined)
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

type IriObject = { '@id': string }

function isIriObject(value: unknown): value is IriObject {
  return typeof value === 'object' && value !== null && '@id' in value
}

export function toApiPayload<T extends object>(form: T): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(form)) {
    if (isIriObject(value)) {
      // Gestion ToOne
      payload[key] = value['@id']
    } else if (Array.isArray(value) && value.length > 0 && value.every(isIriObject)) {
      // Gestion ToMany
      payload[key] = value.map((v) => v['@id'])
    } else {
      payload[key] = value
    }
  }

  return payload
}
