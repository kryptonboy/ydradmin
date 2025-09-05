import { defineStore } from 'pinia'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { TagsState } from '@/types/TagsState'
import type { TagForm } from '@/types/TagForm'
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
    async filter(filters: Filters, sort: Sort, page: number) {
      const { token, logout } = useAuthStore()
      const fetchWrapper = createFetchWrapper({ token, logout })
      this.loading = true
      this.error = null

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
      const { token, logout } = useAuthStore()
      const fetchWrapper = createFetchWrapper({ token, logout })
      try {
        console.log('Envoi des données du tag')
        await fetchWrapper.post(baseUrl, tag)
        console.log('Tag créé avec succès !')
      } catch (err) {
        console.error('Erreur lors de la création du tag:', err)
      }
    },
    async updateTag(id: number, tag: TagForm) {
      const { token, logout } = useAuthStore()
      const fetchWrapper = createFetchWrapper({ token, logout })
      await fetchWrapper.patch(`${baseUrl}/${id}`, tag)
    },
  },
})
