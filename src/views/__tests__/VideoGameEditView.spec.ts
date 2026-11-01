import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import VideoGameEditView from '../VideoGameEditView.vue'

const mounted: VueWrapper[] = []

const game = {
  '@id': '/api/video_games/8',
  id: 8,
  title: 'Duel Links',
  summary: 'Court',
  visible: false,
  videoGameSupport: { '@id': '/api/video_game_supports/2', id: 2, name: 'Mobile' },
  blocks: [{ type: 'video', url: 'https://example.com/v' }],
  media: {},
  characters: [{ id: 1, character: { id: 5, name: 'Yugi' } }],
}

/** Répond selon l'URL ; `write` fixe la réponse aux écritures (PATCH, POST, DELETE). */
function mockApi(write: { status: number; body: unknown } = { status: 200, body: game }) {
  const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const path = String(url)
    let body: unknown = { member: [] }
    let status = 200
    if (init?.method && init.method !== 'GET') {
      body = write.body
      status = write.status
    } else if (/\/video_games\/8$/.test(path)) {
      body = game
    } else if (/\/video_game_supports/.test(path)) {
      body = { member: [{ '@id': '/api/video_game_supports/2', id: 2, name: 'Mobile' }] }
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
      { path: '/video_game/game/:id', component: VideoGameEditView },
      { path: '/video_game/game', component: { template: '<div />' } },
    ],
  })
  await router.push('/video_game/game/8')
  const wrapper = mount(VideoGameEditView, {
    attachTo: document.body,
    global: {
      plugins: [createPinia(), router],
      stubs: { FontAwesomeIcon: true, 'multi-select': true },
    },
  })
  mounted.push(wrapper)
  await settle()
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('VideoGameEditView', () => {
  it('charge le jeu, signale le brouillon et liste ses personnages', async () => {
    mockApi()
    const wrapper = await mountEdit()

    expect((wrapper.find('#game-title').element as HTMLInputElement).value).toBe('Duel Links')
    expect((wrapper.find('#game-support').element as HTMLSelectElement).value).toBe(
      '/api/video_game_supports/2',
    )
    expect(wrapper.text()).toContain('Brouillon')
    expect(wrapper.text()).toContain('Yugi')
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
  })

  it('envoie les blocs et le support en IRI, sans champ « test »', async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEdit()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(call).toBeDefined()
    const body = JSON.parse(call![1].body)
    expect(body).toMatchObject({
      title: 'Duel Links',
      summary: 'Court',
      visible: false,
      videoGameSupport: '/api/video_game_supports/2',
      blocks: [{ type: 'video', url: 'https://example.com/v' }],
    })
    expect(body).not.toHaveProperty('test')
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
    expect(wrapper.find('#game-title').classes()).toContain('is-invalid')
  })

  it('retire un personnage avec DELETE sur video_game_characters', async () => {
    const fetchMock = mockApi()
    vi.stubGlobal('confirm', () => true)
    const wrapper = await mountEdit()

    await wrapper.find('button[aria-label="Retirer le personnage"]').trigger('click')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')
    expect(String(call![0])).toMatch(/\/video_game_characters\/1$/)
  })
})
