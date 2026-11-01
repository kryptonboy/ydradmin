import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ContentEditor from '../ContentEditor.vue'

const mounted: VueWrapper[] = []

const detail = {
  id: 2,
  name: 'Yu-Gi-Oh!',
  blocks: [{ type: 'video', url: 'https://example.com/v' }],
  media: {},
}

/** Répond au détail en lecture ; `patch` fixe la réponse à la modification. */
function mockApi(patch: { status: number; body: unknown } = { status: 200, body: detail }) {
  const fn = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    const isPatch = init?.method === 'PATCH'
    return Promise.resolve(
      new Response(JSON.stringify(isPatch ? patch.body : detail), {
        status: isPatch ? patch.status : 200,
      }),
    )
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 30))
  await flushPromises()
}

async function mountEditor(resource = 'animes') {
  const wrapper = mount(ContentEditor, {
    props: { resource, id: 2 },
    attachTo: document.body,
    global: { plugins: [createPinia()], stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  await settle()
  return wrapper
}

const saveButton = (wrapper: VueWrapper) =>
  wrapper.findAll('button').find((b) => b.text().includes('Enregistrer le contenu'))

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('ContentEditor', () => {
  it('charge les blocs de la ressource demandée', async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEditor('mangas')

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/mangas\/2$/)
    expect(wrapper.find('input[type="url"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('1 bloc(s)')
  })

  it("n'envoie que les blocs (les autres champs de la fiche restent inchangés)", async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEditor('characters')

    await saveButton(wrapper)?.trigger('click')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(String(call![0])).toMatch(/\/characters\/2$/)
    expect(JSON.parse(call![1].body)).toEqual({
      blocks: [{ type: 'video', url: 'https://example.com/v' }],
    })
    expect(wrapper.text()).toContain('Contenu enregistré.')
  })

  it('envoie une liste vide quand tous les blocs sont retirés', async () => {
    const fetchMock = mockApi()
    const wrapper = await mountEditor()

    await wrapper.find('button[aria-label="Supprimer le bloc"]').trigger('click')
    await saveButton(wrapper)?.trigger('click')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(JSON.parse(call![1].body)).toEqual({ blocks: [] })
  })

  it('rattache une erreur 422 au bloc fautif et conserve les modifications', async () => {
    mockApi({
      status: 422,
      body: {
        detail: 'Données invalides',
        violations: [{ propertyPath: 'blocks[0].url', message: 'Adresse invalide' }],
      },
    })
    const wrapper = await mountEditor()

    await wrapper.find('input[type="url"]').setValue('javascript:alert(1)')
    await saveButton(wrapper)?.trigger('click')
    await settle()

    const block = wrapper.find('.block-item')
    expect(block.classes()).toContain('border-danger')
    expect(block.text()).toContain('Adresse invalide')
    expect((wrapper.find('input[type="url"]').element as HTMLInputElement).value).toBe(
      'javascript:alert(1)',
    )
    expect(wrapper.text()).not.toContain('Contenu enregistré.')
  })
})
