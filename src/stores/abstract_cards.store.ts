import type { AbstractCardsState } from '@/types/states/AbstractCardsState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { AbstractCardForm } from '@/types/forms/AbstractCardForm'
import type { AbstractCard } from '@/types/models/AbstractCard'

const baseUrl = `${import.meta.env.VITE_API_URL}/abstract_cards`

export const useAbstractCardsStore = defineStore('abstract_cards', {
  state: (): AbstractCardsState => ({
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
    async createAbstractCard(abstractCard: AbstractCardForm): Promise<AbstractCard> {
      const fetchWrapper = this._getFetchWrapper()
      return await fetchWrapper.post(baseUrl, abstractCard)
    },
    async updateAbstractCard(id: number, abstractCard: AbstractCardForm): Promise<AbstractCard> {
      const fetchWrapper = this._getFetchWrapper()
      return await fetchWrapper.patch(`${baseUrl}/${id}`, abstractCard)
    },
    async autocomplete(name: string | null): Promise<AbstractCard[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${encodeURIComponent(name)}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des cartes abstraites:', err)
        return []
      }
    },
  },
})
