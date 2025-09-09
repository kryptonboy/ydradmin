import { defineStore } from 'pinia'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { TagsState } from '@/types/states/TagsState'
import type { TagForm } from '@/types/forms/TagForm'
import { useAuthStore } from './auth.store'

const baseUrl = `${import.meta.env.VITE_API_URL}/tags`

export const useTagsStore = defineStore('tags', {
  state: (): TagsState => ({
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
    async createTag(tag: TagForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, tag)
      } catch (err) {
        console.error('Erreur lors de la création du tag:', err)
      }
    },
    async updateTag(id: number, tag: TagForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, tag)
      } catch (err) {
        console.error('Erreur lors de la mise à jour du tag:', err)
      }
    },
  },
})
