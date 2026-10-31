import type { AbstractCardsState } from '@/types/states/AbstractCardsState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
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
    async createAbstractCard(abstractCard: AbstractCardForm): Promise<AbstractCard | null> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        return await fetchWrapper.post(baseUrl, abstractCard)
      } catch (err) {
        console.error('Erreur lors de la création de la carte abstraite:', err)
        return null
      }
    },
    async updateAbstractCard(
      id: number,
      abstractCard: AbstractCardForm,
    ): Promise<AbstractCard | null> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        return await fetchWrapper.patch(`${baseUrl}/${id}`, abstractCard)
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la carte abstraite:', err)
        return null
      }
    },
    async autocomplete(name: string | null): Promise<AbstractCard[]> {
      if (null === name) {
        return []
      }
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(`${baseUrl}?name=${name}`)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des cartes abstraites:', err)
        return []
      }
    },
  },
})
