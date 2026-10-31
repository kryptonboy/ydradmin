import type { Filters, Sort } from '@/types/Api'
import type { ExtensionsState } from '@/types/states/ExtensionsState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { ExtensionForm } from '@/types/forms/ExtensionForm'
import type { Extension } from '@/types/models/Extension'

const baseUrl = `${import.meta.env.VITE_API_URL}/extensions`

export const useExtensionsStore = defineStore('extensions', {
  state: (): ExtensionsState => ({
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
      const { token, logout } = useAuthStore()
      return createFetchWrapper({ token, logout })
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
        this.error = err?.toString() ?? 'Erreur inconnue'
        this.items = []
      } finally {
        this.loading = false
      }
    },
    async createExtension(extension: ExtensionForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, extension)
      } catch (err) {
        console.error("Erreur lors de la création de l'extension:", err)
      }
    },
    async updateExtension(id: number, extension: ExtensionForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, extension)
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'extension", err)
      }
    },
    async autocomplete(name: string | null): Promise<Extension[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${name}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des extensions:', err)
        return []
      }
    },
  },
})
