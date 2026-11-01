import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { buildApiPlatformQuery, createFetchWrapper, getErrorMessage } from '@/helpers'
import type { Filters, PaginatedApiResponse, Sort } from '@/types/Api'
import type { Pagination } from '@/types/states/Pagination'
import { useAuthStore } from './auth.store'

function emptyPagination(): Pagination {
  return {
    totalItems: 0,
    firstPage: null,
    previousPage: null,
    nextPage: null,
    lastPage: null,
  }
}

/**
 * Fabrique un store CRUD pour une ressource API Platform.
 *
 * @param id   identifiant Pinia du store
 * @param path chemin de la collection (ex. `card_types` pour `${VITE_API_URL}/card_types`)
 * @typeParam T modèle renvoyé par l'API
 * @typeParam F payload d'écriture (les relations y sont des IRI)
 */
export function createResourceStore<T, F>(id: string, path: string) {
  const baseUrl = `${import.meta.env.VITE_API_URL}/${path}`

  return defineStore(id, () => {
    const items = ref([]) as Ref<T[]>
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref<Pagination>(emptyPagination())

    const fetchWrapper = () => createFetchWrapper(useAuthStore())

    /** Charge une page filtrée et triée dans `items` / `pagination`. */
    async function filter(filters: Filters, sort: Sort, page: number) {
      loading.value = true
      error.value = null
      pagination.value = emptyPagination()

      try {
        const data = await fetchWrapper().get<PaginatedApiResponse<T>>(
          `${baseUrl}?${buildApiPlatformQuery(filters, sort, page)}`,
        )
        items.value = data.member ?? []
        pagination.value = {
          totalItems: data.totalItems ?? items.value.length,
          firstPage: data.view?.first ?? null,
          previousPage: data.view?.previous ?? null,
          nextPage: data.view?.next ?? null,
          lastPage: data.view?.last ?? null,
        }
      } catch (err) {
        error.value = getErrorMessage(err)
        items.value = []
      } finally {
        loading.value = false
      }
    }

    /** Crée la ressource. Rejette avec une `ApiError` en cas d'échec. */
    function create(form: F): Promise<T> {
      return fetchWrapper().post<T>(baseUrl, form)
    }

    /** Met à jour la ressource (PATCH). Rejette avec une `ApiError` en cas d'échec. */
    function update(resourceId: number, form: Partial<F>): Promise<T> {
      return fetchWrapper().patch<T>(`${baseUrl}/${resourceId}`, form)
    }

    /** Détail d'une ressource. Rejette avec une `ApiError` en cas d'échec. */
    function get(resourceId: number): Promise<T> {
      return fetchWrapper().get<T>(`${baseUrl}/${resourceId}`)
    }

    /** Supprime la ressource. Rejette avec une `ApiError` en cas d'échec. */
    async function remove(resourceId: number): Promise<void> {
      await fetchWrapper().delete(`${baseUrl}/${resourceId}`)
    }

    /** Première page de la collection, sans filtre (listes de choix). */
    async function fetchAll(): Promise<T[]> {
      try {
        const data = await fetchWrapper().get<PaginatedApiResponse<T>>(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error(`Erreur lors de la récupération de ${path}:`, err)
        return []
      }
    }

    /** Recherche par nom (listes déroulantes avec recherche). */
    async function autocomplete(name: string | null): Promise<T[]> {
      if (null === name) {
        return []
      }
      try {
        const data = await fetchWrapper().get<PaginatedApiResponse<T>>(
          `${baseUrl}?name=${encodeURIComponent(name)}`,
        )
        return data.member ?? []
      } catch (err) {
        console.error(`Erreur lors de la recherche dans ${path}:`, err)
        return []
      }
    }

    return {
      items,
      loading,
      error,
      pagination,
      filter,
      create,
      update,
      get,
      remove,
      fetchAll,
      autocomplete,
    }
  })
}
