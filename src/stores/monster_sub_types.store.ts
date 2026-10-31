import type { MonsterSubTypesState } from '@/types/states/MonsterSubTypesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { MonsterSubTypeForm } from '@/types/forms/MonsterSubTypeForm'
import type { MonsterSubType } from '@/types/models/MonsterSubType'

const baseUrl = `${import.meta.env.VITE_API_URL}/monster_sub_types`

export const useMonsterSubTypesStore = defineStore('monster_sub_types', {
  state: (): MonsterSubTypesState => ({
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
    async createMonsterSubType(monsterSubType: MonsterSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, monsterSubType)
      } catch (err) {
        console.error('Erreur lors de la création du sous-type de monstre:', err)
      }
    },
    async updateMonsterSubType(id: number, monsterSubType: MonsterSubTypeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, monsterSubType)
      } catch (err) {
        console.error('Erreur lors de la mise à jour du sous-type de monstre:', err)
      }
    },
    async fetchAll(): Promise<MonsterSubType[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des sous-types de monstre:', err)
        return []
      }
    },
  },
})
