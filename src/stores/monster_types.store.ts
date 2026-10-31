import type { MonsterTypesState } from '@/types/states/MonsterTypesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { MonsterTypeForm } from '@/types/forms/MonsterTypeForm'
import type { MonsterType } from '@/types/models/MonsterType'

const baseUrl = `${import.meta.env.VITE_API_URL}/monster_types`

export const useMonsterTypesStore = defineStore('monster_types', {
  state: (): MonsterTypesState => ({
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
    async createMonsterType(monsterType: MonsterTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, monsterType)
      } catch (err) {
        console.error('Erreur lors de la création du type de monstre:', err)
      }
    },
    async updateMonsterType(id: number, monsterType: MonsterTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, monsterType)
      } catch (err) {
        console.error('Erreur lors de la mise à jour du type de mosntre:', err)
      }
    },
    async fetchAll(): Promise<MonsterType[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des types de monstre:', err)
        return []
      }
    },
  },
})
