import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GameFormatModal from '../modals/GameFormatModal.vue'
import RestrictionModal from '../modals/RestrictionModal.vue'

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

describe('RestrictionModal', () => {
  const restriction = {
    id: 9,
    cardGroup: { '@id': '/api/card_groups/4', id: 4, name: 'Pot of Greed' },
    gameFormat: { '@id': '/api/game_formats/2', id: 2, name: 'Edison' },
    limitNumber: 2,
  }

  it('envoie le groupe et le format en IRI et la limite en nombre', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(RestrictionModal, { restriction })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/restrictions\/9$/)
    expect(JSON.parse(call[1].body)).toEqual({
      cardGroup: '/api/card_groups/4',
      gameFormat: '/api/game_formats/2',
      limitNumber: 2,
    })
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('propose les trois limites', async () => {
    mockFetch({})
    const wrapper = mountModal(RestrictionModal, { restriction })
    await settle()

    const options = wrapper.findAll('#restrictionModal-limitNumber option')
    expect(options.map((o) => o.text())).toEqual([
      'Interdite (0)',
      'Limitée (1)',
      'Semi-limitée (2)',
    ])
  })

  it('exige un groupe et un format à la création', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(RestrictionModal)
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Format requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it('affiche le conflit renvoyé par l’API (unicité groupe / format)', async () => {
    mockFetch(
      {
        detail: 'Une restriction existe déjà pour ce groupe dans ce format.',
        violations: [],
      },
      422,
    )
    const wrapper = mountModal(RestrictionModal, { restriction })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Une restriction existe déjà pour ce groupe dans ce format.')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })
})

describe('GameFormatModal', () => {
  it('envoie le nom et la description', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(GameFormatModal)
    await settle()

    await wrapper.find('#gameFormatModal-name').setValue('Edison')
    await wrapper.find('#gameFormatModal-description').setValue('Format 2010')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(JSON.parse(call[1].body)).toEqual({ name: 'Edison', description: 'Format 2010' })
  })
})
