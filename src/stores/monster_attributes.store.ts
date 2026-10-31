import type { MonsterAttributesState } from '@/types/states/MonsterAttributesState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
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
    async createMonsterAttribute(monsterAttribute: MonsterAttributeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, monsterAttribute)
      } catch (err) {
        console.error("Erreur lors de la création de l'attribut de monstre:", err)
      }
    },
    async updateMonsterAttribute(id: number, monsterAttribute: MonsterAttributeForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, monsterAttribute)
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'attribut de monstre:", err)
      }
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
