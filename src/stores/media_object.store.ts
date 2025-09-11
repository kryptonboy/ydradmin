import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { createFetchWrapper } from '@/helpers'

const baseUrl = `${import.meta.env.VITE_API_URL}/media_objects`

export const useMediaObjectsStore = defineStore('media_objects', {
  actions: {
    async uploadFile(file: File, context: string): Promise<string> {
      const { token, logout } = useAuthStore()
      const fetchWrapper = createFetchWrapper({ token, logout })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context)

      const media = await fetchWrapper.upload(baseUrl, formData)

      return media['@id']
    },
  },
})
