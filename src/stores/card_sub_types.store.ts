import type { CardSubTypesState } from '@/types/states/CardSubTypesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { CardSubTypeForm } from '@/types/forms/CardSubTypeForm'

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
    async createCardSubType(CardSubType: CardSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, CardSubType)
      } catch (err) {
        console.error('Erreur lors de la création du sous-type de carte:', err)
      }
    },
    async updateCardSubType(id: number, cardSubType: CardSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, cardSubType)
      } catch (err) {
        console.error('Erreur lors de la mise à jour du sous-type de carte', err)
      }
    },
  },
})
