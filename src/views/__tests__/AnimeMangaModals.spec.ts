import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AnimeModal from '../modals/AnimeModal.vue'
import ArcModal from '../modals/ArcModal.vue'
import CharacterModal from '../modals/CharacterModal.vue'

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
      stubs: {
        FontAwesomeIcon: true,
        FileUploader: { template: '<div />', methods: { clearFile() {} } },
      },
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

describe('AnimeModal', () => {
  it('envoie les dates en ISO et les champs vides à null', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(AnimeModal, {
      anime: {
        id: 4,
        name: 'Yu-Gi-Oh!',
        japaneseName: '',
        synopsis: null,
        japanReleaseDate: '2000-04-18T00:00:00+00:00',
      },
    })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/animes\/4$/)
    expect(JSON.parse(call[1].body)).toEqual({
      name: 'Yu-Gi-Oh!',
      japaneseName: null,
      romanizedJapaneseName: null,
      synopsis: null,
      usReleaseDate: null,
      japanReleaseDate: '2000-04-18T00:00:00+00:00',
      europeReleaseDate: null,
    })
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it("refuse l'envoi sans nom", async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(AnimeModal)
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Nom requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })
})

describe('ArcModal', () => {
  it("rattache l'arc à l'animé par son IRI", async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountModal(ArcModal, { animeIri: '/api/animes/4' })
    await settle()

    await wrapper.find('#arcModal-name').setValue('Duelist Kingdom')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(JSON.parse(call[1].body)).toEqual({
      name: 'Duelist Kingdom',
      position: 0,
      synopsis: null,
      anime: '/api/animes/4',
    })
  })
})

describe('CharacterModal', () => {
  it('exige un genre et envoie les relations en IRI', async () => {
    const fetchMock = mockFetch({
      member: [{ '@id': '/api/genders/2', id: 2, name: 'Masculin' }],
    })
    const wrapper = mountModal(CharacterModal)
    await settle()

    await wrapper.find('#characterModal-name').setValue('Yugi')
    await wrapper.find('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('Genre requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)

    await wrapper.find('#characterModal-gender').setValue('/api/genders/2')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(JSON.parse(call[1].body)).toMatchObject({
      name: 'Yugi',
      gender: '/api/genders/2',
      astrologicalSign: null,
      description: null,
      birthDate: null,
    })
  })
})
