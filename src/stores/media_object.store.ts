import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import { createFetchWrapper } from '@/helpers'
import type { MediaRef } from '@/types/content-blocks'

const baseUrl = `${import.meta.env.VITE_API_URL}/media_objects`

export const useMediaObjectsStore = defineStore('media_objects', {
  actions: {
    /** Envoie un fichier et renvoie le média créé (id entier, IRI et URL de contenu). */
    async upload(file: File, context: string): Promise<MediaRef & { '@id': string }> {
      const fetchWrapper = createFetchWrapper(useAuthStore())
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', context)

      return fetchWrapper.upload(baseUrl, formData)
    },

    /** Comme `upload`, mais ne renvoie que l'IRI (champs média des formulaires). */
    async uploadFile(file: File, context: string): Promise<string> {
      const media = await this.upload(file, context)
      return media['@id']
    },
  },
})
