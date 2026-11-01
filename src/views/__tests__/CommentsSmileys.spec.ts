import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ActualityCommentView from '../ActualityCommentView.vue'
import ActualityCommentModal from '../modals/ActualityCommentModal.vue'
import SmileyModal from '../modals/SmileyModal.vue'

const mounted: VueWrapper[] = []

function mockFetch(body: unknown = { member: [] }, status = 200) {
  const fn = vi
    .fn()
    .mockImplementation(() => Promise.resolve(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fn)
  return fn
}

function mountComponent(component: object, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: {
      plugins: [createPinia()],
      stubs: { FontAwesomeIcon: true, RouterLink: true, AppLink: true },
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

describe('SmileyModal', () => {
  it('exige un code', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(SmileyModal)
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Code requis')
    expect(writes(fetchMock, 'POST')).toHaveLength(0)
  })

  it('crée un smiley avec son code', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(SmileyModal)
    await settle()

    await wrapper.find('#smileyModal-code').setValue(':)')
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'POST')[0]
    expect(String(call[0])).toMatch(/\/smileys$/)
    expect(JSON.parse(call[1].body)).toEqual({ code: ':)' })
  })

  it('affiche le doublon de code signalé par l’API', async () => {
    mockFetch(
      {
        detail: 'Données invalides',
        violations: [{ propertyPath: 'code', message: 'Ce code existe déjà' }],
      },
      422,
    )
    const wrapper = mountComponent(SmileyModal, { smiley: { id: 3, code: ':)' } })
    await settle()

    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Ce code existe déjà')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })
})

describe('ActualityCommentModal', () => {
  const comment = {
    id: 9,
    content: 'Super article',
    hidden: false,
    author: 'joueur',
    actualityTitle: 'Nouvelle extension',
  }

  it('envoie le texte et le statut masqué en PATCH', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(ActualityCommentModal, { comment })
    await settle()

    await wrapper.find('#actualityCommentModal-hidden').setValue(true)
    await wrapper.find('form').trigger('submit')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/actuality_comments\/9$/)
    expect(JSON.parse(call[1].body)).toEqual({ content: 'Super article', hidden: true })
  })

  it('refuse un contenu vide', async () => {
    const fetchMock = mockFetch({})
    const wrapper = mountComponent(ActualityCommentModal, { comment })
    await settle()

    await wrapper.find('#actualityCommentModal-content').setValue('   ')
    await wrapper.find('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Contenu requis')
    expect(writes(fetchMock, 'PATCH')).toHaveLength(0)
  })
})

describe('ActualityCommentView', () => {
  const member = [
    {
      '@id': '/api/actuality_comments/1',
      id: 1,
      content: 'Premier commentaire',
      hidden: false,
      author: 'joueur',
      actualityTitle: 'Titre',
      actuality: { '@id': '/api/actualities/5', id: 5 },
      postedAt: '2026-10-01T10:00:00+00:00',
    },
  ]

  it('masque un commentaire en une action', async () => {
    const fetchMock = mockFetch({ member, totalItems: 1 })
    const wrapper = mountComponent(ActualityCommentView)
    await settle()

    expect(wrapper.text()).toContain('Premier commentaire')
    await wrapper.find('button[aria-label="Masquer"]').trigger('click')
    await settle()

    const call = writes(fetchMock, 'PATCH')[0]
    expect(String(call[0])).toMatch(/\/actuality_comments\/1$/)
    expect(JSON.parse(call[1].body)).toEqual({ hidden: true })
  })
})
