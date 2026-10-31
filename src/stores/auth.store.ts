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
      const { token, logout } = this
      const fetchWrapper = createFetchWrapper({ token, logout })

      this.isChecking = true
      const { token: newToken } = await fetchWrapper.post<{ token: string }>(
        `${baseUrl}/login_check`,
        {
          username,
          password,
        },
      )
      this.token = newToken
      localStorage.setItem('token', newToken)
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
      const { token, logout } = this
      const fetchWrapper = createFetchWrapper({ token, logout })
      this.isChecking = true
      try {
        const user = await fetchWrapper.get<User>(`${baseUrl}/me`)
        this.user = user
      } catch (error) {
        console.log(error)
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
