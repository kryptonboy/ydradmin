import type { AuthState } from '@/types/states/AuthState'

export function createFetchWrapper(authState: AuthState) {
  const { token, logout } = authState

  function authHeader(url: string): Record<string, string> {
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
      if ([401, 403].includes(response.status) && token) {
        logout()
      }
      const error = (data && (data as any).message) || response.statusText
      return Promise.reject(error)
    }
    return data as T
  }

  function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') {
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
