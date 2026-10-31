import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CardModal from '../modals/CardModal.vue'
import ExtensionModal from '../modals/ExtensionModal.vue'

const mounted: VueWrapper[] = []

function mockFetch(body: unknown = { member: [] }, status = 200) {
  const fn = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountModal(component: object, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: {
      plugins: [createPinia()],
      stubs: { FontAwesomeIcon: true, 'multi-select': true, FileUploader: true },
    },
  })
  mounted.push(wrapper)
  return wrapper
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 20))
  await flushPromises()
}

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

describe('CardModal', () => {
  it('affiche le formulaire de carte et la modale imbriquée de carte abstraite', async () => {
    mockFetch()
    const wrapper = mountModal(CardModal)
    await settle()

    expect(wrapper.findAll('.modal')).toHaveLength(2)
    expect(wrapper.find('pre').exists()).toBe(false)
    expect(wrapper.text()).toContain("Création d'une carte")
  })

  it("refuse l'envoi tant que les champs obligatoires sont vides", async () => {
    const fetchMock = mockFetch()
    const wrapper = mountModal(CardModal)
    await settle()
    fetchMock.mockClear()

    await wrapper.find('#cardModal form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Nom requis')
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0)
  })
})

describe('ExtensionModal', () => {
  it('envoie les relations en IRI et la date en ISO lors de la modification', async () => {
    const fetchMock = mockFetch({ member: [] })
    const wrapper = mountModal(ExtensionModal, {
      extension: {
        id: 3,
        name: 'LOB',
        reference: 'LOB',
        releaseDate: '2002-03-08T00:00:00+00:00',
        cardsCount: 126,
        extensionType: { '@id': '/api/extension_types/1', id: 1, name: 'Set' },
        country: { '@id': '/api/countries/1', id: 1, name: 'France' },
      },
    })
    await settle()
    fetchMock.mockClear()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(call).toBeDefined()
    expect(String(call![0])).toMatch(/\/extensions\/3$/)
    expect(JSON.parse(call![1].body)).toMatchObject({
      name: 'LOB',
      cardsCount: 126,
      extensionType: '/api/extension_types/1',
      country: '/api/countries/1',
      releaseDate: '2002-03-08T00:00:00.000Z',
    })
    expect(wrapper.emitted('extensionSaved')).toHaveLength(1)
  })
})
