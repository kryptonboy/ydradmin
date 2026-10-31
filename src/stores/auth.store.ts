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
