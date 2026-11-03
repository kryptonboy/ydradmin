import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores'
import { router } from '../router'

/** Jeton factice dont seule la charge utile (rôles) compte pour l'affichage. */
const tokenWith = (roles: string[]) =>
  `e30.${btoa(JSON.stringify({ roles })).replace(/=+$/, '')}.signature`

function signIn(roles: string[]) {
  const auth = useAuthStore()
  auth.token = tokenWith(roles)
  auth.user = { id: 5, username: 'medi', avatar: '' }
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
  it('lit les rôles du jeton', () => {
    expect(signIn(['ROLE_USER', 'ROLE_MEDIATOR']).isMediatorOnly).toBe(true)
    expect(signIn(['ROLE_ADMIN', 'ROLE_MEDIATOR', 'ROLE_USER']).isMediatorOnly).toBe(false)
    expect(signIn(['ROLE_USER']).isMediatorOnly).toBe(false)
  })

  it('ignore un jeton illisible', () => {
    const auth = signIn(['ROLE_MEDIATOR'])
    auth.token = 'pas-un-jeton'
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
