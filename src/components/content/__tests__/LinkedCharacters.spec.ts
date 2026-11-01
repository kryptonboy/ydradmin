import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LinkedCharacters from '../LinkedCharacters.vue'

const mounted: VueWrapper[] = []

/** Répond selon l'URL ; `links` est le contenu de la liste lue par filtre. */
function mockApi(
  links: unknown[],
  write: { status: number; body: unknown } = { status: 200, body: {} },
) {
  const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    let body: unknown = { member: [] }
    let status = 200
    if (init?.method && init.method !== 'GET') {
      body = write.body
      status = write.status
    } else if (/manga_characters\?|arc_characters\?/.test(String(url))) {
      body = { member: links }
    }
    return Promise.resolve(new Response(JSON.stringify(body), { status }))
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 30))
  await flushPromises()
}

async function mountList(kind: 'manga' | 'arc') {
  const wrapper = mount(LinkedCharacters, {
    props: { kind, parentId: 3, parentIri: `/api/${kind === 'manga' ? 'mangas' : 'arcs'}/3` },
    attachTo: document.body,
    global: { plugins: [createPinia()], stubs: { FontAwesomeIcon: true, 'multi-select': true } },
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

describe('LinkedCharacters', () => {
  it("lit les personnages d'un manga triés par position, avec le statut de principal", async () => {
    const fetchMock = mockApi([
      { id: 1, character: { id: 5, name: 'Yugi' }, mainCharacter: true, position: 0 },
      { id: 2, character: { id: 6, name: 'Joey' }, mainCharacter: false, position: 1 },
    ])
    const wrapper = await mountList('manga')

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toMatch(/manga_characters\?manga=3&order\[position\]=asc$/)
    expect(wrapper.text()).toContain('Yugi')
    expect(wrapper.text()).toContain('Principal')
    expect(wrapper.text()).toContain('Joey')
    expect(wrapper.text()).toContain('position 1')
  })

  it("lit les personnages d'un arc, sans position ni statut", async () => {
    const fetchMock = mockApi([{ id: 1, character: { id: 5, name: 'Yugi' } }])
    const wrapper = await mountList('arc')

    expect(String(fetchMock.mock.calls[0][0])).toMatch(/arc_characters\?arc=3$/)
    expect(wrapper.text()).toContain('Yugi')
    expect(wrapper.text()).not.toContain('Principal')
    expect(wrapper.find('button[aria-label="Modifier le personnage"]').exists()).toBe(false)
  })

  it('modifie la position et le statut de principal avec PATCH', async () => {
    const fetchMock = mockApi([
      { id: 7, character: { id: 5, name: 'Yugi' }, mainCharacter: false, position: 0 },
    ])
    const wrapper = await mountList('manga')

    await wrapper.find('button[aria-label="Modifier le personnage"]').trigger('click')
    await wrapper.find('#linked-position-7').setValue('4')
    await wrapper.find('#linked-main-7').setValue(true)
    const save = wrapper.findAll('button').find((b) => b.text().includes('Enregistrer'))
    await save?.trigger('click')
    await settle()

    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(String(call![0])).toMatch(/\/manga_characters\/7$/)
    expect(JSON.parse(call![1].body)).toEqual({ mainCharacter: true, position: 4 })
  })

  it('retire un personnage avec DELETE puis recharge la liste', async () => {
    vi.stubGlobal('confirm', () => true)
    const fetchMock = mockApi([{ id: 1, character: { id: 5, name: 'Yugi' } }])
    const wrapper = await mountList('arc')

    await wrapper.find('button[aria-label="Retirer le personnage"]').trigger('click')
    await settle()

    const del = fetchMock.mock.calls.find(([, init]) => init?.method === 'DELETE')
    expect(String(del![0])).toMatch(/\/arc_characters\/1$/)
    const reads = fetchMock.mock.calls.filter(([, init]) => !init?.method || init.method === 'GET')
    expect(reads.length).toBeGreaterThanOrEqual(2)
  })

  it("affiche l'erreur de l'API quand l'écriture est refusée", async () => {
    vi.stubGlobal('confirm', () => true)
    mockApi([{ id: 1, character: { id: 5, name: 'Yugi' } }], {
      status: 409,
      body: { detail: 'Conflit de suppression.' },
    })
    const wrapper = await mountList('arc')

    await wrapper.find('button[aria-label="Retirer le personnage"]').trigger('click')
    await settle()

    expect(wrapper.find('.alert-danger').text()).toContain('Conflit de suppression.')
  })
})
