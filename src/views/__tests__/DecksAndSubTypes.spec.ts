import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DeckView from '../DeckView.vue'
import CardSubTypeModal from '../modals/CardSubTypeModal.vue'

const mounted: VueWrapper[] = []

/** Répond selon l'URL : `routes` associe un fragment d'URL à un corps JSON. */
function mockFetch(routes: Record<string, unknown> = {}, defaultBody: unknown = { member: [] }) {
  const fn = vi.fn().mockImplementation((url: string) => {
    const key = Object.keys(routes).find((fragment) => String(url).includes(fragment))
    const body = key ? routes[key] : defaultBody
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountComponent(component: object, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: {
      plugins: [createPinia()],
      stubs: {
        FontAwesomeIcon: true,
        'multi-select': true,
        FileUploader: { template: '<div />', methods: { clearFile() {} } },
      },
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

describe('CardSubTypeModal', () => {
  const cardSubType = {
    id: 5,
    name: 'Fusion',
    cssClass: 'fusion',
    position: 2,
    extraDeck: true,
    cardType: { '@id': '/api/card_types/1', id: 1, name: 'Monstre' },
  }

  it("envoie l'indicateur Extra Deck", async () => {
    const fetchMock = mockFetch({}, {})
    const wrapper = mountComponent(CardSubTypeModal, { cardSubType })
    await settle()

    const checkbox = wrapper.find('#cardSubTypeModal-extraDeck')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)

    await checkbox.setValue(false)
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(JSON.parse(call[1].body)).toMatchObject({ name: 'Fusion', extraDeck: false })
  })
})

describe('DeckView', () => {
  const deck = {
    '@id': '/api/decks/3',
    id: 3,
    name: 'Mon deck',
    author: 'joueur',
    public: true,
    hidden: false,
    gameFormat: { '@id': '/api/game_formats/1', id: 1, name: 'Advanced' },
    updatedAt: '2026-10-01T10:00:00+00:00',
    cards: [
      { abstractCard: { '@id': '/api/abstract_cards/1', name: 'A' }, section: 'main', quantity: 3 },
      { abstractCard: { '@id': '/api/abstract_cards/2', name: 'B' }, section: 'main', quantity: 2 },
      {
        abstractCard: { '@id': '/api/abstract_cards/3', name: 'C' },
        section: 'extra',
        quantity: 1,
      },
    ],
  }
  const routes = { '/decks': { member: [deck], totalItems: 1 } }

  it('résume les cartes par section', async () => {
    mockFetch(routes)
    const wrapper = mountComponent(DeckView)
    await settle()

    expect(wrapper.text()).toContain('Mon deck')
    expect(wrapper.text()).toContain('Main 5 · Extra 1 · Side 0')
  })

  it("masque un deck en n'envoyant que hidden", async () => {
    const fetchMock = mockFetch(routes)
    const wrapper = mountComponent(DeckView)
    await settle()

    await wrapper.find('button[aria-label="Masquer"]').trigger('click')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/decks\/3$/)
    expect(JSON.parse(call[1].body)).toEqual({ hidden: true })
  })

  it('télécharge la feuille PDF avec le jeton et affiche les erreurs', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    URL.createObjectURL = vi.fn().mockReturnValue('blob:pdf')
    URL.revokeObjectURL = vi.fn()
    const fetchMock = vi
      .fn()
      .mockImplementation((url: string) =>
        String(url).includes('/sheet')
          ? Promise.resolve(new Response('%PDF', { status: 200 }))
          : Promise.resolve(new Response(JSON.stringify(routes['/decks']), { status: 200 })),
      )
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mountComponent(DeckView)
    await settle()

    await wrapper.find('button[aria-label="Feuille PDF"]').trigger('click')
    await settle()

    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/decks/3/sheet'))).toBe(true)
    expect(open).toHaveBeenCalledWith('blob:pdf', '_blank')
  })
})
