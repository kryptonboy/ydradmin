import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import ActualityEditView from '../ActualityEditView.vue'
import TagModal from '../modals/TagModal.vue'

const mounted: VueWrapper[] = []

function mockFetch(getBody: (url: string) => unknown = () => ({ member: [] })) {
  const fn = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    const body = init?.method && init.method !== 'GET' ? { id: 1 } : getBody(String(url))
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

const settle = async () => {
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 50))
  await flushPromises()
}

const stubs = {
  FontAwesomeIcon: true,
  'multi-select': true,
  BlockEditor: true,
  FileUploader: { template: '<div />', methods: { clearFile() {} } },
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

describe('TagModal : description pour les moteurs', () => {
  function mountTag() {
    const wrapper = mount(TagModal, {
      attachTo: document.body,
      global: { plugins: [createPinia()], stubs },
    })
    mounted.push(wrapper)
    return wrapper
  }

  it('crée un tag avec sa description pour les moteurs', async () => {
    const fetchMock = mockFetch()
    const wrapper = mountTag()
    await settle()

    await wrapper.find('#tagModal-name').setValue('Dragons')
    await wrapper.find('#tagModal-description').setValue('Les dragons')
    await wrapper.find('#tagModal-metaDescription').setValue('Toutes les cartes Dragon')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(JSON.parse(writes(fetchMock, 'POST')[0]![1].body)).toMatchObject({
      name: 'Dragons',
      metaDescription: 'Toutes les cartes Dragon',
    })
  })

  it('refuse plus de 320 caractères', async () => {
    const fetchMock = mockFetch()
    const wrapper = mountTag()
    await settle()

    await wrapper.find('#tagModal-name').setValue('Dragons')
    await wrapper.find('#tagModal-description').setValue('Les dragons')
    await wrapper.find('#tagModal-metaDescription').setValue('x'.repeat(321))
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('320 caractères maximum')
    expect(wrapper.find('[data-test="meta-count"]').classes()).toContain('text-danger')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })
})

describe('ActualityEditView : auteur et description pour les moteurs', () => {
  const actuality = {
    '@id': '/api/actualities/3',
    id: 3,
    title: 'Nouvelle extension',
    headnote: 'Le chapô',
    commentable: true,
    visible: true,
    authorName: 'La rédaction',
    blocks: [],
    media: {},
  }

  async function mountActuality() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/content/actuality/:id', component: ActualityEditView },
        { path: '/content/actuality', component: { template: '<div />' } },
      ],
    })
    await router.push('/content/actuality/3')
    const wrapper = mount(ActualityEditView, {
      attachTo: document.body,
      global: { plugins: [createPinia(), router], stubs },
    })
    mounted.push(wrapper)
    await settle()
    return wrapper
  }

  it("charge l'auteur, l'envoie nettoyé et efface une description vide", async () => {
    const fetchMock = mockFetch((url) =>
      /\/actualities\/3$/.test(url) ? actuality : { member: [] },
    )
    const wrapper = await mountActuality()

    expect((wrapper.find('#actuality-authorName').element as HTMLInputElement).value).toBe(
      'La rédaction',
    )
    expect((wrapper.find('#actuality-metaDescription').element as HTMLTextAreaElement).value).toBe(
      '',
    )

    await wrapper.find('#actuality-authorName').setValue('  Kaiba  ')
    await wrapper.find('form').trigger('submit')
    await settle()

    const body = JSON.parse(writes(fetchMock, 'PATCH')[0]![1].body)
    expect(body.authorName).toBe('Kaiba')
    expect(body.metaDescription).toBeNull()
  })
})
