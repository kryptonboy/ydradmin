import { defineStore } from 'pinia'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
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
    async createTag(tag: TagForm): Promise<Tag> {
      const fetchWrapper = this._getFetchWrapper()
      const createdTag = await fetchWrapper.post(baseUrl, tag)
      return createdTag
    },
    async updateTag(id: number, tag: TagForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.patch(`${baseUrl}/${id}`, tag)
    },
    async autocomplete(name: string | null): Promise<Tag[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${encodeURIComponent(name)}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des tags:', err)
        return []
      }
    },
  },
})
