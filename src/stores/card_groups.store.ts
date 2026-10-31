import type { CardGroupsState } from '@/types/states/CardGroupsState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { CardGroupForm } from '@/types/forms/CardGroupForm'
import type { CardGroup } from '@/types/models/CardGroup'

const baseUrl = `${import.meta.env.VITE_API_URL}/card_groups`

export const useCardGroupsStore = defineStore('card_groups', {
  state: (): CardGroupsState => ({
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
    async createCardGroup(cardGroup: CardGroupForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.post(baseUrl, cardGroup)
    },
    async updateCardGroup(id: number, cardGroup: CardGroupForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.patch(`${baseUrl}/${id}`, cardGroup)
    },
    async autocomplete(name: string | null): Promise<CardGroup[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${encodeURIComponent(name)}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des groupes de cartes:', err)
        return []
      }
    },
  },
})
