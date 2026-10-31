import type { MonsterEffectsState } from '@/types/states/MonsterEffectsState'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { buildApiPlatformQuery, createFetchWrapper, hydratePaginatedState } from '@/helpers'
import type { Filters, Sort } from '@/types/Api'
import type { MonsterEffectForm } from '@/types/forms/MonsterEffectForm'
import type { MonsterEffect } from '@/types/models/MonsterEffect'

const baseUrl = `${import.meta.env.VITE_API_URL}/monster_effects`

export const useMonsterEffectsStore = defineStore('monster_effects', {
  state: (): MonsterEffectsState => ({
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
    async createMonsterEffect(monsterEffect: MonsterEffectForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.post(baseUrl, monsterEffect)
      } catch (err) {
        console.error("Erreur lors de la création de l'effet de monstre:", err)
      }
    },
    async updateMonsterEffect(id: number, monsterEffect: MonsterEffectForm) {
      const fetchWrapper = this._getFetchWrapper()
      try {
        await fetchWrapper.patch(`${baseUrl}/${id}`, monsterEffect)
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'effet de monstre:", err)
      }
    },
    async fetchAll(): Promise<MonsterEffect[]> {
      const fetchWrapper = this._getFetchWrapper()
      try {
        const data = await fetchWrapper.get(baseUrl)
        return data.member ?? []
      } catch (err) {
        console.error('Erreur lors de la récupération de la liste des effets de monstre:', err)
        return []
      }
    },
  },
})
