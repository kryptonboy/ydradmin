import { defineStore } from 'pinia'
import { createFetchWrapper, router } from '@/helpers'
import type { AuthStateData } from '@/types/states/AuthStateData'
import type { User } from '@/types/User'

const baseUrl = `${import.meta.env.VITE_API_URL}`

export const useAuthStore = defineStore('auth', {
  state: (): AuthStateData => ({
    token: null,
    user: null,
    returnUrl: null,
    isAuthChecked: false,
    isChecking: false,
  }),
  getters: {
    /** Rôles du compte connecté, lus dans le jeton (affichage seulement : l'API fait foi) */
    roles(state): string[] {
      if (!state.token) return []
      try {
        const payload = state.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const roles = JSON.parse(atob(payload)).roles
        return Array.isArray(roles) ? roles : []
      } catch {
        return []
      }
    },
    /** Médiateur sans être administrateur : l'admin se limite à la page Échanges */
    isMediatorOnly(): boolean {
      return this.roles.includes('ROLE_MEDIATOR') && !this.roles.includes('ROLE_ADMIN')
    },
  },
  actions: {
    async login(username: string, password: string) {
      const fetchWrapper = createFetchWrapper(this)

      this.isChecking = true
      try {
        const { token } = await fetchWrapper.post<{ token: string }>(`${baseUrl}/login_check`, {
          username,
          password,
        })
        this.token = token
        localStorage.setItem('token', token)
      } catch (error) {
        this.isChecking = false
        throw error
      }
      await this.checkToken()
      router.push(this.returnUrl || '/')
    },
    async loadFromStorage() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        await this.checkToken()
      } else {
        this.isAuthChecked = true
      }
    },
    async checkToken() {
      const fetchWrapper = createFetchWrapper(this)
      this.isChecking = true
      try {
        const user = await fetchWrapper.get<User>(`${baseUrl}/me`)
        this.user = user
      } catch {
        this.user = null
        this.token = null
        localStorage.removeItem('token')
      } finally {
        this.isAuthChecked = true
        this.isChecking = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.isAuthChecked = true
      localStorage.removeItem('token')
      router.push('/login')
    },
  },
})
