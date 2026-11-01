import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AbstractCardModal from '../modals/AbstractCardModal.vue'
import RulingModal from '../modals/RulingModal.vue'

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
      stubs: { FontAwesomeIcon: true, 'multi-select': true },
    },
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

describe('RulingModal', () => {
  const ruling = {
    id: 4,
    name: 'Chaîne de résolution',
    ruling: 'Texte du ruling',
    abstractCards: [
      { '@id': '/api/abstract_cards/10', id: 10, name: 'Magicien Sombre' },
      { '@id': '/api/abstract_cards/11', id: 11, name: 'Kuriboh' },
    ],
  }

  it('envoie les cartes en IRI', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(RulingModal, { ruling })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/rulings\/4$/)
    expect(JSON.parse(call[1].body)).toEqual({
      name: 'Chaîne de résolution',
      ruling: 'Texte du ruling',
      abstractCards: ['/api/abstract_cards/10', '/api/abstract_cards/11'],
    })
  })

  it('exige un nom et un texte', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(RulingModal)
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Nom requis')
    expect(wrapper.text()).toContain('Texte du ruling requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it("affiche l'erreur 422 de l'API sur le champ concerné", async () => {
    mockFetch(
      {
        detail: 'Données invalides',
        violations: [{ propertyPath: 'ruling', message: 'Texte trop court' }],
      },
      422,
    )
    const wrapper = mountModal(RulingModal, { ruling })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Texte trop court')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })
})

describe('AbstractCardModal (rulings)', () => {
  const abstractCard = {
    id: 8,
    name: 'Magicien Sombre',
    cardSubType: { '@id': '/api/card_sub_types/1', id: 1, name: 'Normal' },
    monsterEffects: [],
    tags: [],
    rulings: [{ '@id': '/api/rulings/4', id: 4, name: 'Chaîne de résolution' }],
  }

  it('envoie les rulings en IRI', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(AbstractCardModal, { abstractCard })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(JSON.parse(call[1].body).rulings).toEqual(['/api/rulings/4'])
  })

  it('envoie une liste vide pour détacher tous les rulings', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(AbstractCardModal, {
      abstractCard: { ...abstractCard, rulings: [] },
    })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(JSON.parse(call[1].body).rulings).toEqual([])
  })
})
