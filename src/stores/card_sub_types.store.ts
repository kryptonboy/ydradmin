import type { CardSubTypesState } from '@/types/states/CardSubTypesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { CardSubTypeForm } from '@/types/forms/CardSubTypeForm'
import type { CardSubType } from '@/types/models/CardSubType'

const baseUrl = `${import.meta.env.VITE_API_URL}/card_sub_types`

export const useCardSubTypesStore = defineStore('card_sub_types', {
  state: (): CardSubTypesState => ({
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
    async createCardSubType(cardSubType: CardSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.post(baseUrl, cardSubType)
    },
    async updateCardSubType(id: number, cardSubType: CardSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.patch(`${baseUrl}/${id}`, cardSubType)
    },
    async fetchAll(): Promise<CardSubType[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des sous-types de cartes:', err)
        return []
      }
    },
  },
})
