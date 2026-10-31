import type { RaritiesState } from '@/types/states/RaritiesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { RarityForm } from '@/types/forms/RarityForm'
import type { Rarity } from '@/types/models/Rarity'

const baseUrl = `${import.meta.env.VITE_API_URL}/rarities`

export const useRaritiesStore = defineStore('rarities', {
  state: (): RaritiesState => ({
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
    async createRarity(rarity: RarityForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, rarity)
      } catch (err) {
        console.error('Erreur lors de la création de la rareté:', err)
      }
    },
    async updateRarity(id: number, rarity: RarityForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, rarity)
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la rareté:', err)
      }
    },
    async fetchAll(): Promise<Rarity[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des raretés:', err)
        return []
      }
    },
  },
})
