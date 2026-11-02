import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores'
import AccountView from '../AccountView.vue'
import AccountModal from '../modals/AccountModal.vue'
import ImpersonationModal from '../modals/ImpersonationModal.vue'

const mounted: VueWrapper[] = []

function mockFetch(body: unknown = { member: [] }, status = 200) {
  const fn = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountComponent(component: object, props: Record<string, unknown> = {}, userId = 1) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().user = { id: userId, username: 'moi', avatar: '' }
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: { plugins: [pinia], stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 50))
  await flushPromises()
}

const writes = (fetchMock: ReturnType<typeof mockFetch>, method: string) =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === method)

beforeEach(() => {
  vi.stubGlobal('bootstrap', {
    Modal: class {
      show = vi.fn()
      hide = vi.fn()
    },
  })
})

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const account = {
  '@id': '/api/users/7',
  id: 7,
  username: 'joueur',
  email: 'joueur@example.com',
  roles: ['ROLE_USER'],
  commentsCount: 2,
  banned: false,
}

describe('AccountModal', () => {
  it('exige le mot de passe à la création', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(AccountModal)
    await settle()

    await wrapper.find('#accountModal-username').setValue('nouveau')
    await wrapper.find('#accountModal-email').setValue('nouveau@example.com')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Mot de passe requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it('refuse un mot de passe trop faible', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(AccountModal)
    await settle()

    await wrapper.find('#accountModal-username').setValue('nouveau')
    await wrapper.find('#accountModal-email').setValue('nouveau@example.com')
    await wrapper.find('#accountModal-password').setValue('faible')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('majuscule, minuscule, chiffre')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it('crée un compte avec son rôle et son mot de passe', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(AccountModal)
    await settle()

    await wrapper.find('#accountModal-username').setValue('nouveau')
    await wrapper.find('#accountModal-email').setValue('nouveau@example.com')
    await wrapper.find('#accountModal-role').setValue('ROLE_ADMIN')
    await wrapper.find('#accountModal-password').setValue('Motdepasse1!')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(String(call[0])).toMatch(/\/users$/)
    expect(JSON.parse(call[1].body)).toEqual({
      username: 'nouveau',
      email: 'nouveau@example.com',
      roles: ['ROLE_ADMIN'],
      banned: false,
      plainPassword: 'Motdepasse1!',
    })
  })

  it("n'envoie pas de mot de passe à la modification quand il est vide", async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(AccountModal, { account })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/users\/7$/)
    expect(JSON.parse(call[1].body)).toEqual({
      username: 'joueur',
      email: 'joueur@example.com',
      roles: ['ROLE_USER'],
      banned: false,
    })
  })

  it('bannit un compte depuis la modale', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(AccountModal, { account })
    await settle()

    await wrapper.find('#accountModal-banned').setValue(true)
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(JSON.parse(writes(fetchMock, 'PATCH')[0][1].body).banned).toBe(true)
  })

  it('verrouille le rôle de son propre compte', async () => {
    mockFetch({})
    const wrapper = mountComponent(AccountModal, { account }, 7)
    await settle()

    expect(wrapper.find('#accountModal-role').attributes('disabled')).toBeDefined()
    expect(wrapper.find('#accountModal-banned').attributes('disabled')).toBeDefined()
  })

  it("affiche l'erreur 422 de l'API sur le champ concerné", async () => {
    mockFetch(
      {
        detail: 'Données invalides',
        violations: [{ propertyPath: 'email', message: 'Email déjà utilisé' }],
      },
      422,
    )
    const wrapper = mountComponent(AccountModal, { account })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Email déjà utilisé')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })
})

describe('AccountView', () => {
  it('ne propose pas de supprimer son propre compte', async () => {
    mockFetch({
      member: [account, { ...account, id: 1, '@id': '/api/users/1', username: 'moi' }],
      totalItems: 2,
    })
    const wrapper = mountComponent(AccountView, {}, 1)
    await settle()

    expect(wrapper.text()).toContain('joueur')
    expect(wrapper.findAll('button[aria-label="Supprimer"]')).toHaveLength(1)
    expect(wrapper.findAll('button[aria-label="Bannir"]')).toHaveLength(1)
  })

  it('bannit un compte après confirmation', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const fetchMock = mockFetch({ member: [account], totalItems: 1 })
    const wrapper = mountComponent(AccountView, {}, 1)
    await settle()

    await wrapper.find('button[aria-label="Bannir"]').trigger('click')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/users\/7$/)
    expect(JSON.parse(call[1].body)).toEqual({ banned: true })
  })
})

describe('Impersonation', () => {
  it("n'est proposée ni pour soi, ni pour un administrateur, ni pour un compte banni", async () => {
    mockFetch({
      member: [
        account,
        { ...account, id: 1, '@id': '/api/users/1', username: 'moi' },
        { ...account, id: 8, '@id': '/api/users/8', roles: ['ROLE_ADMIN'] },
        { ...account, id: 9, '@id': '/api/users/9', banned: true },
      ],
      totalItems: 4,
    })
    const wrapper = mountComponent(AccountView, {}, 1)
    await settle()

    expect(wrapper.findAll('button[aria-label="Se connecter en tant que"]')).toHaveLength(1)
  })

  it("génère le jeton sans corps et l'affiche", async () => {
    const fetchMock = mockFetch({
      token: 'jwt.du.joueur',
      expiresIn: 900,
      user: { id: 7, username: 'joueur' },
    })
    const wrapper = mountComponent(ImpersonationModal, { account })
    await settle()

    const generate = wrapper.findAll('button').find((b) => b.text().includes('Générer le jeton'))
    await generate?.trigger('click')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(String(call[0])).toMatch(/\/users\/7\/impersonate$/)
    expect(call[1].body).toBeUndefined()
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('jwt.du.joueur')
    expect(wrapper.text()).toContain('15 minutes')
  })

  it("affiche le refus 422 de l'API", async () => {
    mockFetch({ error: 'Impossible de se connecter en tant que ce compte.' }, 422)
    const wrapper = mountComponent(ImpersonationModal, { account })
    await settle()

    const generate = wrapper.findAll('button').find((b) => b.text().includes('Générer le jeton'))
    await generate?.trigger('click')
    await settle()

    expect(wrapper.text()).toContain('Impossible de se connecter en tant que ce compte.')
    expect(wrapper.find('textarea').exists()).toBe(false)
  })
})
