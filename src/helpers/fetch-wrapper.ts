import type { AuthState } from '@/types/states/AuthState'
import { createApiError } from './api-error'

export function createFetchWrapper(authState: AuthState) {
  function authHeader(url: string): Record<string, string> {
    const token = authState.token
    const isLoggedIn = !!token
    const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL)

    if (isLoggedIn && isApiUrl) {
      return { Authorization: `Bearer ${token}` }
    }

    return {}
  }

  async function handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text()
    let data: T | null = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {}

    if (!response.ok) {
      // 401 = session expirée ; 403 = droits insuffisants (la session reste valide)
      if (response.status === 401 && authState.token) {
        authState.logout()
      }
      return Promise.reject(createApiError(data, response.status, response.statusText))
    }
    return data as T
  }

  function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async <T = any>(
      url: string,
      body?: unknown,
      isFormData: boolean = false,
    ): Promise<T> => {
      const headers: HeadersInit = authHeader(url)
      const requestOptions: RequestInit = {
        method,
        headers,
      }

      if (body) {
        if (isFormData) {
          requestOptions.body = body as FormData
        } else {
          ;(requestOptions.headers as Record<string, string>)['Content-Type'] =
            'PATCH' === method ? 'application/merge-patch+json' : 'application/ld+json'
          ;(requestOptions.headers as Record<string, string>)['accept'] = 'application/ld+json'
          requestOptions.body = JSON.stringify(body)
        }
      }

      const response = await fetch(url, requestOptions)
      return handleResponse<T>(response)
    }
  }

  return {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    delete: request('DELETE'),
    patch: request('PATCH'),
    /** Télécharge un fichier (ex. PDF) avec l'authentification : un lien direct n'enverrait pas le jeton. */
    getBlob: async (url: string): Promise<Blob> => {
      const response = await fetch(url, { headers: authHeader(url) })
      if (!response.ok) {
        if (response.status === 401 && authState.token) authState.logout()
        const text = await response.text()
        let data: unknown = null
        try {
          data = text ? JSON.parse(text) : null
        } catch {}
        return Promise.reject(createApiError(data, response.status, response.statusText))
      }
      return response.blob()
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upload: async <T = any>(url: string, formData: FormData): Promise<T> => {
      const headers: HeadersInit = {
        ...authHeader(url),
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })

      return handleResponse<T>(response)
    },
  }
}
