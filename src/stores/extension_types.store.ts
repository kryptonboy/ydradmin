import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
import type { ExtensionTypesState } from '@/types/states/ExtensionTypesState'
import type { Filters, Sort } from '@/types/Api'
import type { ExtensionTypeForm } from '@/types/forms/ExtensionTypeForm'
import type { ExtensionType } from '@/types/models/ExtensionType'

const baseUrl = `${import.meta.env.VITE_API_URL}/extension_types`

export const useExtensionTypesStore = defineStore('extension_types', {
  state: (): ExtensionTypesState => ({
    items: [],
    loading: false,
    error: null,
    pagination: {
      totalItems: 0,
      firstPage: null,
      previousPage: null,
      nextPage: null,
      lastPage: null,
    },
  }),
  actions: {
    _getFetchWrapper() {
      return createFetchWrapper(useAuthStore())
    },
    async filter(filters: Filters, sort: Sort, page: number) {
      const fetchWrapper = this._getFetchWrapper()
      this.loading = true
      this.error = null
      this.pagination = {
        totalItems: 0,
        firstPage: null,
        previousPage: null,
        nextPage: null,
        lastPage: null,
      }

      try {
        const data = await fetchWrapper.get(
          `${baseUrl}?${buildApiPlatformQuery(filters, sort, page)}`,
        )
        hydratePaginatedState(this, data)
      } catch (err) {
        this.error = getErrorMessage(err)
        this.items = []
      } finally {
        this.loading = false
      }
    },
    async createExtensionType(extensionType: ExtensionTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.post(baseUrl, extensionType)
    },
    async updateExtensionType(id: number, extensionType: ExtensionTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.patch(`${baseUrl}/${id}`, extensionType)
    },
    async fetchAll(): Promise<ExtensionType[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error("Erreur lors de la récupération de la liste des types d'extension", err)
        return []
      }
    },
  },
})
