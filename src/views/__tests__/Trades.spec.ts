import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TradeView from '../TradeView.vue'

const mounted: VueWrapper[] = []

/** Répond selon l'URL : `routes` associe un fragment d'URL à un corps JSON. */
function mockFetch(routes: Record<string, unknown> = {}) {
  const fn = vi.fn().mockImplementation((url: string) => {
    const key = Object.keys(routes).find((fragment) => String(url).includes(fragment))
    const body = key ? routes[key] : { member: [] }
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountView(username = 'admin') {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().user = { id: 1, username, avatar: '' }
  const wrapper = mount(TradeView, {
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

const cancelButton = (wrapper: VueWrapper) =>
  wrapper.findAll('button').find((b) => b.text().includes("Annuler l'échange"))

const line = (id: number, revision: number, giverName: string, extra = {}) => ({
  id,
  revision,
  giverName,
  card: { '@id': `/api/cards/${id}`, name: `Carte ${id}`, reference: `LOB-FR00${id}` },
  rarity: { '@id': '/api/rarities/1', name: 'Ultra Rare' },
  condition: 'NM',
  language: 'fr',
  edition: 'unlimited',
  grade: null,
  certificateNumber: null,
  quantity: 2,
  unitValue: 1.5,
  receivedQuantity: null,
  wishlistReduced: 0,
  ...extra,
})

const trade = (extra = {}) => ({
  '@id': '/api/trades/9',
  id: 9,
  status: 'negotiating',
  revision: 2,
  partial: false,
  proposerName: 'alice',
  recipientName: 'bob',
  turnName: 'alice',
  proposerConfirmed: false,
  recipientConfirmed: false,
  createdAt: '2026-10-01T10:00:00+00:00',
  updatedAt: '2026-10-02T10:00:00+00:00',
  balance: { proposer: 3, recipient: 1.5, difference: 1.5 },
  proposerUpdatesCollection: true,
  recipientUpdatesCollection: true,
  mediationState: 'none',
  lines: [line(1, 1, 'alice'), line(2, 2, 'alice'), line(3, 2, 'bob')],
  ...extra,
})

const messages = {
  member: [
    {
      id: 1,
      content: 'Salut <b>!</b>',
      createdAt: '2026-10-01T10:05:00+00:00',
      authorName: 'alice',
    },
  ],
}
const ratings = {
  member: [{ id: 1, score: 5, comment: 'Parfait', raterName: 'alice', ratedName: 'bob' }],
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

describe('TradeView', () => {
  it('liste les échanges avec le badge partiel', async () => {
    mockFetch({
      '/trades': { member: [trade({ status: 'completed', partial: true })], totalItems: 1 },
    })
    const wrapper = mountView()
    await settle()

    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('Terminé')
    expect(wrapper.text()).toContain('Partiel')
  })

  it('envoie les filtres de statut et de joueurs', async () => {
    const fetchMock = mockFetch({ '/trades': { member: [], totalItems: 0 } })
    const wrapper = mountView()
    await settle()

    await wrapper.find('#trade_status').setValue('accepted')
    await wrapper.find('#trade_proposer').setValue('alice')
    const apply = wrapper.findAll('button').find((b) => b.text().includes('Appliquer'))
    await apply?.trigger('click')
    await settle()

    const urls = fetchMock.mock.calls.map(([u]) => String(u))
    const url = urls.find((u) => u.includes('status=accepted'))
    expect(url).toContain('proposer=alice')
  })

  it('affiche le détail groupé par révision, messages et évaluations', async () => {
    mockFetch({
      '/trade_messages': messages,
      '/trade_ratings': ratings,
      '/trades': { member: [trade()], totalItems: 1 },
    })
    const wrapper = mountView()
    await settle()

    await wrapper.find('button[aria-label="Détail"]').trigger('click')
    await settle()

    const text = wrapper.text()
    expect(text).toContain('Proposition 2')
    expect(text).toContain('Proposition 1')
    expect(text.indexOf('Proposition 2')).toBeLessThan(text.indexOf('Proposition 1'))
    expect(wrapper.find('[data-test="messages"]').text()).toContain('Salut <b>!</b>')
    expect(wrapper.find('[data-test="ratings"]').text()).toContain('5/5')
    expect(wrapper.find('[data-test="balance"]').text()).toContain('1,50 €')
  })

  it('montre le reçu face à la quantité pour un échange partiel', async () => {
    mockFetch({
      '/trades': {
        member: [
          trade({
            status: 'completed',
            partial: true,
            revision: 1,
            lines: [line(1, 1, 'alice', { receivedQuantity: 1 })],
          }),
        ],
        totalItems: 1,
      },
    })
    const wrapper = mountView()
    await settle()

    await wrapper.find('button[aria-label="Détail"]').trigger('click')
    await settle()

    expect(wrapper.text()).toContain('1 / 2')
  })

  it("annule l'échange après confirmation", async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const fetchMock = mockFetch({
      '/trade_messages': { member: [] },
      '/trade_ratings': { member: [] },
      '/trades': { member: [trade()], totalItems: 1 },
    })
    const wrapper = mountView()
    await settle()
    await wrapper.find('button[aria-label="Détail"]').trigger('click')
    await settle()

    await cancelButton(wrapper)?.trigger('click')
    await settle()

    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(String(post?.[0])).toMatch(/\/trades\/9\/cancel$/)
  })

  it("n'offre pas d'annulation pour un échange terminé", async () => {
    mockFetch({ '/trades': { member: [trade({ status: 'completed' })], totalItems: 1 } })
    const wrapper = mountView()
    await settle()
    await wrapper.find('button[aria-label="Détail"]').trigger('click')
    await settle()

    expect(cancelButton(wrapper)).toBeUndefined()
  })

  it("affiche l'erreur 409 de l'annulation", async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ detail: 'Échange déjà terminé.' }), { status: 409 }),
        )
      }
      const body = String(url).includes('/trades')
        ? { member: [trade()], totalItems: 1 }
        : { member: [] }
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
    })
    vi.stubGlobal('fetch', fn)
    const wrapper = mountView()
    await settle()
    await wrapper.find('button[aria-label="Détail"]').trigger('click')
    await settle()

    await cancelButton(wrapper)?.trigger('click')
    await settle()

    expect(wrapper.text()).toContain('Échange déjà terminé.')
  })

  describe('médiation', () => {
    const requested = trade({
      mediationState: 'requested',
      mediationRequestedByName: 'bob',
      mediationRequestedAt: '2026-10-03T10:00:00+00:00',
    })
    const taken = trade({ mediationState: 'taken', mediatorName: 'medi' })
    const buttonByText = (wrapper: VueWrapper, text: string) =>
      wrapper.findAll('button').find((b) => b.text().includes(text))
    const open = async (wrapper: VueWrapper) => {
      await settle()
      await wrapper.find('button[aria-label="Détail"]').trigger('click')
      await settle()
    }

    it("affiche l'état de médiation dans la liste", async () => {
      mockFetch({ '/trades': { member: [requested], totalItems: 1 } })
      const wrapper = mountView()
      await settle()

      expect(wrapper.text()).toContain('À traiter')
    })

    it('envoie les filtres de médiation', async () => {
      const fetchMock = mockFetch({ '/trades': { member: [], totalItems: 0 } })
      const wrapper = mountView()
      await settle()

      await wrapper.find('#trade_mediation').setValue('requested')
      await wrapper.find('#trade_mediator').setValue('medi')
      await buttonByText(wrapper, 'Appliquer')?.trigger('click')
      await settle()

      const url = fetchMock.mock.calls
        .map(([u]) => String(u))
        .find((u) => u.includes('mediation=requested'))
      expect(url).toContain('mediator=medi')
    })

    it('prend en charge une demande', async () => {
      const fetchMock = mockFetch({ '/trades': { member: [requested], totalItems: 1 } })
      const wrapper = mountView('medi')
      await open(wrapper)

      expect(buttonByText(wrapper, 'Remettre dans la file')).toBeUndefined()
      await buttonByText(wrapper, 'Prendre en charge')?.trigger('click')
      await settle()

      const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
      expect(String(post?.[0])).toMatch(/\/trades\/9\/mediation\/take$/)
    })

    it("remet l'échange dans la file", async () => {
      const fetchMock = mockFetch({ '/trades': { member: [taken], totalItems: 1 } })
      const wrapper = mountView('medi')
      await open(wrapper)

      await buttonByText(wrapper, 'Remettre dans la file')?.trigger('click')
      await settle()

      const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
      expect(String(post?.[0])).toMatch(/\/trades\/9\/mediation\/release$/)
    })

    it('laisse écrire le médiateur en charge seulement', async () => {
      mockFetch({ '/trades': { member: [taken], totalItems: 1 } })
      const other = mountView('autre')
      await open(other)
      expect(other.find('[data-test="write"]').exists()).toBe(false)
      other.unmount()

      const fetchMock = mockFetch({ '/trades': { member: [taken], totalItems: 1 } })
      const wrapper = mountView('medi')
      await open(wrapper)
      await wrapper.find('#trade_message').setValue('Bonjour')
      await wrapper.find('[data-test="write"]').trigger('submit')
      await settle()

      const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
      expect(String(post?.[0])).toMatch(/\/trade_messages$/)
      expect(JSON.parse(String(post?.[1].body))).toEqual({
        trade: '/api/trades/9',
        content: 'Bonjour',
      })
    })

    it('affiche la mise à jour des collections d’un échange terminé', async () => {
      mockFetch({
        '/trades': {
          member: [
            trade({
              status: 'completed',
              proposerUpdatesCollection: true,
              recipientUpdatesCollection: false,
            }),
          ],
          totalItems: 1,
        },
      })
      const wrapper = mountView()
      await open(wrapper)

      const text = wrapper.find('[data-test="collection-update"]').text()
      expect(text).toContain('alice oui')
      expect(text).toContain('bob non')
    })
  })
})
