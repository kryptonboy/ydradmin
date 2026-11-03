import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores'
import { router } from '../router'

function signIn(roles?: string[]) {
  const auth = useAuthStore()
  auth.token = 'jeton'
  auth.user = { id: 5, username: 'medi', avatar: '', roles }
  auth.isAuthChecked = true
  return auth
}

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.stubGlobal('localStorage', { getItem: () => null, setItem() {}, removeItem() {} })
  // Repart d'une page neutre, hors du filtrage des rôles
  useAuthStore().isAuthChecked = true
  await router.push('/login').catch(() => {})
})

describe('accès restreint du médiateur', () => {
  it('lit les rôles renvoyés par /me', () => {
    expect(signIn(['ROLE_USER', 'ROLE_MEDIATOR']).isMediatorOnly).toBe(true)
    expect(signIn(['ROLE_ADMIN', 'ROLE_MEDIATOR', 'ROLE_USER']).isMediatorOnly).toBe(false)
    expect(signIn(['ROLE_USER']).isMediatorOnly).toBe(false)
  })

  it('ne restreint rien quand /me ne renvoie pas de rôles', () => {
    const auth = signIn(undefined)
    expect(auth.roles).toEqual([])
    expect(auth.isMediatorOnly).toBe(false)
  })

  it('redirige un médiateur vers la page Échanges', async () => {
    signIn(['ROLE_USER', 'ROLE_MEDIATOR'])

    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/trades')

    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/trades')
  })

  it('laisse un administrateur circuler librement', async () => {
    signIn(['ROLE_USER', 'ROLE_MEDIATOR', 'ROLE_ADMIN'])

    await router.push('/users')
    expect(router.currentRoute.value.path).toBe('/users')
  })
})
