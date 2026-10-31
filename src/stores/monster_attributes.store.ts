import type { MonsterAttributesState } from '@/types/states/MonsterAttributesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import {
  buildApiPlatformQuery,
  createFetchWrapper,
  hydratePaginatedState,
  getErrorMessage,
} from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { MonsterAttributeForm } from '@/types/forms/MonsterAttributeForm'
import type { MonsterAttribute } from '@/types/models/MonsterAttribute'

const baseUrl = `${import.meta.env.VITE_API_URL}/monster_attributes`

export const useMonsterAttributesStore = defineStore('monster_attributes', {
  state: (): MonsterAttributesState => ({
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
    async createMonsterAttribute(monsterAttribute: MonsterAttributeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.post(baseUrl, monsterAttribute)
    },
    async updateMonsterAttribute(id: number, monsterAttribute: MonsterAttributeForm) {
      const fetchWrapper = this._getFetchWrapper()
      await fetchWrapper.patch(`${baseUrl}/${id}`, monsterAttribute)
    },
    async fetchAll(): Promise<MonsterAttribute[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des attributs de monstre:', err)
        return []
      }
    },
  },
})
