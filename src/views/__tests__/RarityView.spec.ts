import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RarityView from '../RarityView.vue'

function mockFetch(body: unknown) {
  const fn = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body))))
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountView() {
  return mount(RarityView, {
    global: {
      plugins: [createPinia()],
      stubs: { RarityModal: true, FontAwesomeIcon: true },
    },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('RarityView', () => {
  it("affiche les raretés renvoyées par l'API", async () => {
    mockFetch({
      member: [
        { '@id': '/api/rarities/1', id: 1, name: 'Ultra Rare', description: '', position: 2 },
      ],
      totalItems: 1,
    })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('Ultra Rare')
  })

  it("trie via l'en-tête de colonne et recharge", async () => {
    const fetchMock = mockFetch({ member: [], totalItems: 0 })
    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('th[role="button"]')[2].trigger('click')
    await flushPromises()

    const lastUrl = String(fetchMock.mock.calls.at(-1)?.[0])
    expect(lastUrl).toContain('order%5Bposition%5D=asc')
    expect(wrapper.text()).toContain('Aucune rareté')
  })
})
