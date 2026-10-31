import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createResourceStore } from '../create-resource-store'

interface Thing {
  id: number
  name: string
}

const useThingsStore = createResourceStore<Thing, { name: string }>('things', 'things')

function mockFetch(status: number, body: unknown) {
  const fn = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(body), { status, statusText: 'Status' })),
    )
  vi.stubGlobal('fetch', fn)
  return fn
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createResourceStore', () => {
  it('charge items et pagination depuis une réponse Hydra', async () => {
    const fetchMock = mockFetch(200, {
      member: [{ id: 1, name: 'a' }],
      totalItems: 120,
      view: { first: '?page=1', next: '?page=2', last: '?page=3' },
    })
    const store = useThingsStore()

    await store.filter({ name: 'a' }, { sortBy: 'name', sortDir: 'asc' }, 1)

    expect(store.items).toEqual([{ id: 1, name: 'a' }])
    expect(store.pagination).toMatchObject({
      totalItems: 120,
      nextPage: '?page=2',
      previousPage: null,
    })
    expect(store.loading).toBe(false)
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      '/things?name=a&order%5Bname%5D=asc&page=1',
    )
  })

  it("expose l'erreur et vide la liste quand le chargement échoue", async () => {
    mockFetch(500, { detail: 'Boom' })
    const store = useThingsStore()

    await store.filter({}, { sortBy: 'id', sortDir: 'asc' }, 1)

    expect(store.error).toBe('Boom')
    expect(store.items).toEqual([])
  })

  it('create (POST) et update (PATCH) laissent remonter les erreurs', async () => {
    const fetchMock = mockFetch(201, { id: 2, name: 'b' })
    const store = useThingsStore()

    await expect(store.create({ name: 'b' })).resolves.toEqual({ id: 2, name: 'b' })
    await store.update(2, { name: 'c' })
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' })
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PATCH' })
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/things\/2$/)

    mockFetch(422, {
      detail: 'name: invalide',
      violations: [{ propertyPath: 'name', message: 'invalide' }],
    })
    await expect(store.create({ name: '' })).rejects.toMatchObject({
      status: 422,
      violations: { name: 'invalide' },
    })
  })

  it("encode la recherche d'autocomplete", async () => {
    const fetchMock = mockFetch(200, { member: [] })
    const store = useThingsStore()

    await store.autocomplete('a&b=1')

    expect(String(fetchMock.mock.calls[0][0])).toContain('?name=a%26b%3D1')
  })
})
