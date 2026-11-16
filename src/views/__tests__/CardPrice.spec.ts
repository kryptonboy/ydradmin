import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CardPriceView from '../CardPriceView.vue'
import CardPriceHistoryModal from '../modals/CardPriceHistoryModal.vue'
import CardPriceModal from '../modals/CardPriceModal.vue'

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

/** Sélecteur simplifié : une saisie déclenche la recherche, le bouton choisit la 1re option */
const MultiSelectStub = {
  props: ['options', 'modelValue'],
  emits: ['update:modelValue', 'search-change'],
  template: `<div>
    <input class="ms-search" @input="$emit('search-change', $event.target.value)" />
    <button type="button" class="ms-pick" @click="$emit('update:modelValue', options[0])">pick</button>
  </div>`,
}

function mountComponent(component: object, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: {
      plugins: [createPinia()],
      stubs: { FontAwesomeIcon: true, 'multi-select': MultiSelectStub },
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

const urls = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.map(([url]) => decodeURIComponent(String(url)))

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

const price = {
  '@id': '/api/card_prices/4',
  id: 4,
  card: {
    '@id': '/api/cards/10',
    id: 10,
    name: 'Magicien Sombre',
    reference: 'LOB-005',
    extension: { '@id': '/api/extensions/1', id: 1, name: 'Legend of Blue Eyes' },
  },
  rarity: { '@id': '/api/rarities/2', id: 2, name: 'Ultra Rare' },
  amount: 12.5,
  updatedAt: '2026-11-01T10:00:00+00:00',
}

describe('CardPriceView', () => {
  it('liste les prix avec la carte, la rareté et le montant', async () => {
    mockFetch({ '/card_prices': { member: [price], totalItems: 1 } })
    const wrapper = mountComponent(CardPriceView)
    await settle()

    expect(wrapper.text()).toContain('Magicien Sombre (LOB-005)')
    expect(wrapper.text()).toContain('Legend of Blue Eyes')
    expect(wrapper.text()).toContain('Ultra Rare')
    expect(wrapper.text()).toContain('12,50 €')
  })

  it("affiche l'IRI quand l'API n'envoie que la relation", async () => {
    const bare = { ...price, card: { '@id': '/api/cards/10', id: 10 } }
    mockFetch({ '/card_prices': { member: [bare], totalItems: 1 } })
    const wrapper = mountComponent(CardPriceView)
    await settle()

    expect(wrapper.text()).toContain('/api/cards/10')
  })
})

describe('CardPriceModal', () => {
  const card = {
    '@id': '/api/cards/10',
    id: 10,
    name: 'Magicien Sombre',
    reference: 'LOB-005',
    rarities: [
      { '@id': '/api/rarities/1', id: 1, name: 'Commune' },
      { '@id': '/api/rarities/2', id: 2, name: 'Ultra Rare' },
    ],
  }

  it("crée un prix pour une rareté de l'impression choisie", async () => {
    const fetchMock = mockFetch({ '/cards?name=': { member: [card] } }, { member: [] })
    const wrapper = mountComponent(CardPriceModal)
    await settle()

    await wrapper.find('.ms-search').setValue('Magicien')
    await settle()
    await wrapper.find('.ms-pick').trigger('click')
    await settle()

    const options = wrapper.findAll('#cardPriceModal-rarity option').map((o) => o.text())
    expect(options).toEqual(['Choisir une rareté', 'Commune', 'Ultra Rare'])

    await wrapper.find('#cardPriceModal-rarity').setValue('/api/rarities/2')
    await wrapper.find('#cardPriceModal-amount').setValue('12.345')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]!
    expect(String(call[0])).toMatch(/\/card_prices$/)
    expect(JSON.parse(call[1].body)).toEqual({
      card: '/api/cards/10',
      rarity: '/api/rarities/2',
      amount: 12.35,
    })
  })

  it('exige la carte, la rareté et un prix positif', async () => {
    const fetchMock = mockFetch()
    const wrapper = mountComponent(CardPriceModal)
    await settle()

    await wrapper.find('#cardPriceModal-amount').setValue('-1')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Carte requise')
    expect(wrapper.text()).toContain('Rareté requise')
    expect(wrapper.text()).toContain('Le prix ne peut pas être négatif')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it("en édition, n'envoie que le montant", async () => {
    const fetchMock = mockFetch({}, {})
    const wrapper = mountComponent(CardPriceModal, { cardPrice: price })
    await settle()

    expect(wrapper.find('[data-test="card"]').text()).toBe('Magicien Sombre (LOB-005)')
    expect(wrapper.find('#cardPriceModal-rarity').exists()).toBe(false)

    await wrapper.find('#cardPriceModal-amount').setValue('15')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]!
    expect(String(call[0])).toMatch(/\/card_prices\/4$/)
    expect(JSON.parse(call[1].body)).toEqual({ amount: 15 })
  })
})

describe('CardPriceHistoryModal', () => {
  const history = {
    member: [
      {
        '@id': '/api/card_price_histories/1',
        id: 1,
        amount: 10,
        recordedAt: '2026-09-01T10:00:00+00:00',
      },
      {
        '@id': '/api/card_price_histories/2',
        id: 2,
        amount: 12.5,
        recordedAt: '2026-11-01T10:00:00+00:00',
      },
    ],
    totalItems: 2,
  }

  it("affiche les points dans l'ordre avec leur écart, filtrés par date", async () => {
    const fetchMock = mockFetch({ '/card_price_histories': history })
    const wrapper = mountComponent(CardPriceHistoryModal, { cardPrice: price })
    await (wrapper.vm as unknown as { showModal: () => Promise<void> }).showModal()
    await settle()

    const rows = wrapper.findAll('[data-test="history"] tbody tr').map((r) => r.text())
    expect(rows).toHaveLength(2)
    expect(rows[0]).toContain('10,00 €')
    expect(rows[1]).toContain('+2,50 €')
    expect(urls(fetchMock).at(-1)).toContain('card=10&rarity=2')
    expect(urls(fetchMock).at(-1)).toContain('order[recordedAt]=asc')

    await wrapper.find('#cardPriceHistory_since').setValue('2026-10-01')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(urls(fetchMock).at(-1)).toContain('recordedAt[gte]=2026-10-01T00:00:00+00:00')
  })
})
