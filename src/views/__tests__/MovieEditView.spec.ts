import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import MovieEditView from '../MovieEditView.vue'

const mounted: VueWrapper[] = []

const movie = {
  '@id': '/api/movies/6',
  id: 6,
  title: 'Pyramid of Light',
  synopsis: 'Court',
  visible: false,
  japanReleaseDate: '2004-09-04T00:00:00+00:00',
  blocks: [{ type: 'video', url: 'https://example.com/v' }],
  media: {},
  characters: [
    {
      id: 1,
      mainCharacter: true,
      position: 0,
      character: { id: 5, name: 'Yugi' },
      cards: [{ '@id': '/api/abstract_cards/10', id: 10, name: 'Magicien Sombre' }],
    },
  ],
}

/** Répond selon l'URL ; `write` fixe la réponse aux écritures (PATCH, POST, DELETE). */
function mockApi(write: { status: number; body: unknown } = { status: 200, body: movie }) {
  const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const path = String(url)
    let body: unknown = { member: [] }
    let status = 200
    if (init?.method && init.method !== 'GET') {
      body = write.body
      status = write.status
    } else if (/\/movies\/6$/.test(path)) {
      body = movie
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
      { path: '/anime_manga/movie/:id', component: MovieEditView },
      { path: '/anime_manga/movie', component: { template: '<div />' } },
    ],
  })
  await router.push('/anime_manga/movie/6')
  const wrapper = mount(MovieEditView, {
    attachTo: document.body,
    global: {
      plugins: [createPinia(), router],
      stubs: {
        FontAwesomeIcon: true,
        'multi-select': true,
        FileUploader: { template: '<div />', methods: { clearFile() {} } },
      },
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

describe('MovieEditView', () => {
  it('charge le film, signale le brouillon et affiche personnage principal et cartes', async () => {
    mockApi()
    const wrapper = await mountEdit()

    expect((wrapper.find('#movie-title').element as HTMLInputElement).value).toBe(
      'Pyramid of Light',
    )
    expect((wrapper.find('#movie-japan-date').element as HTMLInputElement).value).toBe('2004-09-04')
    expect(wrapper.text()).toContain('Brouillon')
    expect(wrapper.text()).toContain('Yugi')
    expect(wrapper.text()).toContain('Principal')
    expect(wrapper.text()).toContain('Magicien Sombre')
  })

  it('envoie les dates en ISO, les blocs et omet les images inchangées', async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEdit()

    await wrapper.find('form').trigger('submit')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(call).toBeDefined()
    const body = JSON.parse(call![1].body)
    expect(body).toMatchObject({
      title: 'Pyramid of Light',
      visible: false,
      japanReleaseDate: '2004-09-04T00:00:00+00:00',
      usReleaseDate: null,
      blocks: [{ type: 'video', url: 'https://example.com/v' }],
    })
    expect(body).not.toHaveProperty('coverImage')
    expect(body).not.toHaveProperty('titleImage')
    expect(body).not.toHaveProperty('detailedSummary')
  })

  it('ajoute un personnage avec position et statut de principal, cartes en IRI', async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEdit()

    // Édition du personnage existant : position et personnage principal
    await wrapper.find('button[aria-label="Modifier les cartes"]').trigger('click')
    await wrapper.find('#position-1').setValue('3')
    await wrapper.find('#main-1').setValue(false)
    const save = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Enregistrer') && !b.attributes('type')?.includes('submit'))
    await save?.trigger('click')
    await settle()

    const call = fetchMock.mock.calls.find(
      ([url, init]) => init?.method === 'PATCH' && /\/movie_characters\/1$/.test(String(url)),
    )
    expect(call).toBeDefined()
    expect(JSON.parse(call![1].body)).toEqual({
      cards: ['/api/abstract_cards/10'],
      mainCharacter: false,
      position: 3,
    })
  })

  it('rattache une erreur 422 au bloc fautif', async () => {
    mockApi({
      status: 422,
      body: {
        detail: 'Données invalides',
        violations: [{ propertyPath: 'blocks[0].url', message: 'Adresse invalide' }],
      },
    })
    const wrapper = await mountEdit()

    await wrapper.find('form').trigger('submit')
    await settle()

    const block = wrapper.find('.block-item')
    expect(block.classes()).toContain('border-danger')
    expect(block.text()).toContain('Adresse invalide')
  })
})
