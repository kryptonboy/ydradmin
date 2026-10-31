import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RarityModal from '../modals/RarityModal.vue'

const modal = { show: vi.fn(), hide: vi.fn() }

function mockFetch(status: number, body: unknown) {
  const fn = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fn)
  return fn
}

const mounted: VueWrapper[] = []

function mountModal(props: Record<string, unknown> = {}) {
  const wrapper = mount(RarityModal, {
    props,
    attachTo: document.body,
    global: { plugins: [createPinia()], stubs: { FontAwesomeIcon: true } },
  })
  mounted.push(wrapper)
  return wrapper
}

async function fillAndSubmit(wrapper: ReturnType<typeof mountModal>, name: string) {
  await wrapper.find('input[name="name"]').setValue(name)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 20))
  await flushPromises()
}

beforeEach(() => {
  modal.show.mockClear()
  modal.hide.mockClear()
  vi.stubGlobal('bootstrap', {
    Modal: class {
      show = modal.show
      hide = modal.hide
    },
  })
})

afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('RarityModal', () => {
  it('crée la rareté puis ferme la modale et notifie le parent', async () => {
    const fetchMock = mockFetch(201, { id: 1, name: 'Secret Rare' })
    const wrapper = mountModal()

    await fillAndSubmit(wrapper, 'Secret Rare')

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ name: 'Secret Rare' })
    expect(wrapper.emitted('raritySaved')).toHaveLength(1)
    expect(modal.hide).toHaveBeenCalled()
  })

  it("reste ouverte et affiche l'erreur quand l'API refuse", async () => {
    mockFetch(422, { detail: 'name: déjà utilisé', violations: [] })
    const wrapper = mountModal()

    await fillAndSubmit(wrapper, 'Doublon')

    expect(wrapper.find('.alert-danger').text()).toContain('déjà utilisé')
    expect(wrapper.emitted('raritySaved')).toBeUndefined()
    expect(modal.hide).not.toHaveBeenCalled()
  })

  it("modifie l'élément existant (PATCH) en mode édition", async () => {
    const fetchMock = mockFetch(200, {})
    const wrapper = mountModal({
      rarity: { id: 7, name: 'Rare', description: '', position: 1 },
    })

    await fillAndSubmit(wrapper, 'Super Rare')

    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'PATCH' })
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/rarities\/7$/)
  })

  it("n'envoie rien tant que le nom est vide", async () => {
    const fetchMock = mockFetch(201, {})
    const wrapper = mountModal()

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 20))
    await flushPromises()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Nom requis')
  })
})
