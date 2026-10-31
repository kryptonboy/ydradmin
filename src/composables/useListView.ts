import { computed, reactive, ref } from 'vue'
import type { Filters, Sort } from '@/types/Api'
import type { Pagination } from '@/types/states/Pagination'

/** Ce que `useListView` attend d'un store créé par `createResourceStore`. */
interface ListStore<T> {
  items: T[]
  loading: boolean
  pagination: Pagination
  filter(filters: Filters, sort: Sort, page: number): Promise<void>
}

interface ListViewOptions<F extends object> {
  /** Tri initial */
  sort: Sort
  /** Valeurs initiales des filtres (appelée aussi à la réinitialisation) */
  createFilters: () => F
  /** Convertit les filtres du formulaire en paramètres d'API (par défaut : tels quels) */
  toQuery?: (filters: F) => Filters
}

/**
 * Logique commune des écrans de liste : filtres, tri, pagination et rechargement.
 * Charge la première page à la création.
 */
export function useListView<T, F extends object>(
  store: ListStore<T>,
  { sort: initialSort, createFilters, toQuery }: ListViewOptions<F>,
) {
  const currentPage = ref(1)
  const sort = ref<Sort>({ ...initialSort })
  const filters = reactive(createFilters()) as F

  const items = computed(() => store.items)
  const loading = computed(() => store.loading)
  const pagination = computed(() => store.pagination)

  const nbFilters = computed(
    () =>
      Object.values(filters).filter((value) =>
        Array.isArray(value) ? value.length > 0 : value !== null,
      ).length,
  )

  function reload() {
    const query = toQuery ? toQuery(filters) : (filters as Filters)
    return store.filter(query, sort.value, currentPage.value)
  }

  function setSort(field: string) {
    if (field === sort.value.sortBy) {
      sort.value.sortDir = sort.value.sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.sortBy = field
      sort.value.sortDir = 'asc'
    }
    reload()
  }

  function applyFilters() {
    currentPage.value = 1
    reload()
  }

  function resetFilters() {
    Object.assign(filters, createFilters())
    applyFilters()
  }

  function changePage(page: number) {
    currentPage.value = page
    reload()
  }

  reload()

  return {
    items,
    loading,
    pagination,
    currentPage,
    sort,
    filters,
    nbFilters,
    reload,
    setSort,
    applyFilters,
    resetFilters,
    changePage,
  }
}
