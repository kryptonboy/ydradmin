import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import EpisodeEditView from '../EpisodeEditView.vue'

const mounted: VueWrapper[] = []

const episode = {
  '@id': '/api/episodes/5',
  id: 5,
  title: 'Le duel',
  episodeNumber: 1,
  synopsis: 'Court',
  visible: false,
  arcSeason: { '@id': '/api/arc_seasons/2', id: 2 },
  anime: { '@id': '/api/animes/1', id: 1 },
  blocks: [{ type: 'video', url: 'https://example.com/v' }],
  media: {},
  characters: [],
}

/** Répond selon l'URL ; `patch` fixe la réponse à la modification. */
function mockApi(patch: { status: number; body: unknown }) {
  const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const path = String(url)
    let body: unknown = { member: [] }
    let status = 200
    if (init?.method === 'PATCH') {
      body = patch.body
      status = patch.status
    } else if (/\/episodes\/5$/.test(path)) {
      body = episode
    } else if (/\/animes(\?|$)/.test(path)) {
      body = { member: [{ '@id': '/api/animes/1', id: 1, name: 'Yu-Gi-Oh!' }] }
    } else if (/\/arcs\?/.test(path)) {
      body = { member: [{ '@id': '/api/arcs/3', id: 3, name: 'Royaume des duellistes' }] }
    } else if (/\/seasons\?/.test(path)) {
      body = { member: [{ '@id': '/api/seasons/4', id: 4, seasonNumber: 1 }] }
    } else if (/\/arc_seasons\?/.test(path)) {
      body = {
        member: [{ '@id': '/api/arc_seasons/2', id: 2, arc: { id: 3 }, season: { id: 4 } }],
      }
    }
    return Promise.resolve(new Response(JSON.stringify(body), { status }))
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 50))
  await flushPromises()
}

async function mountEdit() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/anime_manga/episode/:id', component: EpisodeEditView },
      { path: '/anime_manga/episode', component: { template: '<div />' } },
    ],
  })
  await router.push('/anime_manga/episode/5')
  const wrapper = mount(EpisodeEditView, {
    attachTo: document.body,
    global: {
      plugins: [createPinia(), router],
      stubs: { FontAwesomeIcon: true, 'multi-select': true },
    },
  })
  mounted.push(wrapper)
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 20))
  await flushPromises()
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('EpisodeEditView', () => {
  it("charge l'épisode, signale le brouillon et propose les arcs / saisons de son animé", async () => {
    mockApi({ status: 200, body: episode })
    const wrapper = await mountEdit()

    expect((wrapper.find('#episode-title').element as HTMLInputElement).value).toBe('Le duel')
    expect(wrapper.text()).toContain('Brouillon')
    expect((wrapper.find('#episode-arc-season').element as HTMLSelectElement).value).toBe(
      '/api/arc_seasons/2',
    )
    expect(wrapper.find('#episode-arc-season').text()).toContain('Royaume des duellistes')
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
  })

  it('envoie les blocs et les relations en IRI', async () => {
    const fetchMock = mockApi({ status: 200, body: episode })
    const wrapper = await mountEdit()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(call).toBeDefined()
    expect(JSON.parse(call![1].body)).toMatchObject({
      title: 'Le duel',
      episodeNumber: 1,
      visible: false,
      arcSeason: '/api/arc_seasons/2',
      blocks: [{ type: 'video', url: 'https://example.com/v' }],
    })
  })

  it('rattache une erreur 422 au bloc fautif et au champ concerné', async () => {
    mockApi({
      status: 422,
      body: {
        detail: 'Données invalides',
        violations: [
          { propertyPath: 'blocks[0].url', message: 'Adresse invalide' },
          { propertyPath: 'title', message: 'Titre déjà utilisé' },
        ],
      },
    })
    const wrapper = await mountEdit()

    await wrapper.find('form').trigger('submit')
    await settle()

    const block = wrapper.find('.block-item')
    expect(block.classes()).toContain('border-danger')
    expect(block.text()).toContain('Adresse invalide')
    expect(wrapper.find('#episode-title').classes()).toContain('is-invalid')
    expect(wrapper.text()).toContain('1 erreur(s) dans le contenu')
  })
})
