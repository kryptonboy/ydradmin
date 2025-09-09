import { createFetchWrapper } from '@/helpers'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

const baseUrl = `${import.meta.env.VITE_API_URL}/users`

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: {},
  }),
  actions: {
    _getFetchWrapper() {
      const { token, logout } = useAuthStore()
      return createFetchWrapper({ token, logout })
    },
    async getAll() {
      const fetchWrapper = this._getFetchWrapper()
      this.users = { loading: true }
      fetchWrapper
        .get(baseUrl)
        .then((users) => (this.users = users))
        .catch((error) => (this.users = { error }))
    },
  },
})
