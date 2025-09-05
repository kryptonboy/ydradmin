import { createFetchWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

const baseUrl = `${import.meta.env.VITE_API_URL}/users`

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: {},
  }),
  actions: {
    async getAll() {
      const { token, logout } = useAuthStore()
      const fetchWrapper = createFetchWrapper({ token, logout })
      this.users = { loading: true }
      fetchWrapper
        .get(baseUrl)
        .then((users) => (this.users = users))
        .catch((error) => (this.users = { error }))
    },
  },
})
