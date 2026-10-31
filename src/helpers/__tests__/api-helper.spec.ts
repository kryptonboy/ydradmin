import { describe, expect, it } from 'vitest'
import { buildApiPlatformQuery, toApiPayload } from '../api-helper'

describe('buildApiPlatformQuery', () => {
  it('ignore les filtres nuls et ajoute tri et page', () => {
    const query = buildApiPlatformQuery(
      { name: 'dragon', reference: null },
      { sortBy: 'name', sortDir: 'desc' },
      2,
    )
    const params = new URLSearchParams(query)

    expect(params.get('name')).toBe('dragon')
    expect(params.has('reference')).toBe(false)
    expect(params.get('order[name]')).toBe('desc')
    expect(params.get('page')).toBe('2')
  })

  it('répète les filtres tableau avec le suffixe []', () => {
    const query = buildApiPlatformQuery({ tags: [1, 2] }, { sortBy: 'id', sortDir: 'asc' }, 1)

    expect(new URLSearchParams(query).getAll('tags[]')).toEqual(['1', '2'])
  })
})

describe('toApiPayload', () => {
  it('remplace les relations par leur IRI', () => {
    const payload = toApiPayload({
      name: 'Carte',
      extension: { '@id': '/api/extensions/1' },
      rarities: [{ '@id': '/api/rarities/1' }, { '@id': '/api/rarities/2' }],
    })

    expect(payload).toEqual({
      name: 'Carte',
      extension: '/api/extensions/1',
      rarities: ['/api/rarities/1', '/api/rarities/2'],
    })
  })
})
