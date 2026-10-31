import { describe, expect, it, vi } from 'vitest'
import { useListView } from '../useListView'

function createStore() {
  return {
    items: [] as { id: number }[],
    loading: false,
    pagination: {
      totalItems: 0,
      firstPage: null,
      previousPage: null,
      nextPage: null,
      lastPage: null,
    },
    filter: vi.fn().mockResolvedValue(undefined),
  }
}

const options = {
  sort: { sortBy: 'name', sortDir: 'asc' as const },
  createFilters: () => ({ name: null as string | null, tags: [] as number[] }),
}

describe('useListView', () => {
  it('charge la première page à la création', () => {
    const store = createStore()
    useListView(store, options)

    expect(store.filter).toHaveBeenCalledWith(
      { name: null, tags: [] },
      { sortBy: 'name', sortDir: 'asc' },
      1,
    )
  })

  it('compte les filtres actifs (tableaux non vides, valeurs non nulles)', () => {
    const list = useListView(createStore(), options)
    expect(list.nbFilters.value).toBe(0)

    list.filters.name = 'dragon'
    list.filters.tags = [1]
    expect(list.nbFilters.value).toBe(2)
  })

  it('inverse le sens quand on retrie sur la même colonne, sinon repasse en asc', () => {
    const list = useListView(createStore(), options)

    list.setSort('name')
    expect(list.sort.value).toEqual({ sortBy: 'name', sortDir: 'desc' })

    list.setSort('id')
    expect(list.sort.value).toEqual({ sortBy: 'id', sortDir: 'asc' })
  })

  it('applique, réinitialise les filtres et change de page', () => {
    const store = createStore()
    const list = useListView(store, options)

    list.changePage(3)
    expect(store.filter).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), 3)

    list.filters.name = 'x'
    list.applyFilters()
    expect(list.currentPage.value).toBe(1)
    expect(store.filter).toHaveBeenLastCalledWith({ name: 'x', tags: [] }, expect.anything(), 1)

    list.resetFilters()
    expect(list.filters.name).toBeNull()
    expect(store.filter).toHaveBeenLastCalledWith({ name: null, tags: [] }, expect.anything(), 1)
  })

  it("convertit les filtres avec toQuery avant l'appel au store", () => {
    const store = createStore()
    useListView(store, { ...options, toQuery: (f) => ({ name: f.name, tags: f.tags }) })

    expect(store.filter).toHaveBeenCalledWith({ name: null, tags: [] }, expect.anything(), 1)
  })
})
