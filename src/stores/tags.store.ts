import { defineStore } from 'pinia'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { TagsState } from '@/types/states/TagsState'
import type { TagForm } from '@/types/forms/TagForm'
import { useAuthStore } from './auth.store'
import type { Tag } from '@/types/models/Tag'

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
    async createTag(tag: TagForm): Promise<Tag | null> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const createdTag = await fetchWrapper.post(baseUrl, tag)
        return createdTag
      } catch (err) {
        console.error('Erreur lors de la création du tag:', err)
        return null
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
    async autocomplete(name: string | null): Promise<Tag[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${name}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des tags:', err)
        return []
      }
    },
  },
})
