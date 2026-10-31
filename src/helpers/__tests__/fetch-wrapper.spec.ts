import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiError, getErrorMessage } from '../api-error'
import { createFetchWrapper } from '../fetch-wrapper'

const API_URL = import.meta.env.VITE_API_URL ?? ''

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status,
        statusText: 'Status',
      }),
    ),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createApiError', () => {
  it("extrait le message et les violations d'API Platform", () => {
    const error = createApiError(
      {
        detail: 'name: Ce champ est requis.',
        violations: [
          { propertyPath: 'name', message: 'Ce champ est requis.' },
          { propertyPath: 'name', message: 'Doublon ignoré' },
        ],
      },
      422,
      'Unprocessable Entity',
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.message).toBe('name: Ce champ est requis.')
    expect(error.violations).toEqual({ name: 'Ce champ est requis.' })
  })

  it('retombe sur le statut HTTP quand le corps est vide', () => {
    expect(createApiError(null, 500, 'Internal Server Error').message).toBe('Internal Server Error')
    expect(getErrorMessage(undefined)).toBe('Erreur inconnue')
  })
})

describe('createFetchWrapper', () => {
  it('déconnecte sur 401 quand un token est présent', async () => {
    mockFetch(401, { message: 'Expired JWT Token' })
    const logout = vi.fn()
    const wrapper = createFetchWrapper({ token: 'jwt', logout })

    await expect(wrapper.get(`${API_URL}/cards`)).rejects.toThrow('Expired JWT Token')
    expect(logout).toHaveBeenCalledOnce()
  })

  it('ne déconnecte pas sur 403', async () => {
    mockFetch(403, { detail: 'Accès refusé' })
    const logout = vi.fn()
    const wrapper = createFetchWrapper({ token: 'jwt', logout })

    await expect(wrapper.get(`${API_URL}/cards`)).rejects.toMatchObject({ status: 403 })
    expect(logout).not.toHaveBeenCalled()
  })

  it('lit le token courant à chaque requête', async () => {
    mockFetch(200, {})
    const authState = { token: null as string | null, logout: vi.fn() }
    const wrapper = createFetchWrapper(authState)

    authState.token = 'nouveau'
    await wrapper.get(`${API_URL}/cards`)

    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer nouveau')
  })
})
